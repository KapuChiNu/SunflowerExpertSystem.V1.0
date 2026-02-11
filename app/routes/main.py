import json
import os
from uuid import uuid4

from flask import Blueprint, current_app, flash, jsonify, redirect, render_template, request, session, url_for
from flask_login import current_user, login_required

from extensions import db
from app.forms import DiagnosisForm, FeedbackForm
from app.models.disease import Disease
from app.models.feedback import Feedback
from app.models.symptom_check import SymptomCheck, SymptomCheckResult, SymptomCheckSymptom
from app.utils import permission_required

from app.services.diagnosis_db import diagnose, symptoms_grouped, symptom_index
from app.services.disease_helpers import save_uploaded_image

main_bp = Blueprint("main", __name__)


def _is_developer_account() -> bool:
    # Doctors/admins maintain the system, so feedback submission is for normal users only.
    return (
        current_user.role in {"admin", "doctor"}
        or current_user.has_permission("manage_diseases")
        or current_user.has_permission("access_admin")
    )


@main_bp.route("/")
def home():
    from datetime import datetime, timedelta

    diseases = Disease.query.order_by(Disease.name.asc()).all()
    disease_count = len(diseases)

    # Lightweight dashboard stats (safe for both authed and public)
    total_checks = 0
    today_checks = 0
    delta_label = ""
    recent_checks = []
    latest_check = None
    latest_report_url = None
    latest_matched = []

    if current_user.is_authenticated:
        now = datetime.utcnow()
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)

        total_checks = SymptomCheck.query.filter_by(user_id=current_user.id).count()
        today_checks = (
            SymptomCheck.query.filter(SymptomCheck.user_id == current_user.id)
            .filter(SymptomCheck.created_at >= today_start)
            .count()
        )

        week_start = now - timedelta(days=7)
        prev_week_start = now - timedelta(days=14)
        last_week = (
            SymptomCheck.query.filter(SymptomCheck.user_id == current_user.id)
            .filter(SymptomCheck.created_at >= week_start)
            .count()
        )
        prev_week = (
            SymptomCheck.query.filter(SymptomCheck.user_id == current_user.id)
            .filter(SymptomCheck.created_at >= prev_week_start)
            .filter(SymptomCheck.created_at < week_start)
            .count()
        )
        diff = last_week - prev_week
        if diff > 0:
            delta_label = f"+{diff} vs last week"
        elif diff < 0:
            delta_label = f"{diff} vs last week"
        else:
            delta_label = "No change vs last week"

        # Recent activity list
        recent_checks = (
            SymptomCheck.query.filter_by(user_id=current_user.id)
            .order_by(SymptomCheck.created_at.desc())
            .limit(6)
            .all()
        )

        latest_check = (
            SymptomCheck.query.filter_by(user_id=current_user.id)
            .order_by(SymptomCheck.created_at.desc())
            .first()
        )

        if latest_check and latest_check.top_disease_slug:
            latest_report_url = url_for("main.disease_detail", slug=latest_check.top_disease_slug)
            top_result = (
                SymptomCheckResult.query.filter_by(check_id=latest_check.id, rank=1)
                .first()
            )
            if top_result and top_result.matched_json:
                try:
                    matched_pairs = json.loads(top_result.matched_json or "[]")
                    latest_matched = [m[0] for m in matched_pairs if m and m[0]]
                except Exception:
                    latest_matched = []

    # "Pending" = reports missing a checklist (helps doctors remember to add rules)
    pending_reports = Disease.query.filter(
        (Disease.symptom_checklist_json == None)  # noqa: E711
        | (Disease.symptom_checklist_json == "")
        | (Disease.symptom_checklist_json == "[]")
    ).count()

    # Display labels
    now_local = datetime.now()
    today_label = now_local.strftime("%A, %b %d, %Y")
    time_label = now_local.strftime("%I:%M %p")

    # Simple stable case number for UI (not stored)
    case_id = 1000 + (disease_count % 100) + (total_checks % 50)

    return render_template(
        "home.html",
        diseases=diseases,
        disease_count=disease_count,
        total_checks=total_checks,
        today_checks=today_checks,
        delta_label=delta_label,
        pending_reports=pending_reports,
        today_label=today_label,
        time_label=time_label,
        case_id=case_id,
        recent_checks=recent_checks,
        latest_check=latest_check,
        latest_report_url=latest_report_url,
        latest_matched=latest_matched[:6],
    )


@main_bp.route("/disease/<slug>")
def disease_detail(slug):
    disease = Disease.query.filter_by(slug=slug).first_or_404()

    # If the user came here from the symptom checker, show an explanation box once.
    diagnosis = None
    diag_payload = session.pop("last_diagnosis", None)
    if diag_payload and diag_payload.get("results"):
        results = diag_payload.get("results", [])
        selected_keys = diag_payload.get("selected", [])

        if results and results[0].get("disease_key") == slug:
            idx = symptom_index()
            selected_labels = [idx[k].get("label") for k in selected_keys if k in idx]
            diagnosis = {
                "selected_labels": selected_labels,
                "best": results[0],
                "others": results[1:],
            }

    return render_template("disease_detail.html", disease=disease, diagnosis=diagnosis)


@main_bp.route("/diagnose", methods=["GET", "POST"])
@login_required
@permission_required("use_symptom_checker")
def diagnose_page():
    form = DiagnosisForm()
    grouped = symptoms_grouped()
    selected = []

    if request.method == "POST":
        if not form.validate_on_submit():
            flash("Security token missing/expired. Please try again.", "warning")
            return redirect(url_for("main.diagnose_page"))

        selected = request.form.getlist("symptoms")
        results = diagnose(selected, top_k=3)
        created_check_id = None

        # Store a history row so admins can analyze symptom patterns and improve the system.
        # This is "best effort" logging (it should never break diagnosis UX).
        try:
            idx = symptom_index()
            valid_selected = [k for k in selected if k in idx]

            check = SymptomCheck(
                user_id=current_user.id,
                selected_count=len(valid_selected),
            )

            if results:
                top = results[0]
                check.top_disease_slug = top.get("disease_key")
                check.top_disease_name = top.get("disease_name")
                check.top_score = float(top.get("score", 0.0))
                check.top_percent = int(top.get("percent", 0))

            db.session.add(check)
            db.session.flush()  # assigns check.id
            created_check_id = check.id

            for k in valid_selected:
                s = idx.get(k)
                if not s:
                    continue
                db.session.add(
                    SymptomCheckSymptom(
                        check_id=check.id,
                        symptom_key=k,
                        symptom_label=s.get("label"),
                        category=s.get("category"),
                    )
                )

            for i, r in enumerate(results or [], start=1):
                db.session.add(
                    SymptomCheckResult(
                        check_id=check.id,
                        rank=i,
                        disease_id=r.get("disease_id"),
                        disease_key=r.get("disease_key"),
                        disease_name=r.get("disease_name"),
                        score=float(r.get("score", 0.0)),
                        percent=int(r.get("percent", 0)),
                        matched_json=json.dumps(r.get("matched") or []),
                    )
                )

            db.session.commit()
        except Exception:
            db.session.rollback()
            current_app.logger.exception("Failed to log symptom checker event")

        if results:
            # Store results briefly so we can show an explanation on the disease report page.
            session["last_diagnosis"] = {"selected": selected, "results": results}
            return redirect(url_for("main.disease_detail", slug=results[0]["disease_key"]))

        flash(
            "No strong match found for the selected symptoms. Try selecting additional symptoms (or remove uncertain ones).",
            "warning",
        )
        if created_check_id and not _is_developer_account():
            return redirect(
                url_for(
                    "main.feedback",
                    symptom_check_id=created_check_id,
                    mode="no_match",
                )
            )
        if created_check_id and _is_developer_account():
            flash("Feedback submission is disabled for doctor/admin accounts.", "info")

    return render_template(
        "diagnose.html",
        form=form,
        grouped_symptoms=grouped,
        selected=selected,
    )


@main_bp.route("/feedback", methods=["GET", "POST"])
@login_required
def feedback():
    if _is_developer_account():
        flash("Doctor and admin accounts cannot submit feedback.", "warning")
        return redirect(url_for("main.home"))

    form = FeedbackForm()
    requested_mode = (request.args.get("mode") or "").strip().lower()
    linked_check = None
    require_photo = True

    if request.method == "GET":
        requested_check_id = request.args.get("symptom_check_id", type=int)
        if requested_mode != "no_match" or not requested_check_id:
            flash("Feedback is only available when no symptom match is found.", "info")
            return redirect(url_for("main.diagnose_page"))

        linked_check = SymptomCheck.query.filter_by(
            id=requested_check_id,
            user_id=current_user.id,
        ).first()
        if not linked_check or linked_check.top_disease_slug:
            flash("Invalid no-match symptom check.", "danger")
            return redirect(url_for("main.diagnose_page"))

        if not form.subject.data:
            form.subject.data = f"No match for symptom check #{linked_check.id}"
        form.symptom_check_id.data = str(linked_check.id)
        form.require_photo.data = "1"

    if request.method == "POST":
        posted_check_id = (form.symptom_check_id.data or "").strip()
        if posted_check_id.isdigit():
            linked_check = SymptomCheck.query.filter_by(
                id=int(posted_check_id),
                user_id=current_user.id,
            ).first()
        if not linked_check or linked_check.top_disease_slug:
            flash("Linked symptom check is invalid for no-match feedback.", "danger")
            return redirect(url_for("main.diagnose_page"))

    if form.validate_on_submit():
        stored_photo = None
        if form.photo.data:
            feedback_dir = os.path.join(current_app.root_path, "static", "uploads", "feedback")
            try:
                stored_photo = save_uploaded_image(
                    form.photo.data,
                    images_dir=feedback_dir,
                    filename_prefix=f"feedback_{current_user.id}_{uuid4().hex}",
                )
            except ValueError:
                flash("Photo must be PNG/JPG/WEBP.", "danger")
                return render_template(
                    "feedback.html",
                    form=form,
                    linked_check=linked_check,
                    require_photo=require_photo,
                )

        if require_photo and not stored_photo:
            flash("Please upload at least one photo for no-match symptom feedback.", "danger")
            return render_template(
                "feedback.html",
                form=form,
                linked_check=linked_check,
                require_photo=require_photo,
            )

        item = Feedback(
            user_id=current_user.id,
            subject=form.subject.data.strip(),
            message=form.message.data.strip(),
            symptom_check_id=linked_check.id if linked_check else None,
            photo_filename=stored_photo,
        )
        db.session.add(item)
        db.session.commit()
        flash("Report sent. Thank you for helping improve symptom matching.", "success")
        return redirect(url_for("main.diagnose_page"))

    if not linked_check:
        flash("Feedback is only available when no symptom match is found.", "info")
        return redirect(url_for("main.diagnose_page"))

    return render_template(
        "feedback.html",
        form=form,
        linked_check=linked_check,
        require_photo=require_photo,
    )


@main_bp.route("/search")
def search():
    q = (request.args.get("q") or "").strip()
    diseases = []
    symptom_hits = []

    if q:
        like = f"%{q}%"
        diseases = (
            Disease.query.filter(
                (Disease.name.ilike(like))
                | (Disease.symptoms.ilike(like))
                | (Disease.cause.ilike(like))
                | (Disease.treatment.ilike(like))
                | (Disease.prevention.ilike(like))
            )
            .order_by(Disease.name.asc())
            .all()
        )

        idx = symptom_index()
        q_lower = q.lower()
        for s in idx.values():
            label = (s.get("label") or "").strip()
            if label and q_lower in label.lower():
                symptom_hits.append(label)
            if len(symptom_hits) >= 12:
                break

    return render_template(
        "search.html",
        q=q,
        diseases=diseases,
        symptom_hits=symptom_hits,
    )


@main_bp.route("/search/suggest")
def search_suggest():
    q = (request.args.get("q") or "").strip()
    if len(q) < 2:
        return jsonify([])

    like = f"%{q}%"
    suggestions = []

    diseases = (
        Disease.query.filter(Disease.name.ilike(like))
        .order_by(Disease.name.asc())
        .limit(5)
        .all()
    )
    for d in diseases:
        suggestions.append(
            {"type": "Disease", "label": d.name, "url": url_for("main.disease_detail", slug=d.slug)}
        )

    idx = symptom_index()
    q_lower = q.lower()
    for s in idx.values():
        label = (s.get("label") or "").strip()
        if label and q_lower in label.lower():
            suggestions.append(
                {"type": "Symptom", "label": label, "url": url_for("main.search", q=label)}
            )
        if len(suggestions) >= 10:
            break

    return jsonify(suggestions)
