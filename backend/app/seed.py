from __future__ import annotations

from datetime import datetime, timedelta

from sqlalchemy import select
from sqlalchemy.orm import Session

from .models import Budget, Reminder, Transaction, User, Vendor
from .security import hash_password


def populate_sample_account(session: Session, user: User, *, now: datetime | None = None) -> None:
    existing_vendor = session.scalar(select(Vendor.id).where(Vendor.user_id == user.id).limit(1))
    if existing_vendor:
        return

    now = now or datetime.utcnow()

    vendors = [
        Vendor(user_id=user.id, name="Starbucks", category="Food & Dining", icon="coffee", accent="mint", upi_handle="starbucks@okbank", default_amount=5.50, is_quick_pay=True),
        Vendor(user_id=user.id, name="Metro", category="Transport", icon="subway", accent="amber", upi_handle="metro@okicici", default_amount=2.00, is_quick_pay=True),
        Vendor(user_id=user.id, name="Zerox", category="Office", icon="print", accent="indigo", upi_handle="xerox@okaxis", default_amount=1.00, is_quick_pay=True),
        Vendor(user_id=user.id, name="Blue Bottle Coffee", category="Food & Dining", icon="restaurant", accent="mint", upi_handle="bluebottle@oksbi", default_amount=15.00, is_quick_pay=False),
        Vendor(user_id=user.id, name="Whole Foods Market", category="Food & Dining", icon="shopping_basket", accent="mint", upi_handle="wholefoods@okhdfc", default_amount=85.20, is_quick_pay=False),
        Vendor(user_id=user.id, name="Uber Technologies", category="Transport", icon="directions_car", accent="amber", upi_handle="uber@okaxis", default_amount=24.00, is_quick_pay=False),
        Vendor(user_id=user.id, name="Con Edison", category="Utilities", icon="bolt", accent="lavender", upi_handle="conedison@oksbi", default_amount=142.00, is_quick_pay=False),
        Vendor(user_id=user.id, name="Verizon Wireless", category="Utilities", icon="wifi", accent="lavender", upi_handle="verizon@okicici", default_amount=75.00, is_quick_pay=False),
        Vendor(user_id=user.id, name="Amazon AWS Cloud", category="Subscriptions", icon="cloud", accent="indigo", upi_handle="aws@okhdfc", default_amount=42.99, is_quick_pay=False),
        Vendor(user_id=user.id, name="Rent Payment", category="Housing", icon="home_work", accent="indigo", upi_handle="rent@okaxis", default_amount=2100.00, is_quick_pay=False),
        Vendor(user_id=user.id, name="Gym Membership", category="Health", icon="fitness_center", accent="amber", upi_handle="gym@oksbi", default_amount=58.00, is_quick_pay=False),
        Vendor(user_id=user.id, name="Artisan Bakery", category="Food & Dining", icon="bakery_dining", accent="mint", upi_handle="artisan@okhdfc", default_amount=12.40, is_quick_pay=False),
        Vendor(user_id=user.id, name="City Transit", category="Transport", icon="directions_bus", accent="amber", upi_handle="citytransit@okaxis", default_amount=2.75, is_quick_pay=False),
    ]
    session.add_all(vendors)
    session.flush()

    vendor_by_name = {vendor.name: vendor for vendor in vendors}

    budgets = [
        Budget(user_id=user.id, category="Food & Dining", icon="restaurant", accent="mint", spent=100.0, limit_amount=150.0),
        Budget(user_id=user.id, category="Transport", icon="directions_bus", accent="amber", spent=45.0, limit_amount=80.0),
        Budget(user_id=user.id, category="Shopping", icon="shopping_bag", accent="indigo", spent=120.0, limit_amount=300.0),
    ]
    session.add_all(budgets)

    reminders = [
        Reminder(user_id=user.id, title="Monthly Rent Payment", subtitle="Secure home lease", amount=2100.0, due_date=now + timedelta(days=3), autopay_enabled=True, status="scheduled"),
        Reminder(user_id=user.id, title="Electricity Bill", subtitle="City power utility", amount=203.0, due_date=now + timedelta(days=5), autopay_enabled=False, status="scheduled"),
        Reminder(user_id=user.id, title="Cloud Storage Sync", subtitle="Annual productivity tools", amount=19.0, due_date=now + timedelta(days=6), autopay_enabled=True, status="scheduled"),
    ]
    session.add_all(reminders)

    def expense(name: str, amount: float, category: str, when: datetime, payment_method: str = "UPI", account_label: str = "Personal Account") -> Transaction:
        return Transaction(
            user_id=user.id,
            vendor_id=vendor_by_name.get(name).id if vendor_by_name.get(name) else None,
            description=name,
            category=category,
            amount=amount,
            direction="expense",
            payment_method=payment_method,
            account_label=account_label,
            status="completed",
            external_reference=f"txn-{name.lower().replace(' ', '-')}-{int(when.timestamp())}",
            occurred_at=when,
        )

    transactions = [
        expense("Artisan Bakery", 12.40, "Food & Dining", now.replace(hour=11, minute=45, second=0, microsecond=0)),
        expense("City Transit", 2.75, "Transport", now.replace(hour=8, minute=30, second=0, microsecond=0)),
        expense("Whole Foods Market", 48.20, "Food & Dining", now - timedelta(days=1)),
        expense("Blue Bottle Coffee", 15.00, "Food & Dining", now - timedelta(days=2)),
        expense("Uber Technologies", 18.50, "Transport", now - timedelta(days=3), payment_method="Card", account_label="Personal Account"),
        expense("Amazon AWS Cloud", 42.99, "Subscriptions", now - timedelta(days=7), payment_method="AutoPay", account_label="Debit Card ****42"),
        expense("Gym Membership", 58.00, "Health", now - timedelta(days=9), payment_method="Card"),
        expense("Rent Payment", 2100.00, "Housing", now - timedelta(days=11), payment_method="Bank Transfer"),
        expense("Con Edison", 142.00, "Utilities", now - timedelta(days=14), payment_method="UPI"),
        expense("Verizon Wireless", 75.00, "Utilities", now - timedelta(days=17), payment_method="Card"),
        expense("Starbucks", 5.50, "Food & Dining", now - timedelta(days=18), payment_method="UPI"),
        expense("Metro", 2.00, "Transport", now - timedelta(days=20), payment_method="UPI"),
        expense("Zerox", 1.00, "Office", now - timedelta(days=21), payment_method="UPI"),
        Transaction(
            user_id=user.id,
            description="Salary Deposit - TechFlow Inc.",
            category="Income",
            amount=4200.00,
            direction="income",
            payment_method="Direct Deposit",
            account_label="Checking Account",
            status="completed",
            external_reference=f"txn-salary-{int((now - timedelta(days=15)).timestamp())}",
            occurred_at=now - timedelta(days=15),
        ),
    ]
    session.add_all(transactions)


def seed_database(session: Session) -> None:
    existing_user = session.scalar(select(User).limit(1))
    if existing_user:
        return

    now = datetime.utcnow()
    user = User(
        name="Alex Thompson",
        email="alex@spedex.app",
        password_hash=hash_password("spedex123"),
        plan="Premium Member",
        avatar_initials="AT",
        member_since=now - timedelta(days=420),
    )
    session.add(user)
    session.flush()

    populate_sample_account(session, user, now=now)
    session.commit()
