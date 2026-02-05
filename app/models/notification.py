from __future__ import annotations

from datetime import datetime

from extensions import db


class Notification(db.Model):
    __tablename__ = "notifications"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)

    title = db.Column(db.String(140), nullable=False)
    body = db.Column(db.String(255), nullable=True)
    link = db.Column(db.String(255), nullable=True)

    is_read = db.Column(db.Boolean, default=False, nullable=False, index=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False, index=True)

    user = db.relationship("User", back_populates="notifications")

    def __repr__(self) -> str:
        return f"<Notification {self.id} user={self.user_id}>"
