from __future__ import annotations

from collections import defaultdict
from datetime import datetime, timedelta

from fastapi import Depends, FastAPI, Header, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select
from sqlalchemy.orm import Session

from .config import settings
from .database import Base, SessionLocal, engine, get_db
from .models import Budget, Reminder, Transaction, User, Vendor
from .schemas import (
    AnalyticsResponse,
    AuthRequest,
    BudgetOut,
    BudgetScreenResponse,
    CategoryBreakdown,
    DashboardOverview,
    HighlightCard,
    HomeOverview,
    PaymentCompleteRequest,
    PaymentIntentCreate,
    PaymentIntentResponse,
    ReminderOut,
    SignupRequest,
    TokenResponse,
    TransactionOut,
    UserOut,
    VendorDirectoryResponse,
    VendorOut,
    WeeklySpendPoint,
)
from .security import create_access_token, decode_access_token, hash_password, verify_password
from .seed import populate_sample_account

app = FastAPI(title=settings.app_name)

app.add_middleware(
    CORSMiddleware,
    allow_origins=list(settings.cors_origins),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup() -> None:
    Base.metadata.create_all(bind=engine)


def get_user_from_authorization(session: Session, authorization: str | None) -> User:
    if not authorization:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required")

    scheme, _, token = authorization.partition(" ")
    if scheme.lower() != "bearer" or not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid authorization header")

    try:
        payload = decode_access_token(token)
        user_id = int(str(payload["sub"]))
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token") from exc

    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user


def get_current_user(
    session: Session = Depends(get_db),
    authorization: str | None = Header(default=None),
) -> User:
    return get_user_from_authorization(session, authorization)


def get_authenticated_user(
    session: Session = Depends(get_db),
    authorization: str | None = Header(default=None),
) -> User:
    if not authorization:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required")
    return get_user_from_authorization(session, authorization)


def serialize_user(user: User) -> UserOut:
    return UserOut.model_validate(user)


def serialize_vendor(vendor: Vendor) -> VendorOut:
    return VendorOut.model_validate(vendor)


def serialize_transaction(transaction: Transaction) -> TransactionOut:
    return TransactionOut(
        id=transaction.id,
        description=transaction.description,
        category=transaction.category,
        amount=transaction.amount,
        direction=transaction.direction,
        payment_method=transaction.payment_method,
        account_label=transaction.account_label,
        status=transaction.status,
        external_reference=transaction.external_reference,
        occurred_at=transaction.occurred_at,
        vendor_name=transaction.vendor.name if transaction.vendor else None,
    )


def serialize_budget(budget: Budget) -> BudgetOut:
    progress = 0 if budget.limit_amount == 0 else min(budget.spent / budget.limit_amount, 1.0)
    return BudgetOut(
        id=budget.id,
        category=budget.category,
        icon=budget.icon,
        accent=budget.accent,
        spent=budget.spent,
        limit_amount=budget.limit_amount,
        progress=progress,
    )


def serialize_reminder(reminder: Reminder) -> ReminderOut:
    return ReminderOut.model_validate(reminder)


def format_inr(amount: float) -> str:
    rounded = round(amount, 2)
    if rounded.is_integer():
        return f"₹{int(rounded):,}"
    return f"₹{rounded:,.2f}"


def get_transactions(session: Session, user_id: int) -> list[Transaction]:
    return list(
        session.scalars(
            select(Transaction)
            .where(Transaction.user_id == user_id)
            .order_by(Transaction.occurred_at.desc(), Transaction.id.desc())
        )
    )


def get_monthly_expenses(transactions: list[Transaction]) -> list[Transaction]:
    now = datetime.utcnow()
    return [
        txn
        for txn in transactions
        if txn.direction == "expense" and txn.occurred_at.year == now.year and txn.occurred_at.month == now.month
    ]


def build_weekly_spend(transactions: list[Transaction]) -> list[WeeklySpendPoint]:
    now = datetime.utcnow()
    start_of_week = (now - timedelta(days=now.weekday())).replace(hour=0, minute=0, second=0, microsecond=0)
    series: list[WeeklySpendPoint] = []
    for index in range(3, -1, -1):
        week_start = start_of_week - timedelta(days=index * 7)
        week_end = week_start + timedelta(days=7)
        total = sum(
            txn.amount
            for txn in transactions
            if txn.direction == "expense" and week_start <= txn.occurred_at < week_end
        )
        series.append(WeeklySpendPoint(week_label=f"Week {4 - index}", amount=round(total, 2), is_active=index == 0))
    return series


def build_category_breakdown(transactions: list[Transaction]) -> list[CategoryBreakdown]:
    totals = defaultdict(float)
    accent_map = {
        "Snacks": "rose",
        "Groceries": "mint",
        "Books": "lavender",
        "Transport": "amber",
        "Bills": "amber",
        "Subscriptions": "lavender",
        "Rent": "rose",
        "Shopping": "rose",
        "Health": "mint",
    }
    for txn in transactions:
        totals[txn.category] += txn.amount
    grand_total = sum(totals.values()) or 1
    ordered = sorted(totals.items(), key=lambda item: item[1], reverse=True)
    return [
        CategoryBreakdown(category=category, percentage=round(amount / grand_total * 100, 1), accent=accent_map.get(category, "rose"))
        for category, amount in ordered[:4]
    ]


def build_peak_day_label(transactions: list[Transaction]) -> str:
    if not transactions:
        return "No spend yet"
    spend_by_day = defaultdict(float)
    for txn in transactions:
        spend_by_day[txn.occurred_at.strftime("%A")] += txn.amount
    day, amount = max(spend_by_day.items(), key=lambda item: item[1])
    return f"{day} ({format_inr(amount)})"


def build_budget_copy(monthly_spend: float, monthly_budget: float) -> str:
    if monthly_budget <= 0:
        return "Monthly budget is not configured yet."
    remaining = monthly_budget - monthly_spend
    if remaining >= 0:
        delta = round(remaining / monthly_budget * 100, 1)
        return f"You are on track. Your outflow is {delta}% under plan this month."
    delta = round(abs(remaining) / monthly_budget * 100, 1)
    return f"Budget is over target by {delta}%. A lighter weekend will bring the index back in line."


def build_highest_sector(category_breakdown: list[CategoryBreakdown]) -> HighlightCard:
    if not category_breakdown:
        return HighlightCard(
            title="Fresh Month",
            subtitle="Once spending starts, the biggest category will surface here.",
            accent="rose",
            icon="insights",
        )

    top = category_breakdown[0]
    icon_map = {
        "Snacks": "restaurant",
        "Groceries": "shopping_basket",
        "Books": "menu_book",
        "Transport": "directions_bus",
        "Bills": "bolt",
        "Shopping": "shopping_bag",
        "Health": "fitness_center",
        "Rent": "home_work",
        "Subscriptions": "cloud",
    }
    return HighlightCard(
        title=top.category,
        subtitle=f"{top.percentage}% of this month's spend is flowing into {top.category.lower()}.",
        accent=top.accent,
        icon=icon_map.get(top.category, "payments"),
    )


def build_busiest_day(transactions: list[Transaction]) -> HighlightCard:
    if not transactions:
        return HighlightCard(
            title="No peak day yet",
            subtitle="Your next few payments will reveal the busiest spend day.",
            accent="amber",
            icon="event_busy",
        )

    spend_by_day = defaultdict(float)
    for txn in transactions:
        spend_by_day[txn.occurred_at.strftime("%A")] += txn.amount

    day, amount = max(spend_by_day.items(), key=lambda item: item[1])
    return HighlightCard(
        title=day,
        subtitle=f"Your heaviest outflow this month landed on {day} at {format_inr(amount)}.",
        accent="amber",
        icon="event_busy",
    )


def build_smart_insight(
    category_breakdown: list[CategoryBreakdown],
    weekday_ratio: float,
    weekend_ratio: float,
) -> str:
    if not category_breakdown:
        return "Your first few payments will unlock richer spending signals here."

    top_category = category_breakdown[0]
    if weekend_ratio > weekday_ratio:
        return (
            f"Weekend spending is leading at {weekend_ratio}%. "
            f"Keeping one low-spend day could soften your {top_category.category.lower()} bill."
        )

    return (
        f"{top_category.category} is your biggest basket at {top_category.percentage}%. "
        "A small trim there will move your monthly index fastest."
    )


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/api/auth/signup", response_model=TokenResponse)
def signup(payload: SignupRequest, session: Session = Depends(get_db)) -> TokenResponse:
    existing = session.scalar(select(User).where(User.email == payload.email))
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already exists")

    user = User(
        name=payload.name,
        email=payload.email,
        password_hash=hash_password(payload.password),
        plan="Rose Gold",
        avatar_initials="".join(part[0] for part in payload.name.split()[:2]).upper() or "SP",
    )
    session.add(user)
    session.flush()
    populate_sample_account(session, user)
    session.commit()
    session.refresh(user)
    return TokenResponse(access_token=create_access_token(str(user.id)), user=serialize_user(user))


@app.post("/api/auth/login", response_model=TokenResponse)
def login(payload: AuthRequest, session: Session = Depends(get_db)) -> TokenResponse:
    user = session.scalar(select(User).where(User.email == payload.email))
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
    return TokenResponse(access_token=create_access_token(str(user.id)), user=serialize_user(user))


@app.get("/api/auth/me", response_model=UserOut)
def auth_me(user: User = Depends(get_authenticated_user)) -> UserOut:
    return serialize_user(user)


@app.get("/api/mobile/home", response_model=HomeOverview)
def mobile_home(session: Session = Depends(get_db), user: User = Depends(get_current_user)) -> HomeOverview:
    transactions = get_transactions(session, user.id)
    budgets = list(session.scalars(select(Budget).where(Budget.user_id == user.id)))
    today = datetime.utcnow().date()
    today_expense = sum(txn.amount for txn in transactions if txn.direction == "expense" and txn.occurred_at.date() == today)
    quick_pay = list(
        session.scalars(
            select(Vendor).where(Vendor.user_id == user.id, Vendor.is_quick_pay.is_(True)).order_by(Vendor.id.asc())
        )
    )
    recent = transactions[:3]
    monthly_budget = sum(item.limit_amount for item in budgets) or 75000.0
    today_budget = round(monthly_budget / 30, 2)
    remaining = today_budget - today_expense
    if remaining >= 0:
        on_track_copy = f"Nice pace. You still have {format_inr(remaining)} left in today's plan."
    else:
        on_track_copy = f"You're {format_inr(abs(remaining))} past today's pace. One lighter order brings it back."
    return HomeOverview(
        user=serialize_user(user),
        today_spend=round(today_expense, 2),
        today_budget=today_budget,
        on_track_copy=on_track_copy,
        quick_pay=[serialize_vendor(vendor) for vendor in quick_pay],
        recent_transactions=[serialize_transaction(txn) for txn in recent],
    )


@app.get("/api/mobile/budgets", response_model=BudgetScreenResponse)
def mobile_budgets(session: Session = Depends(get_db), user: User = Depends(get_current_user)) -> BudgetScreenResponse:
    budgets = list(session.scalars(select(Budget).where(Budget.user_id == user.id).order_by(Budget.id.asc())))
    reminders = list(
        session.scalars(select(Reminder).where(Reminder.user_id == user.id).order_by(Reminder.due_date.asc(), Reminder.id.asc()))
    )
    remaining_budget = sum(budget.limit_amount - budget.spent for budget in budgets)
    healthiest_budget = next(
        (
            budget
            for budget in sorted(
                budgets,
                key=lambda item: (item.spent / item.limit_amount) if item.limit_amount else 1,
            )
            if budget.limit_amount > 0
        ),
        None,
    )
    if healthiest_budget:
        savings_tip = (
            f"{healthiest_budget.category} is still comfortably under plan. "
            "Sweep that buffer into your travel or emergency fund before month-end."
        )
    else:
        savings_tip = "Add a few budgets to unlock sharper saving prompts."
    return BudgetScreenResponse(
        remaining_budget=round(remaining_budget, 2),
        budgets=[serialize_budget(item) for item in budgets],
        reminders=[serialize_reminder(item) for item in reminders],
        savings_tip=savings_tip,
    )


@app.get("/api/mobile/vendors", response_model=VendorDirectoryResponse)
def mobile_vendors(session: Session = Depends(get_db), user: User = Depends(get_current_user)) -> VendorDirectoryResponse:
    groups = defaultdict(list)
    vendors = list(
        session.scalars(select(Vendor).where(Vendor.user_id == user.id).order_by(Vendor.category.asc(), Vendor.name.asc()))
    )
    for vendor in vendors:
        groups[vendor.category].append(serialize_vendor(vendor))
    return VendorDirectoryResponse(user=serialize_user(user), groups=dict(groups))


@app.get("/api/mobile/analytics", response_model=AnalyticsResponse)
def mobile_analytics(session: Session = Depends(get_db), user: User = Depends(get_current_user)) -> AnalyticsResponse:
    transactions = get_transactions(session, user.id)
    monthly_expenses = get_monthly_expenses(transactions)
    category_breakdown = build_category_breakdown(monthly_expenses)
    weekly_spend = build_weekly_spend(transactions)
    weekday_total = sum(txn.amount for txn in monthly_expenses if txn.occurred_at.weekday() < 5)
    weekend_total = sum(txn.amount for txn in monthly_expenses if txn.occurred_at.weekday() >= 5)
    total_spent = round(sum(txn.amount for txn in monthly_expenses), 2)
    weekday_ratio = round(weekday_total / max(total_spent, 1) * 100, 1)
    weekend_ratio = round(weekend_total / max(total_spent, 1) * 100, 1)
    return AnalyticsResponse(
        total_spent=total_spent,
        smart_insight=build_smart_insight(category_breakdown, weekday_ratio, weekend_ratio),
        category_breakdown=category_breakdown,
        weekly_spend=weekly_spend,
        highest_sector=build_highest_sector(category_breakdown),
        busiest_day=build_busiest_day(monthly_expenses),
        weekday_ratio=weekday_ratio,
        weekend_ratio=weekend_ratio,
    )


@app.get("/api/dashboard/overview", response_model=DashboardOverview)
def dashboard_overview(session: Session = Depends(get_db), user: User = Depends(get_current_user)) -> DashboardOverview:
    transactions = get_transactions(session, user.id)
    budgets = list(session.scalars(select(Budget).where(Budget.user_id == user.id)))
    reminders = list(
        session.scalars(select(Reminder).where(Reminder.user_id == user.id).order_by(Reminder.due_date.asc(), Reminder.id.asc()))
    )
    quick_pay = list(
        session.scalars(select(Vendor).where(Vendor.user_id == user.id, Vendor.is_quick_pay.is_(True)).order_by(Vendor.id.asc()))
    )
    monthly_expenses = get_monthly_expenses(transactions)
    monthly_total = round(sum(txn.amount for txn in monthly_expenses), 2)
    monthly_budget = round(sum(item.limit_amount for item in budgets), 2)
    weekly_spending = [point.amount for point in build_weekly_spend(transactions)]
    weekly_average = round(sum(weekly_spending) / max(len(weekly_spending), 1), 2)
    return DashboardOverview(
        user=serialize_user(user),
        monthly_total=monthly_total,
        monthly_budget=monthly_budget,
        budget_used_ratio=round(monthly_total / max(monthly_budget, 1), 3),
        budget_copy=build_budget_copy(monthly_total, monthly_budget),
        quick_pay=[serialize_vendor(item) for item in quick_pay],
        recent_transactions=[serialize_transaction(item) for item in transactions[:3]],
        reminders=[serialize_reminder(item) for item in reminders],
        weekly_spending=weekly_spending,
        peak_day_label=build_peak_day_label(monthly_expenses),
        weekly_average=weekly_average,
        security_message="UPI guardrails are active. Add device lock and payment alerts for every high-value transfer.",
    )


@app.get("/api/transactions", response_model=list[TransactionOut])
def list_transactions(session: Session = Depends(get_db), user: User = Depends(get_current_user)) -> list[TransactionOut]:
    return [serialize_transaction(txn) for txn in get_transactions(session, user.id)]


@app.post("/api/payments/prepare", response_model=PaymentIntentResponse)
def prepare_payment(
    payload: PaymentIntentCreate,
    session: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> PaymentIntentResponse:
    vendor = session.get(Vendor, payload.vendor_id) if payload.vendor_id else None
    upi_handle = payload.upi_handle or (vendor.upi_handle if vendor else None)
    payee_name = payload.payee_name or (vendor.name if vendor else "Spedex Merchant")
    if not upi_handle:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="UPI handle is required")

    transaction = Transaction(
        user_id=user.id,
        vendor_id=vendor.id if vendor else None,
        description=payee_name,
        category=vendor.category if vendor else "Custom",
        amount=payload.amount,
        direction="expense",
        payment_method="UPI",
        account_label="UPI Linked Account",
        status="pending",
        occurred_at=datetime.utcnow(),
    )
    session.add(transaction)
    session.commit()
    session.refresh(transaction)

    upi_url = f"upi://pay?pa={upi_handle}&pn={payee_name}&am={payload.amount:.2f}&cu=INR&tn=spedex-{transaction.id}"
    return PaymentIntentResponse(
        transaction=serialize_transaction(transaction),
        upi_url=upi_url,
        redirect_message="You will be redirected to your preferred UPI app to complete this transaction.",
    )


@app.post("/api/payments/{transaction_id}/complete", response_model=TransactionOut)
def complete_payment(
    transaction_id: int,
    payload: PaymentCompleteRequest,
    session: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> TransactionOut:
    transaction = session.get(Transaction, transaction_id)
    if not transaction or transaction.user_id != user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transaction not found")
    transaction.status = payload.status
    session.add(transaction)
    session.commit()
    session.refresh(transaction)
    return serialize_transaction(transaction)
