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
            name="Blue Tokai",
            category="Snacks",
            icon="coffee",
            accent="rose",
            upi_handle="bluetokai@okhdfc",
            default_amount=240.0,
            is_quick_pay=True,
        ),
        Vendor(
            user_id=user.id,
            name="Namma Metro",
            category="Transport",
            icon="subway",
            accent="amber",
            upi_handle="metro@okaxis",
            default_amount=60.0,
            is_quick_pay=True,
        ),
        Vendor(
            user_id=user.id,
            name="Sapna Book House",
            category="Books",
            icon="menu_book",
            accent="lavender",
            upi_handle="sapnabooks@oksbi",
            default_amount=649.0,
            is_quick_pay=True,
        ),
        Vendor(
            user_id=user.id,
            name="Blinkit",
            category="Groceries",
            icon="shopping_basket",
            accent="mint",
            upi_handle="blinkit@okhdfc",
            default_amount=820.0,
            is_quick_pay=False,
        ),
        Vendor(
            user_id=user.id,
            name="Zomato",
            category="Snacks",
            icon="restaurant",
            accent="rose",
            upi_handle="zomato@okicici",
            default_amount=325.0,
            is_quick_pay=False,
        ),
        Vendor(
            user_id=user.id,
            name="Myntra",
            category="Shopping",
            icon="shopping_bag",
            accent="rose",
            upi_handle="myntra@okaxis",
            default_amount=2199.0,
            is_quick_pay=False,
        ),
        Vendor(
            user_id=user.id,
            name="BESCOM",
            category="Bills",
            icon="bolt",
            accent="amber",
            upi_handle="bescom@oksbi",
            default_amount=1860.0,
            is_quick_pay=False,
        ),
        Vendor(
            user_id=user.id,
            name="JioFiber",
            category="Bills",
            icon="wifi",
            accent="lavender",
            upi_handle="jiofiber@okicici",
            default_amount=999.0,
            is_quick_pay=False,
        ),
        Vendor(
            user_id=user.id,
            name="Netflix India",
            category="Subscriptions",
            icon="cloud",
            accent="lavender",
            upi_handle="netflix@okhdfc",
            default_amount=649.0,
            is_quick_pay=False,
        ),
        Vendor(
            user_id=user.id,
            name="Rent - Indiranagar",
            category="Rent",
            icon="home_work",
            accent="rose",
            upi_handle="rent@okaxis",
            default_amount=22000.0,
            is_quick_pay=False,
        ),
        Vendor(
            user_id=user.id,
            name="Apollo Pharmacy",
            category="Health",
            icon="fitness_center",
            accent="mint",
            upi_handle="apollo@oksbi",
            default_amount=540.0,
            is_quick_pay=False,
        ),
    ]
    session.add_all(vendors)
    session.flush()

    vendor_by_name = {vendor.name: vendor for vendor in vendors}

    budgets = [
        Budget(user_id=user.id, category="Groceries", icon="shopping_basket", accent="mint", spent=5400.0, limit_amount=9000.0),
        Budget(user_id=user.id, category="Snacks", icon="restaurant", accent="rose", spent=1650.0, limit_amount=3000.0),
        Budget(user_id=user.id, category="Books", icon="menu_book", accent="lavender", spent=920.0, limit_amount=2500.0),
        Budget(user_id=user.id, category="Transport", icon="directions_bus", accent="amber", spent=1180.0, limit_amount=4000.0),
        Budget(user_id=user.id, category="Shopping", icon="shopping_bag", accent="rose", spent=3420.0, limit_amount=8000.0),
    ]
    session.add_all(budgets)

    reminders = [
        Reminder(
            user_id=user.id,
            title="Rent - Indiranagar",
            subtitle="UPI AutoPay ready",
            amount=22000.0,
            due_date=now + timedelta(days=3),
            autopay_enabled=True,
            status="scheduled",
        ),
        Reminder(
            user_id=user.id,
            title="JioFiber Bill",
            subtitle="Broadband recharge",
            amount=999.0,
            due_date=now + timedelta(days=5),
            autopay_enabled=True,
            status="scheduled",
        ),
        Reminder(
            user_id=user.id,
            title="Netflix India",
            subtitle="Streaming renewal",
            amount=649.0,
            due_date=now + timedelta(days=9),
            autopay_enabled=False,
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
        account_label: str = "HDFC UPI",
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
        expense("Blue Tokai", 240.0, "Snacks", now.replace(hour=10, minute=20, second=0, microsecond=0)),
        expense("Namma Metro", 60.0, "Transport", now.replace(hour=8, minute=5, second=0, microsecond=0)),
        expense("Blinkit", 820.0, "Groceries", now - timedelta(days=1), payment_method="UPI", account_label="ICICI UPI"),
        expense("Sapna Book House", 649.0, "Books", now - timedelta(days=2), payment_method="UPI"),
        expense("Zomato", 325.0, "Snacks", now - timedelta(days=3), payment_method="UPI"),
        expense("Myntra", 2199.0, "Shopping", now - timedelta(days=6), payment_method="Card", account_label="HDFC Credit Card"),
        expense("Netflix India", 649.0, "Subscriptions", now - timedelta(days=9), payment_method="AutoPay", account_label="Debit Card ****24"),
        expense("Apollo Pharmacy", 540.0, "Health", now - timedelta(days=12), payment_method="UPI"),
        expense("Rent - Indiranagar", 22000.0, "Rent", now - timedelta(days=14), payment_method="Bank Transfer", account_label="Axis Savings"),
        expense("BESCOM", 1860.0, "Bills", now - timedelta(days=18), payment_method="UPI"),
        expense("JioFiber", 999.0, "Bills", now - timedelta(days=20), payment_method="Card", account_label="ICICI Platinum"),
        Transaction(
            user_id=user.id,
            description="Salary Credit - Bengaluru Studio",
            category="Income",
            amount=96000.0,
            direction="income",
            payment_method="Bank Transfer",
            account_label="Salary Account",
            status="completed",
            external_reference=f"txn-salary-{int((now - timedelta(days=15)).timestamp())}",
            occurred_at=now - timedelta(days=15),
        ),
    ]
    session.add_all(transactions)


