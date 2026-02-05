from flask import Blueprint, flash, redirect, render_template, request, url_for
from flask_login import current_user, login_required

from extensions import db
from app.forms import ProfileForm
from app.models.notification import Notification
from app.models.user import User
from app.utils import permission_required

user_bp = Blueprint("user", __name__, url_prefix="/user")


@user_bp.route("/")
@login_required
def index():
    return redirect(url_for("user.profile"))


@user_bp.route("/dashboard")
@login_required
def dashboard():
    return redirect(url_for("user.profile"))


@user_bp.route("/profile", methods=["GET", "POST"])
@login_required
@permission_required("edit_own_profile")
def profile():
    form = ProfileForm(obj=current_user)

    if form.validate_on_submit():
        new_username = form.username.data.strip()
        new_email = form.email.data.strip().lower()

        # Unique checks (excluding myself)
        if User.query.filter(User.username == new_username, User.id != current_user.id).first():
            flash("Username already taken.", "danger")
            return render_template("user/profile.html", form=form)
        if User.query.filter(User.email == new_email, User.id != current_user.id).first():
            flash("Email already registered.", "danger")
            return render_template("user/profile.html", form=form)

        current_user.username = new_username
        current_user.email = new_email

        # Optional password change
        if form.new_password.data:
            if not form.current_password.data or not current_user.check_password(
                form.current_password.data
            ):
                flash("Current password is incorrect.", "danger")
                return render_template("user/profile.html", form=form)
            current_user.set_password(form.new_password.data)

        db.session.commit()
        flash("Profile updated.", "success")
        return redirect(url_for("user.profile"))

    return render_template("user/profile.html", form=form)


@user_bp.route("/notifications/read", methods=["POST"])
@login_required
def mark_notifications_read():
    Notification.query.filter_by(user_id=current_user.id, is_read=False).update(
        {Notification.is_read: True}
    )
    db.session.commit()
    return redirect(request.referrer or url_for("main.home"))
