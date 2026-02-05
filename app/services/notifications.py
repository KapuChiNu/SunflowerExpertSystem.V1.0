from __future__ import annotations

from flask import current_app
from sqlalchemy.exc import SQLAlchemyError

from extensions import db
from app.models.notification import Notification
from app.models.rbac import Role
from app.models.user import User


def _admin_user_ids() -> set[int]:
    ids = {u.id for u in User.query.filter(User.role == "admin").all()}
    try:
        ids.update(
            {
                u.id
                for u in User.query.join(Role, User.role_id == Role.id)
                .filter(Role.name == "admin")
                .all()
            }
        )
    except Exception:
        pass
    return ids


def create_notifications(
    *,
    user_ids: list[int] | set[int],
    title: str,
    body: str | None = None,
    link: str | None = None,
) -> int:
    recipients = {uid for uid in (user_ids or []) if uid}
    if not recipients or not title:
        return 0

    try:
        notes = [
            Notification(user_id=uid, title=title, body=body, link=link)
            for uid in recipients
        ]
        db.session.add_all(notes)
        db.session.commit()
        return len(notes)
    except SQLAlchemyError:
        db.session.rollback()
        current_app.logger.exception("Failed to create notifications")
        return 0


def notify_admins(
    *,
    title: str,
    body: str | None = None,
    link: str | None = None,
) -> int:
    admin_ids = _admin_user_ids()
    return create_notifications(user_ids=admin_ids, title=title, body=body, link=link)


def create_notification(
    *,
    user_id: int,
    title: str,
    body: str | None = None,
    link: str | None = None,
) -> Notification | None:
    if not user_id or not title:
        return None

    try:
        note = Notification(user_id=user_id, title=title, body=body, link=link)
        db.session.add(note)
        db.session.commit()
        return note
    except SQLAlchemyError:
        db.session.rollback()
        current_app.logger.exception("Failed to create notification")
        return None
