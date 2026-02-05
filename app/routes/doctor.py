import json
import os
from datetime import datetime

from flask import Blueprint, current_app, flash, redirect, render_template, request, url_for
from flask_login import current_user, login_required

from extensions import db
from app.forms import DiseaseEditForm
from app.models.disease import Disease
from app.models.symptom_check import SymptomCheck
from app.services.disease_helpers import (
    build_checklist_from_sections,
    save_uploaded_image,
    split_checklist_sections,
    slugify,
    unique_slug,
)
from app.services.notifications import create_notification, notify_admins
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
    recent_checks = (
        SymptomCheck.query.order_by(SymptomCheck.created_at.desc()).limit(10).all()
    )

    pending_reports = Disease.query.filter(
        (Disease.symptom_checklist_json == None)  # noqa: E711
        | (Disease.symptom_checklist_json == "")
        | (Disease.symptom_checklist_json == "[]")
    ).count()

    return render_template(
        "doctor/dashboard.html",
        disease_count=disease_count,
        pending_reports=pending_reports,
        recent_checks=recent_checks,
    )


@doctor_bp.route("/diseases")
@login_required
@permission_required("manage_diseases")
def diseases():
    diseases = Disease.query.order_by(Disease.name.asc()).all()
    return render_template("doctor/diseases.html", diseases=diseases)


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
                return render_template("doctor/new_disease.html", form=form)

        db.session.add(disease)
        db.session.commit()

        note_body = f"Created report for {disease.name} with {len(checklist_items)} checklist item(s)."
        notify_admins(
            title="New disease report",
            body=note_body,
            link=url_for("doctor.edit_disease", disease_id=disease.id),
        )
        if not current_user.is_admin:
            create_notification(
                user_id=current_user.id,
                title="Symptoms added",
                body=note_body,
                link=url_for("doctor.edit_disease", disease_id=disease.id),
            )

        flash("Disease created.", "success")
        return redirect(url_for("doctor.diseases"))

    return render_template("doctor/new_disease.html", form=form)


@doctor_bp.route("/disease/<int:disease_id>/edit", methods=["GET", "POST"])
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
        old_symptoms = (disease.symptoms or "").strip()
        old_checklist = disease.checklist_items()

        disease.name = form.name.data.strip()
        new_symptoms = form.symptoms.data.strip()
        disease.symptoms = new_symptoms
        disease.cause = form.cause.data.strip()
        disease.treatment = form.treatment.data.strip()
        disease.prevention = form.prevention.data.strip()
        disease.updated_by_id = current_user.id
        disease.updated_at = datetime.utcnow()

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
                    filename_prefix=disease.slug,
                )
                if stored:
                    disease.image_filename = stored
            except ValueError:
                flash("Image must be PNG/JPG/WEBP.", "danger")
                return render_template(
                    "doctor/edit_disease.html", form=form, disease=disease
                )

        db.session.commit()

        symptoms_changed = old_symptoms != new_symptoms
        checklist_changed = old_checklist != checklist_items
        if symptoms_changed or checklist_changed:
            note_body = f"Updated symptoms for {disease.name}."
            notify_admins(
                title="Disease symptoms updated",
                body=note_body,
                link=url_for("doctor.edit_disease", disease_id=disease.id),
            )
            if not current_user.is_admin:
                create_notification(
                    user_id=current_user.id,
                    title="Symptoms updated",
                    body=note_body,
                    link=url_for("doctor.edit_disease", disease_id=disease.id),
                )

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
