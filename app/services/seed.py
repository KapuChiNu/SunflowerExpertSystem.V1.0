import os
import json

from extensions import db
from app.models.disease import Disease
from app.models.rbac import Permission, Role
from app.models.user import User
from app.services import diagnosis


def seed_if_empty():
    """Seed core data.

    - Roles + Permissions (RBAC)
    - Ensure one admin user exists
    - Seed the 6 diseases (only if diseases table empty)
    """

    # --- RBAC seed (safe to run multiple times) ---
    permissions = {
        # Admin area
        "access_admin": "Access the admin dashboard",
        "manage_diseases": "Create/update disease information",
        "delete_diseases": "Delete disease information",
        "manage_users": "View/edit/delete users",
        "view_symptom_checks": "View symptom checker history",
        # User features
        "edit_own_profile": "Edit own profile",
        "use_symptom_checker": "Use the symptom checker",
    }

    perm_objs = {}
    for name, desc in permissions.items():
        p = Permission.query.filter_by(name=name).first()
        if not p:
            p = Permission(name=name, description=desc)
            db.session.add(p)
        perm_objs[name] = p

    # Create roles
    user_role = Role.query.filter_by(name="user").first()
    if not user_role:
        user_role = Role(name="user", description="Regular user")
        db.session.add(user_role)

    admin_role = Role.query.filter_by(name="admin").first()
    if not admin_role:
        admin_role = Role(name="admin", description="System administrator")
        db.session.add(admin_role)

    doctor_role = Role.query.filter_by(name="doctor").first()
    if not doctor_role:
        doctor_role = Role(name="doctor", description="Doctor (can create/update disease reports)")
        db.session.add(doctor_role)

    db.session.flush()

    # Assign default permissions only on first run.
    # If you later edit Role/Permission mappings in the database, we do NOT overwrite them.
    def set_defaults_if_empty(role, perm_names: list[str]):
        if role.permissions:
            return
        role.permissions = [perm_objs[n] for n in perm_names if n in perm_objs]

    set_defaults_if_empty(
        user_role,
        [
            "edit_own_profile",
            "use_symptom_checker",
        ],
    )

    set_defaults_if_empty(
        doctor_role,
        [
            "edit_own_profile",
            "use_symptom_checker",
            "manage_diseases",
            "view_symptom_checks",
        ],
    )

    # Admin should always have all permissions (add missing without removing existing)
    existing_admin = {p.name for p in (admin_role.permissions or [])}
    for p in perm_objs.values():
        if p.name not in existing_admin:
            admin_role.permissions.append(p)

    # Ensure doctors can review symptom checks (add missing without removing existing)
    if "view_symptom_checks" in perm_objs:
        existing_doctor = {p.name for p in (doctor_role.permissions or [])}
        if "view_symptom_checks" not in existing_doctor:
            doctor_role.permissions.append(perm_objs["view_symptom_checks"])


    db.session.commit()


    # Backfill users.role_id based on legacy users.role string (best effort).
    try:
        for u in User.query.filter(User.role_id.is_(None)).all():
            r = Role.query.filter_by(name=u.role).first()
            if r:
                u.role_id = r.id
        db.session.commit()
    except Exception:
        db.session.rollback()

    # Ensure an admin account exists
    if not User.query.filter_by(role="admin").first():
        admin_username = os.environ.get("ADMIN_USERNAME", "admin")
        admin_email = os.environ.get("ADMIN_EMAIL", "admin@local.test")
        admin_password = os.environ.get("ADMIN_PASSWORD", "admin123")

        # Avoid collisions if a user already took that username/email
        if User.query.filter((User.username == admin_username) | (User.email == admin_email)).first():
            admin_username = f"{admin_username}_1"
            admin_email = "admin1@local.test"

        admin = User(username=admin_username, email=admin_email, role="admin", role_id=admin_role.id)
        admin.set_password(admin_password)
        db.session.add(admin)
        db.session.commit()


    # Ensure a doctor account exists
    if not User.query.filter_by(role="doctor").first():
        doctor_username = os.environ.get("DOCTOR_USERNAME", "doctor")
        doctor_email = os.environ.get("DOCTOR_EMAIL", "doctor@local.test")
        doctor_password = os.environ.get("DOCTOR_PASSWORD", "doctor123")

        # Avoid collisions if a user already took that username/email
        if User.query.filter((User.username == doctor_username) | (User.email == doctor_email)).first():
            doctor_username = f"{doctor_username}_1"
            doctor_email = "doctor1@local.test"

        doctor = User(username=doctor_username, email=doctor_email, role="doctor", role_id=doctor_role.id)
        doctor.set_password(doctor_password)
        db.session.add(doctor)
        db.session.commit()

    # --- Seed diseases (only if empty) ---
    if not Disease.query.first():
        diseases = [
            Disease(
                slug="downy-mildew",
                name="Downy Mildew",
                symptoms=(
                    "• Seedlings may be stunted or collapse soon after emergence\n"
                    "• Pale yellow patches between leaf veins (chlorosis)\n"
                    "• White/gray ‘downy’ growth on the underside of leaves (early morning is easiest to see)\n"
                    "• Plants remain short with small leaves and poor head development"
                ),
                cause=(
                    "• Oomycete pathogen: Plasmopara halstedii\n"
                    "• Can be introduced by infected seed or survive in soil as long‑lasting spores\n"
                    "• Favored by cool to mild temperatures and wet soils / poor drainage"
                ),
                treatment=(
                    "• Remove and destroy heavily infected young plants if outbreaks are localized\n"
                    "• If permitted locally, consider labeled seed treatments or fungicides aimed at oomycetes\n"
                    "• Focus on stopping spread: avoid moving contaminated soil between fields"
                ),
                prevention=(
                    "• Plant resistant hybrids and use certified, treated seed\n"
                    "• Improve drainage; avoid planting in cold, waterlogged soils\n"
                    "• Rotate away from sunflower for 3–4 years (or longer where pressure is high)\n"
                    "• Clean equipment to reduce soil movement"
                ),
                image_filename="downy_mildew.png",
            ),
            Disease(
                slug="alternaria-leaf-spot",
                name="Alternaria Leaf Spot",
                symptoms=(
                    "• Small dark brown spots that expand with concentric rings (target spots)\n"
                    "• Spots may merge, causing large blighted areas\n"
                    "• Premature yellowing and leaf drop, reducing plant vigor and yield"
                ),
                cause=(
                    "• Fungus: Alternaria helianthi (and related Alternaria species)\n"
                    "• Survives on crop residue; spores spread by wind and splashing water\n"
                    "• Favored by warm, humid weather and frequent leaf wetness"
                ),
                treatment=(
                    "• Scout early; apply fungicides only when needed and follow local labels\n"
                    "• Reduce leaf wetness where possible (avoid overhead irrigation late in the day)\n"
                    "• Remove severely infected plant debris after harvest"
                ),
                prevention=(
                    "• Crop rotation and residue management (bury or remove infected debris)\n"
                    "• Improve airflow with appropriate spacing and weed control\n"
                    "• Balanced fertilization (avoid excessive nitrogen)\n"
                    "• Choose tolerant varieties when available"
                ),
                image_filename="alternaria.png",
            ),
            Disease(
                slug="rust",
                name="Rust",
                symptoms=(
                    "• Tiny yellow flecks that develop into orange‑brown powdery pustules\n"
                    "• Pustules often appear first on lower leaves and spread upward\n"
                    "• Heavy infections cause early defoliation and reduced seed fill"
                ),
                cause=(
                    "• Fungus: Puccinia helianthi\n"
                    "• Spores travel long distances on wind\n"
                    "• Favored by warm days, cool nights, and humid conditions"
                ),
                treatment=(
                    "• If rust appears early and is increasing, use a labeled fungicide promptly\n"
                    "• Remove volunteer sunflowers and control weeds that can host the pathogen\n"
                    "• Continue scouting to decide if additional sprays are justified"
                ),
                prevention=(
                    "• Plant rust‑resistant hybrids where available\n"
                    "• Rotate crops and manage volunteer plants\n"
                    "• Avoid overly dense canopies (spacing and nitrogen management)"
                ),
                image_filename="rust.png",
            ),
            Disease(
                slug="charcoal-rot",
                name="Charcoal Rot",
                symptoms=(
                    "• Sudden wilting during flowering or grain fill, especially in hot/dry periods\n"
                    "• Gray to dark discoloration at the lower stem\n"
                    "• Stem pith becomes ‘shredded’ and packed with tiny black specks (sclerotia)\n"
                    "• Plants may lodge or snap near the base"
                ),
                cause=(
                    "• Fungus: Macrophomina phaseolina\n"
                    "• Survives in soil and plant residue; has a wide host range\n"
                    "• Disease is strongly linked to drought stress and high temperatures"
                ),
                treatment=(
                    "• No reliable curative fungicide once symptoms appear\n"
                    "• Reduce stress: manage irrigation (if available) and avoid severe moisture deficit\n"
                    "• Harvest promptly if lodging risk increases"
                ),
                prevention=(
                    "• Choose tolerant hybrids and avoid overly high plant populations\n"
                    "• Use rotations that reduce inoculum pressure where possible\n"
                    "• Maintain soil health and moisture; manage weeds that can host the fungus\n"
                    "• Avoid practices that intensify drought stress"
                ),
                image_filename="charcoal_rot.png",
            ),
            Disease(
                slug="white-mold",
                name="White Mold",
                symptoms=(
                    "• Water‑soaked lesions on stems or heads that quickly turn pale\n"
                    "• White cottony fungal growth on affected tissue\n"
                    "• Hard black structures (sclerotia) form inside stems/heads\n"
                    "• Plants may lodge and heads can rot, reducing yield and quality"
                ),
                cause=(
                    "• Fungus: Sclerotinia sclerotiorum\n"
                    "• Survives in soil as sclerotia for years\n"
                    "• Favored by cool, moist conditions and dense canopies during flowering"
                ),
                treatment=(
                    "• Remove severely diseased plants where practical (small plantings)\n"
                    "• In commercial fields, fungicide timing is critical—often at early bloom in high‑risk fields\n"
                    "• Reduce canopy humidity by improving airflow if feasible"
                ),
                prevention=(
                    "• Rotate with non‑host crops (often grasses/cereals)\n"
                    "• Avoid dense stands; improve airflow with spacing and weed control\n"
                    "• Manage irrigation to reduce prolonged leaf wetness during bloom\n"
                    "• Use tolerant varieties and clean equipment to limit spread"
                ),
                image_filename="white_mold.png",
            ),
            Disease(
                slug="bacterial-head-rot",
                name="Bacterial Head Rot",
                symptoms=(
                    "• Soft, watery decay of the head; tissue becomes brown and mushy\n"
                    "• Foul smell is common\n"
                    "• Often starts at injured areas (insect feeding, hail, bird damage)\n"
                    "• Heads may leak fluids and attract insects"
                ),
                cause=(
                    "• Bacteria commonly linked to soft rot (e.g., Pectobacterium species)\n"
                    "• Enters through wounds and spreads under warm, wet conditions\n"
                    "• Insects can create entry points and help move bacteria"
                ),
                treatment=(
                    "• There is usually no effective curative spray after infection\n"
                    "• Remove and destroy infected heads in gardens/small plots\n"
                    "• Manage insects and reduce wounding to limit new infections"
                ),
                prevention=(
                    "• Protect heads from insect damage (monitor sunflower moth and other pests)\n"
                    "• Reduce mechanical injury and avoid working plants when wet\n"
                    "• Improve field sanitation and promote good air movement\n"
                    "• Harvest on time to avoid prolonged exposure to wet weather"
                ),
                image_filename="bacterial_head_rot.png",
            ),
        ]

        db.session.add_all(diseases)
        db.session.commit()


    # Seed Symptoms + Disease<->Symptom checklist (only if symptoms table empty)
    # Seed checklist directly into each disease (no extra tables)
    # We reuse the original diagnosis.py catalog and rules, but store them as JSON text on the disease.
    symptom_meta = {s.key: {"key": s.key, "label": s.label, "category": s.category} for s in diagnosis.SYMPTOMS}
    for rule in diagnosis.RULES:
        disease = Disease.query.filter_by(slug=rule.disease_key).first()
        if not disease:
            continue
        keys = list((rule.weights or {}).keys())
        items = [symptom_meta[k] for k in keys if k in symptom_meta]
        disease.symptom_checklist_json = json.dumps(items)
    db.session.commit()
