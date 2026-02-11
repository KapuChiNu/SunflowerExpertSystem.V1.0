from flask_wtf import FlaskForm
from wtforms import (
    FileField,
    HiddenField,
    PasswordField,
    SelectField,
    SelectMultipleField,
    StringField,
    SubmitField,
    TextAreaField,
)
from wtforms.validators import DataRequired, Email, EqualTo, Length, Optional, Regexp


class RegisterForm(FlaskForm):
    username = StringField("Username", validators=[DataRequired(), Length(min=3, max=80)])
    email = StringField("Email", validators=[DataRequired(), Email(), Length(max=120)])
    password = PasswordField("Password", validators=[DataRequired(), Length(min=6, max=128)])
    confirm_password = PasswordField(
        "Confirm Password", validators=[DataRequired(), EqualTo("password")]
    )
    submit = SubmitField("Create account")


class LoginForm(FlaskForm):
    username_or_email = StringField(
        "Username or Email", validators=[DataRequired(), Length(max=120)]
    )
    password = PasswordField("Password", validators=[DataRequired()])
    submit = SubmitField("Log in")


class DiseaseEditForm(FlaskForm):
    name = StringField("Name", validators=[DataRequired(), Length(max=120)])
    symptoms = TextAreaField("Symptoms", validators=[DataRequired()])
    cause = TextAreaField("Cause", validators=[DataRequired()])
    treatment = TextAreaField("Treatment", validators=[DataRequired()])
    prevention = TextAreaField("Prevention", validators=[DataRequired()])
    image = FileField("Replace image (PNG/JPG/WEBP)", validators=[Optional()])
    submit = SubmitField("Save changes")


class DiseaseSymptomsForm(FlaskForm):

    symptom_checklist_leaf = TextAreaField(
        "1) Leaf symptoms (one per line)",
        validators=[Optional()],
    )
    symptom_checklist_leaf_head = TextAreaField(
        "2) Leaf / Head symptoms (one per line)",
        validators=[Optional()],
    )
    symptom_checklist_whole_plant = TextAreaField(
        "3) Whole plant symptoms (one per line)",
        validators=[Optional()],
    )
    symptom_checklist_stem = TextAreaField(
        "4) Stem symptoms (one per line)",
        validators=[Optional()],
    )
    symptom_checklist_head = TextAreaField(
        "5) Head symptoms (one per line)",
        validators=[Optional()],
    )
    symptom_checklist_root = TextAreaField(
        "6) Root symptoms (one per line)",
        validators=[Optional()],
    )
    symptom_checklist_seedling = TextAreaField(
        "7) Seed / Seedling symptoms (one per line)",
        validators=[Optional()],
    )
    symptom_checklist_environment = TextAreaField(
        "8) Environment symptoms (one per line)",
        validators=[Optional()],
    )

    submit = SubmitField("Save symptom items")


class DiagnosisForm(FlaskForm):
    """CSRF-protected form wrapper for the symptom checker."""

    submit = SubmitField("Check Symptoms")


class ProfileForm(FlaskForm):
    username = StringField("Username", validators=[DataRequired(), Length(min=3, max=80)])
    email = StringField("Email", validators=[DataRequired(), Email(), Length(max=120)])

    current_password = PasswordField(
        "Current password (required to change password)", validators=[Optional()]
    )
    new_password = PasswordField(
        "New password", validators=[Optional(), Length(min=6, max=128)]
    )
    confirm_new_password = PasswordField(
        "Confirm new password", validators=[Optional(), EqualTo("new_password")]
    )

    submit = SubmitField("Save changes")


class AdminUserRoleForm(FlaskForm):
    role = SelectField("Role", validators=[DataRequired()], choices=[])
    submit = SubmitField("Save role")


class RoleCreateForm(FlaskForm):
    name = StringField(
        "Role name",
        validators=[
            DataRequired(),
            Length(min=2, max=50),
            Regexp(
                r"^[a-z0-9_-]+$",
                message="Use lowercase letters, numbers, dashes, or underscores only.",
            ),
        ],
    )
    description = StringField("Description", validators=[Optional(), Length(max=255)])
    permissions = SelectMultipleField("Permissions", choices=[], coerce=int, validators=[Optional()])
    submit = SubmitField("Create role")


class FeedbackForm(FlaskForm):
    symptom_check_id = HiddenField("Symptom check ID", validators=[Optional()])
    require_photo = HiddenField("Require photo", validators=[Optional()])
    subject = StringField("Subject", validators=[DataRequired(), Length(min=4, max=160)])
    message = TextAreaField("Message", validators=[DataRequired(), Length(min=10)])
    photo = FileField("Upload photo evidence (PNG/JPG/WEBP)", validators=[Optional()])
    submit = SubmitField("Send feedback")
