import json

from extensions import db


class Disease(db.Model):
    __tablename__ = "diseases"

    id = db.Column(db.Integer, primary_key=True)
    slug = db.Column(db.String(80), unique=True, nullable=False)
    name = db.Column(db.String(120), nullable=False)
    symptoms = db.Column(db.Text, nullable=False)
    cause = db.Column(db.Text, nullable=False)
    treatment = db.Column(db.Text, nullable=False)
    prevention = db.Column(db.Text, nullable=False)
    image_filename = db.Column(db.String(200), nullable=True)

    # Symptom checklist stored directly on the disease (no extra tables).
    # JSON list, e.g. [{"key":"yellow_spots_leaves","label":"Yellow spots on leaves","category":"Leaf"}, ...]
    symptom_checklist_json = db.Column(db.Text, nullable=True, default="[]")

    def checklist_items(self) -> list[dict]:
        try:
            items = json.loads(self.symptom_checklist_json or "[]")
            return items if isinstance(items, list) else []
        except Exception:
            return []


    def __repr__(self):
        return f"<Disease {self.name}>"
