from __future__ import annotations

from sqlalchemy import text

from extensions import db


def _sqlite_columns(table_name: str) -> set[str]:
    rows = db.session.execute(text(f"PRAGMA table_info({table_name})")).mappings().all()
    return {row.get("name") for row in rows if row.get("name")}


def ensure_schema_columns() -> None:
    """Best-effort schema guard for SQLite when migrations were skipped."""
    if not db.engine.url.drivername.startswith("sqlite"):
        return

    existing = _sqlite_columns("diseases")

    if "image_filename" not in existing:
        db.session.execute(text("ALTER TABLE diseases ADD COLUMN image_filename VARCHAR(200)"))

    if "symptom_checklist_json" not in existing:
        db.session.execute(
            text("ALTER TABLE diseases ADD COLUMN symptom_checklist_json TEXT DEFAULT '[]'")
        )

    if "created_by_id" not in existing:
        db.session.execute(text("ALTER TABLE diseases ADD COLUMN created_by_id INTEGER"))

    if "updated_by_id" not in existing:
        db.session.execute(text("ALTER TABLE diseases ADD COLUMN updated_by_id INTEGER"))

    if "created_at" not in existing:
        db.session.execute(text("ALTER TABLE diseases ADD COLUMN created_at DATETIME"))

    if "updated_at" not in existing:
        db.session.execute(text("ALTER TABLE diseases ADD COLUMN updated_at DATETIME"))

    db.session.commit()
