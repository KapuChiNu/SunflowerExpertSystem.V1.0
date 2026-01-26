import json
import os

from flask import Blueprint, current_app, flash, redirect, render_template, request, url_for
from flask_login import login_required

from extensions import db
from app.utils import permission_required
from app.forms import AdminUserEditForm, DiseaseEditForm
from app.models.disease import Disease
from app.models.feedback import Feedback
from app.models.rbac import Role
from app.models.symptom_check import SymptomCheck
from app.models.user import User
from app.services.disease_helpers import (
    build_checklist_from_sections,
    save_uploaded_image,
    split_checklist_sections,
    slugify,
    unique_slug,
)

admin_bp = Blueprint("admin", __name__, url_prefix="/admin")


@admin_bp.route("/dashboard")
@login_required
@permission_required("access_admin")
def dashboard():
    disease_count = Disease.query.count()
    user_count = User.query.count()
    recent_checks = (
        SymptomCheck.query.join(User)
        .filter(User.role != "admin")
        .order_by(SymptomCheck.created_at.desc())
        .limit(10)
        .all()
    )
    feedback_open = Feedback.query.filter_by(status="open").count()
    return render_template(
        "admin/dashboard.html",
        disease_count=disease_count,
        user_count=user_count,
        recent_checks=recent_checks,
        feedback_open=feedback_open,
    )


@admin_bp.route("/feedback")
@login_required
@permission_required("access_admin")
def feedback():
    feedback_items = Feedback.query.order_by(Feedback.created_at.desc()).all()
    return render_template("admin/feedback.html", feedback_items=feedback_items)


@admin_bp.route("/feedback/<int:feedback_id>/resolve", methods=["POST"])
@login_required
@permission_required("access_admin")
def resolve_feedback(feedback_id: int):
    item = Feedback.query.get_or_404(feedback_id)
    if item.status != "resolved":
        item.status = "resolved"
        db.session.commit()
        flash("Feedback marked as resolved.", "success")
    return redirect(url_for("admin.feedback"))


@admin_bp.route("/diseases")
@login_required
@permission_required("manage_diseases")
def diseases():
    diseases = Disease.query.order_by(Disease.name.asc()).all()
    return render_template("admin/diseases.html", diseases=diseases)


@admin_bp.route("/disease/new", methods=["GET", "POST"])
@login_required
@permission_required("manage_diseases")
def new_disease():
    form = DiseaseEditForm()
    form.submit.label.text = "Create disease"

    if form.validate_on_submit():
        name = form.name.data.strip()
        slug = unique_slug(Disease, slugify(name))

        disease = Disease(
            slug=slug,
            name=name,
            symptoms=form.symptoms.data.strip(),
            cause=form.cause.data.strip(),
            treatment=form.treatment.data.strip(),
            prevention=form.prevention.data.strip(),
        )

        # Store checklist directly on the disease (no extra tables)
        checklist_items = build_checklist_from_sections(
            form.symptom_checklist_leaf.data,
            form.symptom_checklist_leaf_head.data,
            form.symptom_checklist_whole_plant.data,
            form.symptom_checklist_stem.data,
            form.symptom_checklist_head.data,
            form.symptom_checklist_root.data,
            form.symptom_checklist_environment.data,
        )
        disease.symptom_checklist_json = json.dumps(checklist_items)

        if form.image.data:
            images_dir = os.path.join(current_app.root_path, "static", "images")
            try:
                stored = save_uploaded_image(
                    form.image.data,
                    images_dir=images_dir,
                    filename_prefix=slug,
                )
                disease.image_filename = stored
            except ValueError:
                flash("Image must be PNG/JPG/WEBP.", "danger")
                return render_template("admin/new_disease.html", form=form)

        db.session.add(disease)
        db.session.commit()
        flash("Disease created.", "success")
        return redirect(url_for("admin.diseases"))

    return render_template("admin/new_disease.html", form=form)


@admin_bp.route("/disease/<int:disease_id>/edit", methods=["GET", "POST"])
@login_required
@permission_required("manage_diseases")
def edit_disease(disease_id: int):
    disease = Disease.query.get_or_404(disease_id)
    form = DiseaseEditForm(obj=disease)

    if request.method == "GET":
        sections = split_checklist_sections(disease.checklist_items())
        form.symptom_checklist_leaf.data = sections["leaf"]
        form.symptom_checklist_leaf_head.data = sections["leaf_head"]
        form.symptom_checklist_whole_plant.data = sections["whole_plant"]
        form.symptom_checklist_stem.data = sections["stem"]
        form.symptom_checklist_head.data = sections["head"]
        form.symptom_checklist_root.data = sections["root"]
        form.symptom_checklist_environment.data = sections["environment"]

    if form.validate_on_submit():
        disease.name = form.name.data.strip()
        disease.symptoms = form.symptoms.data.strip()
        disease.cause = form.cause.data.strip()
        disease.treatment = form.treatment.data.strip()
        disease.prevention = form.prevention.data.strip()

        # Update symptom checklist stored directly on the disease
        checklist_items = build_checklist_from_sections(
            form.symptom_checklist_leaf.data,
            form.symptom_checklist_leaf_head.data,
            form.symptom_checklist_whole_plant.data,
            form.symptom_checklist_stem.data,
            form.symptom_checklist_head.data,
            form.symptom_checklist_root.data,
            form.symptom_checklist_environment.data,
        )
        disease.symptom_checklist_json = json.dumps(checklist_items)

        # Optional image replacement
        if form.image.data:
            images_dir = os.path.join(current_app.root_path, "static", "images")
            try:
                stored = save_uploaded_image(
                    form.image.data,
                    images_dir=images_dir,
                    filename_prefix=disease.slug,
                )
                if stored:
                    disease.image_filename = stored
            except ValueError:
                flash("Image must be PNG/JPG/WEBP.", "danger")
                return render_template("admin/edit_disease.html", form=form, disease=disease)

        db.session.commit()
        flash("Disease updated.", "success")
        return redirect(url_for("admin.diseases"))

    return render_template("admin/edit_disease.html", form=form, disease=disease)


@admin_bp.route("/disease/<int:disease_id>/delete", methods=["POST"])
@login_required
@permission_required("delete_diseases")
def delete_disease(disease_id: int):
    disease = Disease.query.get_or_404(disease_id)

    # Best-effort: remove stored image file (if any)
    if disease.image_filename:
        images_dir = os.path.join(current_app.root_path, "static", "images")
        img_path = os.path.join(images_dir, disease.image_filename)
        try:
            if os.path.exists(img_path):
                os.remove(img_path)
        except OSError:
            # If deletion fails, still delete the DB record.
            pass

    db.session.delete(disease)
    db.session.commit()
    flash("Disease deleted.", "info")
    return redirect(url_for("admin.diseases"))


@admin_bp.route("/users")
@login_required
@permission_required("manage_users")
def users():
    users = User.query.order_by(User.created_at.desc()).all()

    # Latest symptom check per user (single query, then pick first per user).
    latest_checks = (
        SymptomCheck.query.order_by(SymptomCheck.created_at.desc()).all()
    )
    latest_check_by_user = {}
    for c in latest_checks:
        if c.user_id not in latest_check_by_user:
            latest_check_by_user[c.user_id] = c

    return render_template(
        "admin/users.html",
        users=users,
        latest_check_by_user=latest_check_by_user,
    )


@admin_bp.route("/user/<int:user_id>/edit", methods=["GET", "POST"])
@login_required
@permission_required("manage_users")
def edit_user(user_id: int):
    u = User.query.get_or_404(user_id)

    form = AdminUserEditForm(obj=u)
    roles = Role.query.order_by(Role.name.asc()).all()
    form.role.choices = [(r.name, r.name) for r in roles] or [
        ("user", "user"),
        ("admin", "admin"),
    ]

    if request.method == "GET":
        form.role.data = u.role

    if form.validate_on_submit():
        new_username = form.username.data.strip()
        new_email = form.email.data.strip().lower()
        new_role = form.role.data

        if User.query.filter(User.username == new_username, User.id != u.id).first():
            flash("Username already taken.", "danger")
            return render_template("admin/edit_user.html", form=form, user=u)
        if User.query.filter(User.email == new_email, User.id != u.id).first():
            flash("Email already registered.", "danger")
            return render_template("admin/edit_user.html", form=form, user=u)

        u.username = new_username
        u.email = new_email
        u.role = new_role
        role_row = Role.query.filter_by(name=new_role).first()
        u.role_id = role_row.id if role_row else None

        if form.new_password.data:
            u.set_password(form.new_password.data)

        db.session.commit()
        flash("User updated.", "success")
        return redirect(url_for("admin.users"))

    return render_template("admin/edit_user.html", form=form, user=u)


@admin_bp.route("/user/<int:user_id>/delete", methods=["POST"])
@login_required
@permission_required("manage_users")
def delete_user(user_id: int):
    from flask_login import current_user

    if user_id == current_user.id:
        flash("You cannot delete your own account while logged in.", "warning")
        return redirect(url_for("admin.users"))

    u = User.query.get_or_404(user_id)
    db.session.delete(u)
    db.session.commit()
    flash("User deleted.", "info")
    return redirect(url_for("admin.users"))


@admin_bp.route("/user/<int:user_id>/symptom-checks/delete", methods=["POST"])
@login_required
@permission_required("access_admin")
def delete_user_symptom_checks(user_id: int):
    u = User.query.get_or_404(user_id)

    checks = SymptomCheck.query.filter_by(user_id=u.id).all()
    for c in checks:
        db.session.delete(c)

    db.session.commit()
    flash(f"Deleted {len(checks)} symptom check(s) for {u.username}.", "info")
    return redirect(url_for("admin.users"))


@admin_bp.route("/symptom-checks")
@login_required
@permission_required("view_symptom_checks")
def symptom_checks():
    checks = (
        SymptomCheck.query.join(User)
        .filter(User.role != "admin")
        .order_by(SymptomCheck.created_at.desc())
        .limit(200)
        .all()
    )
    return render_template("admin/symptom_checks.html", checks=checks)


@admin_bp.route("/symptom-check/<int:check_id>")
@login_required
@permission_required("view_symptom_checks")
def symptom_check_detail(check_id: int):
    check = SymptomCheck.query.get_or_404(check_id)

    parsed_results = []
    for r in check.results:
        try:
            matched = json.loads(r.matched_json) if r.matched_json else []
        except Exception:
            matched = []

        disease_id = r.disease_id
        if not disease_id and r.disease_key:
            disease_row = Disease.query.filter_by(slug=r.disease_key).first()
            disease_id = disease_row.id if disease_row else None

        parsed_results.append(
            {
                "rank": r.rank,
                "disease_id": disease_id,
                "disease_key": r.disease_key,
                "disease_name": r.disease_name,
                "percent": r.percent,
                "score": r.score,
                "matched": matched,
            }
        )

    return render_template(
        "admin/symptom_check_detail.html",
        check=check,
        parsed_results=parsed_results,
    )


@admin_bp.route("/symptom-check/<int:check_id>/delete", methods=["POST"])
@login_required
@permission_required("access_admin")
def delete_symptom_check(check_id: int):
    check = SymptomCheck.query.get_or_404(check_id)
    db.session.delete(check)
    db.session.commit()
    flash("Symptom check deleted.", "info")
    return redirect(url_for("admin.symptom_checks"))
