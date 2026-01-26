import os

class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "doctor-sunflower-secret")

    # Use an absolute path for SQLite, stored under ./instance/
    BASE_DIR = os.path.abspath(os.path.dirname(__file__))
    INSTANCE_DIR = os.path.join(BASE_DIR, "instance")
    SQLALCHEMY_DATABASE_URI = "sqlite:///" + os.path.join(INSTANCE_DIR, "doctor_sunflower.db")

    SQLALCHEMY_TRACK_MODIFICATIONS = False
