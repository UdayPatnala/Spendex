from __future__ import annotations

from datetime import datetime, timedelta

from sqlalchemy import select
from sqlalchemy.orm import Session

from .models import Budget, Reminder, Transaction, User, Vendor
from .security import hash_password

DEMO_EMAIL = "alex@spedex.app"
DEMO_PASSWORD = "spedex123"


def reset_sample_account(session: Session, user: User) -> None:
    session.query(Transaction).filter(Transaction.user_id == user.id).delete()
    session.query(Reminder).filter(Reminder.user_id == user.id).delete()
    session.query(Budget).filter(Budget.user_id == user.id).delete()
    session.query(Vendor).filter(Vendor.user_id == user.id).delete()
    session.flush()


def populate_sample_account(
    session: Session,
    user: User,
    *,
    now: datetime | None = None,
    replace_existing: bool = False,
) -> None:
    existing_vendor = session.scalar(select(Vendor.id).where(Vendor.user_id == user.id).limit(1))
    if existing_vendor and not replace_existing:
        return
    if replace_existing:
        reset_sample_account(session, user)

    now = now or datetime.utcnow()

    vendors = [
        Vendor(
            user_id=user.id,
            name="Starbucks",
            category="Dining",
            icon="restaurant",
            accent="rose",
            upi_handle="starbucks@okhdfc",
            default_amount=250.0,
            is_quick_pay=True,
        ),
        Vendor(
            user_id=user.id,
            name="Uber / Ola",
            category="Transport",
            icon="directions_bus",
            accent="amber",
            upi_handle="uber@okaxis",
            default_amount=150.0,
            is_quick_pay=True,
        ),
        Vendor(
            user_id=user.id,
            name="Amazon",
            category="Shopping",
            icon="shopping_bag",
            accent="lavender",
            upi_handle="amazon@oksbi",
            default_amount=500.0,
            is_quick_pay=True,
        ),
        Vendor(
            user_id=user.id,
            name="Local Grocery",
            category="Groceries",
            icon="shopping_basket",
            accent="mint",
            upi_handle="grocery@okhdfc",
            default_amount=300.0,
            is_quick_pay=True,
        ),
        Vendor(
            user_id=user.id,
            name="Amazon Prime",
            category="Bills",
            icon="cloud",
            accent="rose",
            upi_handle="prime@okaxis",
            default_amount=179.0,
            is_quick_pay=False,
        ),
        Vendor(
            user_id=user.id,
            name="Apartment Rent",
            category="Rent",
            icon="home_work",
            accent="amber",
            upi_handle="landlord@oksbi",
            default_amount=15000.0,
            is_quick_pay=False,
        ),
    ]
    session.add_all(vendors)
    session.flush()

    vendor_by_name = {vendor.name: vendor for vendor in vendors}

    budgets = [
        Budget(user_id=user.id, category="Dining & Drinks", icon="restaurant", accent="rose", spent=1200.0, limit_amount=5000.0),
        Budget(user_id=user.id, category="Transportation", icon="directions_bus", accent="amber", spent=800.0, limit_amount=2000.0),
        Budget(user_id=user.id, category="Shopping", icon="shopping_bag", accent="lavender", spent=2500.0, limit_amount=5000.0),
        Budget(user_id=user.id, category="Rent & Bills", icon="home_work", accent="rose", spent=15179.0, limit_amount=16000.0),
    ]
    session.add_all(budgets)

    reminders = [
        Reminder(
            user_id=user.id,
            title="Apartment Rent",
            subtitle="Monthly rent transfer",
            amount=15000.0,
            due_date=now + timedelta(days=3),
            autopay_enabled=False,
            status="scheduled",
        ),
        Reminder(
            user_id=user.id,
            title="Netflix / Monthly Subs",
            subtitle="Digital services renewal",
            amount=499.0,
            due_date=now + timedelta(days=9),
            autopay_enabled=True,
            status="scheduled",
        ),
    ]
    session.add_all(reminders)

    def expense(
        name: str,
        amount: float,
        category: str,
        when: datetime,
        *,
        payment_method: str = "UPI",
        account_label: str = "UPI Linked Account",
    ) -> Transaction:
        vendor = vendor_by_name.get(name)
        return Transaction(
            user_id=user.id,
            vendor_id=vendor.id if vendor else None,
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
        expense("Starbucks", 250.0, "Dining", now.replace(hour=13, minute=20, second=0, microsecond=0)),
        expense("Uber / Ola", 150.0, "Transport", now.replace(hour=8, minute=5, second=0, microsecond=0)),
        expense("Local Grocery", 300.0, "Groceries", now - timedelta(days=1)),
        expense("Amazon", 500.0, "Shopping", now - timedelta(days=2)),
        expense("Starbucks", 180.0, "Dining", now - timedelta(days=3)),
        expense("Apartment Rent", 15000.0, "Rent", now - timedelta(days=14), payment_method="Bank Transfer"),
        Transaction(
            user_id=user.id,
            description="Monthly Salary / Income",
            category="Income",
            amount=45000.0,
            direction="income",
            payment_method="Bank Transfer",
            account_label="Savings Account",
            status="completed",
            external_reference=f"txn-income-{int((now - timedelta(days=15)).timestamp())}",
            occurred_at=now - timedelta(days=15),
        ),
    ]
    session.add_all(transactions)


