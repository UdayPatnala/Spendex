from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    email: str
    plan: str
    avatar_initials: str
    member_since: datetime


class AuthRequest(BaseModel):
    email: str
    password: str = Field(min_length=8)


class SignupRequest(AuthRequest):
    name: str = Field(min_length=2, max_length=80)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class VendorOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    category: str
    icon: str
    accent: str
    upi_handle: str
    default_amount: float
    is_quick_pay: bool


class BudgetOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    category: str
    icon: str
    accent: str
    spent: float
    limit_amount: float
    progress: float


class ReminderOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    subtitle: str
    amount: float
    due_date: datetime
    autopay_enabled: bool
    status: str


class TransactionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    description: str
    category: str
    amount: float
    direction: str
    payment_method: str
    account_label: str
    status: str
    external_reference: str | None
    occurred_at: datetime
    vendor_name: str | None = None


class HomeOverview(BaseModel):
    user: UserOut
    today_spend: float
    today_budget: float
    on_track_copy: str
    quick_pay: list[VendorOut]
    recent_transactions: list[TransactionOut]


class BudgetScreenResponse(BaseModel):
    remaining_budget: float
    budgets: list[BudgetOut]
    reminders: list[ReminderOut]
    savings_tip: str


class VendorDirectoryResponse(BaseModel):
    user: UserOut
    groups: dict[str, list[VendorOut]]


class CategoryBreakdown(BaseModel):
    category: str
    percentage: float
    accent: str


class WeeklySpendPoint(BaseModel):
    week_label: str
    amount: float
    is_active: bool = False


class HighlightCard(BaseModel):
    title: str
    subtitle: str
    accent: str
    icon: str


class AnalyticsResponse(BaseModel):
    total_spent: float
    smart_insight: str
    category_breakdown: list[CategoryBreakdown]
    weekly_spend: list[WeeklySpendPoint]
    highest_sector: HighlightCard
    busiest_day: HighlightCard
    weekday_ratio: float
    weekend_ratio: float


class DashboardOverview(BaseModel):
    user: UserOut
    monthly_total: float
    monthly_budget: float
    budget_used_ratio: float
    budget_copy: str
    quick_pay: list[VendorOut]
    recent_transactions: list[TransactionOut]
    reminders: list[ReminderOut]
    weekly_spending: list[float]
    peak_day_label: str
    weekly_average: float
    security_message: str


class PaymentIntentCreate(BaseModel):
    vendor_id: int | None = None
    amount: float = Field(gt=0)
    upi_handle: str | None = None
    payee_name: str | None = None


class PaymentIntentResponse(BaseModel):
    transaction: TransactionOut
    upi_url: str
    redirect_message: str


class PaymentCompleteRequest(BaseModel):
    status: str = Field(pattern="^(completed|failed|cancelled)$")
