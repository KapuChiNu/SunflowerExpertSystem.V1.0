import os

from flask import Flask

from config import Config
from extensions import csrf, db, login_manager, migrate


def create_app():
    app = Flask(__name__, instance_relative_config=True)
    app.config.from_object(Config)

    # Ensure instance folder exists (SQLite DB file will live here)
    os.makedirs(app.instance_path, exist_ok=True)

    db.init_app(app)
    migrate.init_app(app, db)

    login_manager.init_app(app)
    csrf.init_app(app)

    # Blueprints
    from app.routes.main import main_bp
    from app.routes.auth import auth_bp
    from app.routes.user import user_bp
    from app.routes.admin import admin_bp
    from app.routes.doctor import doctor_bp

    app.register_blueprint(main_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(user_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(doctor_bp)

    @app.context_processor
    def inject_notifications():
        from flask_login import current_user
        from sqlalchemy.exc import OperationalError

        if not current_user.is_authenticated:
            return {}

        try:
            from app.models.notification import Notification

            notifications = (
                Notification.query.filter_by(user_id=current_user.id)
                .order_by(Notification.created_at.desc())
                .limit(6)
                .all()
            )
            unread_count = (
                Notification.query.filter_by(user_id=current_user.id, is_read=False).count()
            )
        except OperationalError:
            return {}

        return {
            "notifications": notifications,
            "notification_unread_count": unread_count,
        }

    # Create tables + seed sample data on first run
    with app.app_context():
        # Import models so SQLAlchemy registers them before create_all()
        from app.models import disease, feedback, notification, rbac, symptom_check, user  # noqa: F401
        from app.services.schema_guard import ensure_schema_columns
        from app.services.seed import seed_if_empty

        db.create_all()
        ensure_schema_columns()
        seed_if_empty()

    return app
