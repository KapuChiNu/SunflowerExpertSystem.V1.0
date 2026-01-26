from flask_wtf import FlaskForm
from wtforms import FileField, PasswordField, SelectField, StringField, SubmitField, TextAreaField
from wtforms.validators import DataRequired, Email, EqualTo, Length, Optional


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
    symptom_checklist_leaf = TextAreaField(
        "Leaf symptoms (one per line)",
        validators=[Optional()],
    )
    symptom_checklist_leaf_head = TextAreaField(
        "Leaf / Head symptoms (one per line)",
        validators=[Optional()],
    )
    symptom_checklist_whole_plant = TextAreaField(
        "Whole plant symptoms (one per line)",
        validators=[Optional()],
    )
    symptom_checklist_stem = TextAreaField(
        "Stem symptoms (one per line)",
        validators=[Optional()],
    )
    symptom_checklist_head = TextAreaField(
        "Head symptoms (one per line)",
        validators=[Optional()],
    )
    symptom_checklist_root = TextAreaField(
        "Root symptoms (one per line)",
        validators=[Optional()],
    )
    symptom_checklist_environment = TextAreaField(
        "Environment symptoms (one per line)",
        validators=[Optional()],
    )
    image = FileField("Replace image (PNG/JPG/WEBP)", validators=[Optional()])
    submit = SubmitField("Save changes")

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


class AdminUserEditForm(FlaskForm):
    username = StringField("Username", validators=[DataRequired(), Length(min=3, max=80)])
    email = StringField("Email", validators=[DataRequired(), Email(), Length(max=120)])
    role = SelectField("Role", validators=[DataRequired()], choices=[])

    new_password = PasswordField(
        "Set new password (optional)", validators=[Optional(), Length(min=6, max=128)]
    )
    confirm_new_password = PasswordField(
        "Confirm new password", validators=[Optional(), EqualTo("new_password")]
    )

    submit = SubmitField("Save")


class FeedbackForm(FlaskForm):
    subject = StringField("Subject", validators=[DataRequired(), Length(min=4, max=160)])
    message = TextAreaField("Message", validators=[DataRequired(), Length(min=10)])
    submit = SubmitField("Send feedback")
