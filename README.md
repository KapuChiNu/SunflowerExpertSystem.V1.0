# Doctor Sunflower Lab (Flask + SQLAlchemy)

This app includes:
- Public disease pages (6 seeded sunflower diseases)
- User registration + login
- User profile page (edit username/email + optional password change)
- Symptom checker + admin review pages (history logs)
- Admin/Doctor disease editing (update text + replace image)
- Admin user management (view/edit/delete users)

> Note: Sunflower **Roles/Facts** pages and the **Ask a question (Q&A)** feature were removed from the website.

## Run (macOS / Linux)
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python3 run.py
```

## Run (Windows PowerShell)
```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
python run.py
```

Open: http://127.0.0.1:5000

## Default admin (first run)
On first run, the app will create a default admin user if none exists:

- Username: `admin`
- Password: `admin123`

## Default doctor (first run)
On first run, the app will also create a default **doctor** user if none exists:

- Username: `doctor`
- Password: `doctor123`

The doctor can:
- Use the symptom checker
- Add/edit disease reports

The doctor **cannot**:
- Delete diseases (admin-only)
- View/manage other users
- View symptom checker logs

Change the defaults by setting environment variables before running:
- `ADMIN_USERNAME`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `DOCTOR_USERNAME`
- `DOCTOR_EMAIL`
- `DOCTOR_PASSWORD`
- (recommended) `SECRET_KEY`

Example:
```bash
export ADMIN_USERNAME="myadmin"
export ADMIN_PASSWORD="super-secret-password"
export SECRET_KEY="change-me"
python3 run.py
```

## Pages
- Public:
  - `/` diseases list
  - `/disease/<slug>` disease report
- Auth:
  - `/register`
  - `/login`
  - `/logout`
- User:
  - `/user/profile` (Edit my profile)
- Admin:
  - `/admin/dashboard`
  - `/admin/diseases`
  - `/admin/users` (Manage users)
  - `/admin/symptom-checks` (Review symptom checker history)

> Note: Doctors can use `/admin/diseases` and `/admin/disease/new` but do not have access to `/admin/dashboard`, users, or logs.

## If you ran an older version
If you already ran the app before, your existing SQLite DB in `instance/doctor_sunflower.db` will be reused.
To regenerate seeded users/roles from scratch, delete that file and run again.

## Notes
On startup the app will automatically create & seed:
- `roles`, `permissions`, `role_permissions` (RBAC)
- `symptom_checks`, `symptom_check_symptoms`, `symptom_check_results` (symptom checker history)

The `users.role` column is still used ("user" / "doctor" / "admin") for backwards compatibility.
