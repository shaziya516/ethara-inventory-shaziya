"""
Seed script — creates default admin user and sample data.
Run with: python seed.py
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app
from app.extensions import db
from app.models.user import User
from app.models.product import Product
from app.models.customer import Customer
from app.utils.sku_generator import generate_unique_sku


def seed():
    app = create_app("development")
    with app.app_context():
        # ── Admin user ────────────────────────────────────────────
        if not User.query.filter_by(email="admin@ethara.ai").first():
            admin = User(username="admin", email="admin@ethara.ai", role="admin")
            admin.set_password("Admin@123")
            db.session.add(admin)
            print("✓ Admin user created: admin@ethara.ai / Admin@123")
        else:
            print("✓ Admin user already exists")



            if not Customer.query.filter_by(email=cd["email"]).first():
                customer = Customer(**cd)
                db.session.add(customer)
                print(f"  ✓ Customer: {cd['name']}")

        db.session.commit()
        print("\n✅ Seeding complete!")


if __name__ == "__main__":
    seed()
