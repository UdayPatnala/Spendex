from __future__ import annotations

from datetime import datetime

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(80))
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    plan: Mapped[str] = mapped_column(String(80), default="Premium")
    avatar_initials: Mapped[str] = mapped_column(String(8), default="AL")
    member_since: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    vendors: Mapped[list["Vendor"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    budgets: Mapped[list["Budget"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    reminders: Mapped[list["Reminder"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    transactions: Mapped[list["Transaction"]] = relationship(back_populates="user", cascade="all, delete-orphan")


class Vendor(Base):
    __tablename__ = "vendors"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    name: Mapped[str] = mapped_column(String(120))
    category: Mapped[str] = mapped_column(String(80), index=True)
    icon: Mapped[str] = mapped_column(String(40))
    accent: Mapped[str] = mapped_column(String(40))
    upi_handle: Mapped[str] = mapped_column(String(120))
    default_amount: Mapped[float] = mapped_column(Float, default=0)
    is_quick_pay: Mapped[bool] = mapped_column(Boolean, default=False)

    user: Mapped["User"] = relationship(back_populates="vendors")
    transactions: Mapped[list["Transaction"]] = relationship(back_populates="vendor")


class Budget(Base):
    __tablename__ = "budgets"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    category: Mapped[str] = mapped_column(String(80))
    icon: Mapped[str] = mapped_column(String(40))
    accent: Mapped[str] = mapped_column(String(40))
    spent: Mapped[float] = mapped_column(Float)
    limit_amount: Mapped[float] = mapped_column(Float)

    user: Mapped["User"] = relationship(back_populates="budgets")


class Reminder(Base):
    __tablename__ = "reminders"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    title: Mapped[str] = mapped_column(String(160))
    subtitle: Mapped[str] = mapped_column(String(160))
    amount: Mapped[float] = mapped_column(Float)
    due_date: Mapped[datetime] = mapped_column(DateTime, index=True)
    autopay_enabled: Mapped[bool] = mapped_column(Boolean, default=False)
    status: Mapped[str] = mapped_column(String(32), default="scheduled")

    user: Mapped["User"] = relationship(back_populates="reminders")


class Transaction(Base):
    __tablename__ = "transactions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    vendor_id: Mapped[int | None] = mapped_column(ForeignKey("vendors.id"), nullable=True)
    description: Mapped[str] = mapped_column(String(160))
    category: Mapped[str] = mapped_column(String(80), index=True)
    amount: Mapped[float] = mapped_column(Float)
    direction: Mapped[str] = mapped_column(String(16), default="expense")
    payment_method: Mapped[str] = mapped_column(String(80), default="UPI")
    account_label: Mapped[str] = mapped_column(String(120), default="Primary Account")
    status: Mapped[str] = mapped_column(String(32), default="completed")
    external_reference: Mapped[str | None] = mapped_column(String(120), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    occurred_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)

    user: Mapped["User"] = relationship(back_populates="transactions")
    vendor: Mapped["Vendor | None"] = relationship(back_populates="transactions")
