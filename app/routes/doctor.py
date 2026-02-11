import json
import os
from datetime import datetime

from flask import Blueprint, current_app, flash, redirect, render_template, request, url_for
from flask_login import current_user, login_required

from extensions import db
from app.forms import DiseaseEditForm, DiseaseSymptomsForm
from app.models.disease import Disease
from app.models.feedback import Feedback
from app.models.symptom_check import SymptomCheck
from app.services.disease_helpers import (
    build_checklist_from_sections,
    save_uploaded_image,
    split_checklist_sections,
    slugify,
    unique_slug,
)
from app.services.symptom_admin import (
    add_symptom_to_disease,
    collect_all_symptoms,
    delete_symptom_globally,
    edit_symptom_globally,
)
from app.utils import permission_required


doctor_bp = Blueprint("doctor", __name__, url_prefix="/doctor")

@doctor_bp.route("/")
@login_required
@permission_required("manage_diseases")
def index():
    return redirect(url_for("doctor.dashboard"))


@doctor_bp.route("/dashboard")
@login_required
@permission_required("manage_diseases")
def dashboard():
    disease_count = Disease.query.count()
    recent_checks = SymptomCheck.query.order_by(SymptomCheck.created_at.desc()).limit(10).all()

    pending_reports = Disease.query.filter(
        (Disease.symptom_checklist_json == None)  # noqa: E711
        | (Disease.symptom_checklist_json == "")
        | (Disease.symptom_checklist_json == "[]")
    ).count()

    open_feedback = Feedback.query.filter_by(status="open").count()

    return render_template(
        "doctor/dashboard.html",
        disease_count=disease_count,
        pending_reports=pending_reports,
        recent_checks=recent_checks,
        open_feedback=open_feedback,
    )


@doctor_bp.route("/diseases")
@login_required
@permission_required("manage_diseases")
def diseases():
    diseases = Disease.query.order_by(Disease.name.asc()).all()
    return render_template("doctor/diseases.html", diseases=diseases)


@doctor_bp.route("/checklists")
@login_required
@permission_required("manage_diseases")
def checklists():
    diseases = Disease.query.order_by(Disease.name.asc()).all()
    rows = []
    for disease in diseases:
        items = disease.checklist_items()
        symptom_labels = []
        for item in items:
            if isinstance(item, dict):
                label = (item.get("label") or "").strip()
            else:
                label = str(item).strip()
            if label:
                symptom_labels.append(label)

        rows.append(
            {
                "disease": disease,
                "symptom_labels": symptom_labels,
                "item_count": len(symptom_labels),
                "ready": bool(symptom_labels),
            }
        )

    return render_template("doctor/checklists.html", rows=rows)


@doctor_bp.route("/symptoms/all")
@login_required
@permission_required("manage_diseases")
def all_symptoms():
    diseases = Disease.query.order_by(Disease.name.asc()).all()
    symptoms = collect_all_symptoms(diseases)

    return render_template(
        "doctor/all_symptoms.html",
        symptoms=symptoms,
        diseases=diseases,
    )


@doctor_bp.route("/symptoms/all/add", methods=["POST"])
@login_required
@permission_required("manage_diseases")
def add_system_symptom():
    disease_id = request.form.get("disease_id", type=int)
    label = (request.form.get("label") or "").strip()
    category = (request.form.get("category") or "").strip()

    if not disease_id:
        flash("Choose a disease before adding a symptom.", "warning")
        return redirect(url_for("doctor.all_symptoms"))
    if not label:
        flash("Symptom name is required.", "danger")
        return redirect(url_for("doctor.all_symptoms"))

    disease = Disease.query.get_or_404(disease_id)
    changed = add_symptom_to_disease(disease, label=label, category=category)
    if changed:
        disease.updated_by_id = current_user.id
        disease.updated_at = datetime.utcnow()
        db.session.commit()
        flash(f'Added "{label}" to {disease.name}.', "success")
    else:
        db.session.rollback()
        flash("This symptom already exists for the selected disease.", "info")

    return redirect(url_for("doctor.all_symptoms"))


@doctor_bp.route("/symptoms/all/edit", methods=["POST"])
@login_required
@permission_required("manage_diseases")
def edit_system_symptom():
    old_label = (request.form.get("old_label") or "").strip()
    old_category = (request.form.get("old_category") or "").strip()
    new_label = (request.form.get("new_label") or "").strip()
    new_category = (request.form.get("new_category") or "").strip()

    if not old_label or not old_category:
        flash("Original symptom data is missing.", "danger")
        return redirect(url_for("doctor.all_symptoms"))
    if not new_label:
        flash("Updated symptom name is required.", "danger")
        return redirect(url_for("doctor.all_symptoms"))

    diseases = Disease.query.order_by(Disease.name.asc()).all()
    affected_diseases, affected_items, changed_ids = edit_symptom_globally(
        diseases,
        old_label=old_label,
        old_category=old_category,
        new_label=new_label,
        new_category=new_category,
    )
    if affected_items:
        now = datetime.utcnow()
        for disease in diseases:
            if disease.id in changed_ids:
                disease.updated_by_id = current_user.id
                disease.updated_at = now
        db.session.commit()
        flash(
            f'Symptom updated in {affected_diseases} disease(s), {affected_items} item(s).',
            "success",
        )
    else:
        db.session.rollback()
        flash("No matching symptom found to edit.", "warning")

    return redirect(url_for("doctor.all_symptoms"))


@doctor_bp.route("/symptoms/all/delete", methods=["POST"])
@login_required
@permission_required("manage_diseases")
def delete_system_symptom():
    label = (request.form.get("label") or "").strip()
    category = (request.form.get("category") or "").strip()
    if not label or not category:
        flash("Symptom data is missing.", "danger")
        return redirect(url_for("doctor.all_symptoms"))

    diseases = Disease.query.order_by(Disease.name.asc()).all()
    affected_diseases, removed_items, changed_ids = delete_symptom_globally(
        diseases,
        label=label,
        category=category,
    )
    if removed_items:
        now = datetime.utcnow()
        for disease in diseases:
            if disease.id in changed_ids:
                disease.updated_by_id = current_user.id
                disease.updated_at = now
        db.session.commit()
        flash(
            f'Symptom removed from {affected_diseases} disease(s), {removed_items} item(s).',
            "info",
        )
    else:
        db.session.rollback()
        flash("No matching symptom found to delete.", "warning")

    return redirect(url_for("doctor.all_symptoms"))


@doctor_bp.route("/checklist/new", methods=["GET", "POST"])
@login_required
@permission_required("manage_diseases")
def new_checklist():
    disease_id = request.args.get("disease_id", type=int)
    if disease_id:
        return redirect(url_for("doctor.edit_checklist", disease_id=disease_id))

    flash("Choose a disease from the Manage Symptoms list.", "info")
    return redirect(url_for("doctor.checklists"))


@doctor_bp.route("/checklist/<int:disease_id>/edit", methods=["GET", "POST"])
@login_required
@permission_required("manage_diseases")
def edit_checklist(disease_id: int):
    disease = Disease.query.get_or_404(disease_id)
    form = DiseaseSymptomsForm()

    if request.method == "GET":
        sections = split_checklist_sections(disease.checklist_items())
        form.symptom_checklist_leaf.data = sections["leaf"]
        form.symptom_checklist_leaf_head.data = sections["leaf_head"]
        form.symptom_checklist_whole_plant.data = sections["whole_plant"]
        form.symptom_checklist_stem.data = sections["stem"]
        form.symptom_checklist_head.data = sections["head"]
        form.symptom_checklist_root.data = sections["root"]
        form.symptom_checklist_seedling.data = sections["seedling"]
        form.symptom_checklist_environment.data = sections["environment"]

    if form.validate_on_submit():
        checklist_items = build_checklist_from_sections(
            leaf_text=form.symptom_checklist_leaf.data,
            leaf_head_text=form.symptom_checklist_leaf_head.data,
            whole_plant_text=form.symptom_checklist_whole_plant.data,
            stem_text=form.symptom_checklist_stem.data,
            head_text=form.symptom_checklist_head.data,
            root_text=form.symptom_checklist_root.data,
            environment_text=form.symptom_checklist_environment.data,
            seedling_text=form.symptom_checklist_seedling.data,
        )
        disease.symptom_checklist_json = json.dumps(checklist_items)
        disease.updated_by_id = current_user.id
        disease.updated_at = datetime.utcnow()
        db.session.commit()
        flash("Symptom checklist updated.", "success")
        return redirect(url_for("doctor.checklists"))

    return render_template("doctor/checklist_form.html", form=form, disease=disease)


@doctor_bp.route("/symptom-checks")
@login_required
@permission_required("view_symptom_checks")
def symptom_checks():
    checks = SymptomCheck.query.order_by(SymptomCheck.created_at.desc()).limit(200).all()
    return render_template("doctor/symptom_checks.html", checks=checks)


@doctor_bp.route("/symptom-check/<int:check_id>")
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
        "doctor/symptom_check_detail.html",
        check=check,
        parsed_results=parsed_results,
    )


@doctor_bp.route("/feedback")
@login_required
@permission_required("manage_diseases")
def feedback():
    feedback_items = Feedback.query.order_by(Feedback.created_at.desc()).all()
    return render_template("doctor/feedback.html", feedback_items=feedback_items)


@doctor_bp.route("/feedback/<int:feedback_id>/resolve", methods=["POST"])
@login_required
@permission_required("manage_diseases")
def resolve_feedback(feedback_id: int):
    item = Feedback.query.get_or_404(feedback_id)
    if item.status != "resolved":
        item.status = "resolved"
        db.session.commit()
        flash("Feedback marked as resolved.", "success")
    return redirect(url_for("doctor.feedback"))


@doctor_bp.route("/disease/new", methods=["GET", "POST"])
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
            created_by_id=current_user.id,
            updated_by_id=current_user.id,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )

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
                return render_template("doctor/new_disease.html", form=form)

        db.session.add(disease)
        db.session.commit()

        flash("Disease created. Now add symptom checklist items.", "success")
        return redirect(url_for("doctor.edit_checklist", disease_id=disease.id))

    return render_template("doctor/new_disease.html", form=form)


@doctor_bp.route("/disease/<int:disease_id>/edit", methods=["GET", "POST"])
@login_required
@permission_required("manage_diseases")
def edit_disease(disease_id: int):
    disease = Disease.query.get_or_404(disease_id)
    form = DiseaseEditForm(obj=disease)

    if form.validate_on_submit():
        disease.name = form.name.data.strip()
        disease.symptoms = form.symptoms.data.strip()
        disease.cause = form.cause.data.strip()
        disease.treatment = form.treatment.data.strip()
        disease.prevention = form.prevention.data.strip()
        disease.updated_by_id = current_user.id
        disease.updated_at = datetime.utcnow()

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
                return render_template("doctor/edit_disease.html", form=form, disease=disease)

        db.session.commit()

        flash("Disease updated.", "success")
        return redirect(url_for("doctor.diseases"))

    return render_template("doctor/edit_disease.html", form=form, disease=disease)


@doctor_bp.route("/disease/<int:disease_id>/delete", methods=["POST"])
@login_required
@permission_required("delete_diseases")
def delete_disease(disease_id: int):
    disease = Disease.query.get_or_404(disease_id)

    if disease.image_filename:
        images_dir = os.path.join(current_app.root_path, "static", "images")
        img_path = os.path.join(images_dir, disease.image_filename)
        try:
            if os.path.exists(img_path):
                os.remove(img_path)
        except OSError:
            pass

    db.session.delete(disease)
    db.session.commit()
    flash("Disease deleted.", "info")
    return redirect(url_for("doctor.diseases"))
