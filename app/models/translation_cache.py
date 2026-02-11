from datetime import datetime

from extensions import db


class TranslationCache(db.Model):
    __tablename__ = "translation_cache"

    id = db.Column(db.Integer, primary_key=True)
    source_text = db.Column(db.Text, nullable=False)
    target_lang = db.Column(db.String(12), nullable=False, index=True)
    translated_text = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )

    __table_args__ = (
        db.UniqueConstraint(
            "source_text",
            "target_lang",
            name="uq_translation_cache_source_target",
        ),
    )

