import { startTransition, useDeferredValue, useEffect, useMemo, useState } from "react";
import QRCode from "react-qr-code";

import { addVendor, getCurrentUser, loadDashboardBundle, login, setAuthToken, signUp, updateProfile, warmUpBackend } from "./api";
import type {
  AnalyticsData,
  BudgetScreenData,
  DashboardOverview,
  Transaction,
  Vendor,
  VendorDirectoryData,
} from "./types";

type ViewId = "home" | "payments" | "analytics" | "budget" | "settings";
type AuthMode = "login" | "signup";

const STORAGE_KEY = "spedex.dashboard.session";

const navItems: Array<{ id: ViewId; label: string; icon: string }> = [
  { id: "home", label: "Overview", icon: "home" },
  { id: "payments", label: "UPI Desk", icon: "wallet" },
  { id: "analytics", label: "Signals", icon: "insights" },
  { id: "budget", label: "Budgets", icon: "calendar_month" },
  { id: "settings", label: "Profile", icon: "settings" },
];

const categoryMeta: Record<string, { emoji: string; icon: string }> = {
  Dining: { emoji: "\u{1F374}", icon: "restaurant" },
  Groceries: { emoji: "\u{1F6D2}", icon: "shopping_basket" },
  Miscellaneous: { emoji: "\u{2728}", icon: "payments" },
  Transport: { emoji: "\u{1F687}", icon: "directions_bus" },
  Bills: { emoji: "\u{1F4A1}", icon: "bolt" },
  Shopping: { emoji: "\u{1F6CD}\u{FE0F}", icon: "shopping_bag" },
  Health: { emoji: "\u{1F48A}", icon: "fitness_center" },
  Rent: { emoji: "\u{1F3E0}", icon: "home_work" },
  Subscriptions: { emoji: "\u{1F4F2}", icon: "cloud" },
  Income: { emoji: "\u{1F4B0}", icon: "payments" },
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: Number.isInteger(amount) ? 0 : 2,
  }).format(amount);
}

function formatDate(isoDate: string) {
  return new Date(isoDate).toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
  });
}

function formatTime(isoDate: string) {
  return new Date(isoDate).toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function monthYear(isoDate: string) {
  return new Date(isoDate).toLocaleDateString("en-IN", {
    month: "short",
    year: "numeric",
  });
}

function categoryEmoji(category: string) {
  return categoryMeta[category]?.emoji ?? "\u{2728}";
}

function categoryLabel(category: string) {
  return `${categoryEmoji(category)} ${category}`;
}

function iconFor(name: string) {
  const map: Record<string, string> = {
    coffee: "local_cafe",
    subway: "subway",
    menu_book: "menu_book",
    restaurant: "restaurant",
    shopping_basket: "shopping_basket",
    directions_car: "directions_car",
    directions_bus: "directions_bus",
    bolt: "bolt",
    wifi: "wifi",
    cloud: "cloud",
    home_work: "home_work",
    fitness_center: "fitness_center",
    shopping_bag: "shopping_bag",
    event_busy: "event_busy",
    insights: "insights",
    payments: "payments",
  };
  return map[name] ?? "payments";
}

function accentClass(accent: string) {
  const map: Record<string, string> = {
    rose: "accent-rose",
    mint: "accent-mint",
    amber: "accent-amber",
    lavender: "accent-lavender",
  };
  return map[accent] ?? "accent-rose";
}

function clampPercent(value: number) {
  return Math.max(0, Math.min(value, 1)) * 100;
}

function BrandLockup({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`brand-lockup ${compact ? "compact" : ""}`}>
      <img className="brand-mark-image" src="/spedex-mark.svg" alt="Spedex logo" />
      <div className="brand-copy">
        <h1>Spedex</h1>
        <p>Smart Wallet</p>
      </div>
    </div>
  );
}

function Sidebar({
  activeView,
  onSelect,
}: {
  activeView: ViewId;
  onSelect: (view: ViewId) => void;
}) {
  return (
    <aside className="sidebar">
      <BrandLockup />

      <div className="sidebar-panel">
        <p className="eyebrow">Workspace</p>
        <strong>Personal Wallet</strong>
        <span className="subtle">1-tap utility payments, smart budgeting, and financial analytics.</span>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <button
            key={item.id}
            className={`nav-button ${item.id === activeView ? "active" : ""}`}
            onClick={() => onSelect(item.id)}
            type="button"
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <a href="/spedex.apk" download className="sidebar-cta" style={{ textDecoration: 'none', textAlign: 'center' }}>
        Download Mobile APK
      </a>
    </aside>
  );
}

function Topbar({
  query,
  onQueryChange,
  overview,
  onSignOut,
}: {
  query: string;
  onQueryChange: (value: string) => void;
  overview: DashboardOverview;
  onSignOut: () => void;
}) {
  return (
    <header className="topbar">
      <div className="topbar-main">
        <BrandLockup compact />
        <div className="searchbar">
          <span className="material-symbols-outlined">search</span>
          <input
            aria-label="Search transactions"
            placeholder="Search payees, reminders, categories, or accounts..."
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
          />
        </div>
      </div>

      <div className="topbar-actions">
        <span className="status-chip">UPI Ready</span>
        <span className="status-chip soft">Member since {monthYear(overview.user.member_since)}</span>
        <button className="signout-button" type="button" onClick={onSignOut}>
          Sign out
        </button>
        <div className="profile-chip">
          <div className="profile-meta">
            <strong>{overview.user.name}</strong>
            <small>{overview.user.plan}</small>
          </div>
          <div className="profile-avatar">{overview.user.avatar_initials}</div>
        </div>
      </div>
    </header>
  );
}

function AuthView({
  mode,
  onModeChange,
  name,
  email,
  password,
  onNameChange,
  onEmailChange,
  onPasswordChange,
  onSubmit,
  submitting,
  error,
}: {
  mode: AuthMode;
  onModeChange: (mode: AuthMode) => void;
  name: string;
  email: string;
  password: string;
  onNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: () => void;
  submitting: boolean;
  error: string | null;
}) {
  return (
    <main className="auth-shell">
      <section className="auth-card">
        <BrandLockup />
        <div className="auth-hero">
          <p className="eyebrow">User Portal</p>
          <h2 className="page-title">
            {mode === "login" ? "Sign in to your personal wallet" : "Create your smart workspace"}
          </h2>
          <p className="subtle">
            Track your subscriptions, utility bills, and daily expenses seamlessly with 1-tap payment routers.
          </p>
        </div>

        <div className="auth-toggle">
          <button
            className={`auth-toggle-button ${mode === "login" ? "active" : ""}`}
            onClick={() => onModeChange("login")}
            type="button"
          >
            Login
          </button>
          <button
            className={`auth-toggle-button ${mode === "signup" ? "active" : ""}`}
            onClick={() => onModeChange("signup")}
            type="button"
          >
            Sign up
          </button>
        </div>

        <div className="auth-form">
          {mode === "signup" ? (
            <input placeholder="Full name" value={name} onChange={(event) => onNameChange(event.target.value)} />
          ) : null}
          <input placeholder="Email" value={email} onChange={(event) => onEmailChange(event.target.value)} />
          <input
            placeholder="Password"
            type="password"
            value={password}
            onChange={(event) => onPasswordChange(event.target.value)}
          />
          {error ? <div className="auth-error">{error}</div> : null}
          <button className="auth-submit" type="button" onClick={onSubmit} disabled={submitting}>
            {submitting ? "Working..." : mode === "login" ? "Enter Spedex" : "Create Account"}
          </button>
        </div>


      </section>
    </main>
  );
}

function AddVendorModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (payload: { name: string; category: string; upi_handle: string; default_amount: number }) => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Dining");
  const [upi, setUpi] = useState("");
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    setSubmitting(true);
    await onSave({ name, category, upi_handle: upi, default_amount: parseFloat(amount) || 0 });
    setSubmitting(false);
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="qr-modal-card" onClick={e => e.stopPropagation()}>
        <h3>Add New Vendor</h3>
        <p className="subtle" style={{marginBottom: 16}}>Create a payee for 1-tap transfers.</p>
        <div className="auth-form">
          <input placeholder="Vendor Name" value={name} onChange={e => setName(e.target.value)} />
          <input placeholder="Category (e.g. Dining, Shopping)" value={category} onChange={e => setCategory(e.target.value)} />
          <input placeholder="UPI Handle (e.g. xyz@oksbi)" value={upi} onChange={e => setUpi(e.target.value)} />
          <input type="number" placeholder="Default Amount" value={amount} onChange={e => setAmount(e.target.value)} />
          <button className="auth-submit" onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Saving..." : "Save Vendor"}
          </button>
        </div>
      </div>
    </div>
  );
}

function QuickPayCard({ vendor }: { vendor: Vendor }) {
  return (
    <button className="quick-pay-card" type="button">
      <div className={`icon-badge ${accentClass(vendor.accent)}`}>
        <span className="emoji-glyph">{categoryEmoji(vendor.category)}</span>
      </div>
      <strong>{vendor.name}</strong>
      <span className="subtle">{categoryLabel(vendor.category)}</span>
      <span className="amount-pill">{formatCurrency(vendor.default_amount)}</span>
    </button>
  );
}

function HomeView({
  overview,
  filteredTransactions,
  onAddVendor,
}: {
  overview: DashboardOverview;
  filteredTransactions: Transaction[];
  onAddVendor: () => void;
}) {
  const weeklyMax = Math.max(...overview.weekly_spending, 1);

  return (
    <div className="dashboard-grid">
      <section className="hero-panel full-width">
        <div>
          <p className="eyebrow">Smart Wallet</p>
          <h2 className="page-title hero-title">Take control of your spending, one tap at a time.</h2>
          <p className="hero-copy">
            Spedex connects your frequent payees, monthly rent reminders, and spending trends into a single tap interface.
          </p>
        </div>
        <div className="hero-metrics">
          <div>
            <span className="metric-label">Monthly spending</span>
            <strong>{formatCurrency(overview.monthly_total)}</strong>
          </div>
          <div>
            <span className="metric-label">Weekly average</span>
            <strong>{formatCurrency(overview.weekly_average)}</strong>
          </div>
        </div>
      </section>

      <div className="left-column">
        <div className="kpi-strip">
          <section className="card spotlight-card">
            <p className="eyebrow">Monthly Spending</p>
            <h2 className="headline">{formatCurrency(overview.monthly_total)}</h2>
            <p className="subtle">Live expense total across your current monthly cycle.</p>
          </section>

          <section className="card">
            <div className="section-header">
              <div>
                <p className="eyebrow">Budget Pace</p>
                <strong>{Math.round(overview.budget_used_ratio * 100)}% used</strong>
              </div>
              <strong>{formatCurrency(overview.monthly_budget)}</strong>
            </div>
            <div className="budget-bar">
              <span style={{ width: `${clampPercent(overview.budget_used_ratio)}%` }} />
            </div>
            <p className="subtle">{overview.budget_copy}</p>
          </section>
        </div>

        <section className="card">
          <div className="section-header">
            <h3 className="page-title section-title">Quick Pay</h3>
            <span className="status-chip soft">3 favourites</span>
          </div>
          <div className="quick-grid">
            {overview.quick_pay.map((vendor) => (
              <QuickPayCard key={vendor.id} vendor={vendor} />
            ))}
            <button className="quick-pay-card add" type="button" onClick={onAddVendor}>
              <div className="icon-badge accent-lavender">
                <span className="material-symbols-outlined">add</span>
              </div>
              <strong>Add payee</strong>
              <span className="subtle">Store a new UPI favourite</span>
            </button>
          </div>
        </section>

        <section className="card">
          <div className="transactions-header">
            <h3 className="page-title section-title">Recent Transactions</h3>
            <span className="status-chip soft">Filtered live</span>
          </div>
          <div className="transactions-list">
            {filteredTransactions.length === 0 ? (
              <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-subtle)", background: "rgba(255,255,255,0.4)", borderRadius: 12 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 48, opacity: 0.5, marginBottom: 8 }}>receipt_long</span>
                <p>No transactions yet.</p>
                <p className="subtle">Record an expense or pay a vendor to see it here.</p>
              </div>
            ) : filteredTransactions.map((transaction) => (
              <div key={transaction.id} className="transaction-row">
                <div className={`icon-badge ${transaction.direction === "income" ? "accent-mint" : "accent-rose"}`}>
                  <span className="emoji-glyph">
                    {transaction.direction === "income" ? categoryEmoji("Income") : categoryEmoji(transaction.category)}
                  </span>
                </div>
                <div>
                  <p className="transaction-title">{transaction.description}</p>
                  <span className="subtle">
                    {formatDate(transaction.occurred_at)} | {formatTime(transaction.occurred_at)} |{" "}
                    {categoryLabel(transaction.category)}
                  </span>
                </div>
                <strong className={transaction.direction === "income" ? "amount-positive" : "amount-negative"}>
                  {transaction.direction === "income" ? "+" : "-"}
                  {formatCurrency(transaction.amount)}
                </strong>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="right-column">
        <section className="card weekly-panel">
          <div className="section-header">
            <p className="eyebrow light">Weekly Spending</p>
            <span className="status-chip inverse">Rolling 4 weeks</span>
          </div>
          <div className="weekly-bars">
            {overview.weekly_spending.map((value, index) => (
              <span
                key={`${value}-${index}`}
                className={index === overview.weekly_spending.length - 1 ? "active" : ""}
                style={{ height: `${Math.max((value / weeklyMax) * 100, 20)}%` }}
              />
            ))}
          </div>
          <div className="section-header">
            <div>
              <p className="subtle light">Peak day</p>
              <strong>{overview.peak_day_label}</strong>
            </div>
            <div>
              <p className="subtle light">Security</p>
              <strong>UPI Protected</strong>
            </div>
          </div>
        </section>

        <section className="card">
          <div className="section-header">
            <h3 className="page-title section-title">Upcoming Reminders</h3>
            <span className="status-chip soft">AutoPay aware</span>
          </div>
          <div className="reminders-list">
            {overview.reminders.map((reminder) => (
              <div key={reminder.id} className="reminder-row">
                <div className="icon-badge accent-lavender">
                  <span className="emoji-glyph">{"\u{1F4C5}"}</span>
                </div>
                <div>
                  <p className="reminder-title">{reminder.title}</p>
                  <span className="subtle">
                    {reminder.subtitle} | {formatDate(reminder.due_date)}
                  </span>
                </div>
                <strong>{formatCurrency(reminder.amount)}</strong>
              </div>
            ))}
          </div>
        </section>

        <section className="card security-card">
          <div className="section-header">
            <span className="material-symbols-outlined">shield_locked</span>
            <strong>Security Update</strong>
          </div>
          <p>{overview.security_message}</p>
        </section>
      </div>
    </div>
  );
}

function PaymentsView({ vendors, onAddVendor }: { vendors: VendorDirectoryData; onAddVendor: () => void }) {
  const [activeVendor, setActiveVendor] = useState<Vendor | null>(null);

  return (
    <div className="payments-shell">
      {activeVendor && (
        <div className="modal-overlay" onClick={() => setActiveVendor(null)}>
          <div className="qr-modal-card" onClick={e => e.stopPropagation()}>
            <h3>Pay {activeVendor.name}</h3>
            <p className="subtle">{activeVendor.upi_handle}</p>
            <div style={{ background: 'white', padding: '16px', borderRadius: '8px', margin: '24px 0' }}>
              <QRCode value={`upi://pay?pa=${activeVendor.upi_handle}&pn=${activeVendor.name}&cu=INR`} size={200} />
            </div>
            <button className="auth-submit" onClick={() => setActiveVendor(null)}>Close</button>
          </div>
        </div>
      )}
      <section className="card">
        <div className="section-header">
          <div>
            <p className="eyebrow">UPI Directory</p>
            <h2 className="page-title section-title">Payees</h2>
          </div>
          <button className="status-chip" onClick={onAddVendor} style={{ cursor: "pointer", border: "none" }}>+ Add</button>
        </div>

        <div className="vendors-list">
          {Object.keys(vendors.groups).length === 0 ? (
            <div style={{ textAlign: "center", padding: "3rem 2rem", color: "var(--text-subtle)", background: "rgba(255,255,255,0.4)", borderRadius: 12 }}>
              <p>Your directory is empty.</p>
              <button className="auth-submit" onClick={onAddVendor} style={{ marginTop: 16 }}>Add your first vendor</button>
            </div>
          ) : Object.entries(vendors.groups).map(([groupName, groupVendors]) => (
            <div key={groupName} className="full-width">
              <div className="section-header">
                <p className="eyebrow">{categoryLabel(groupName)}</p>
              </div>
              {groupVendors.map((vendor) => (
                <div 
                  key={vendor.id} 
                  className="vendor-row" 
                  onClick={() => setActiveVendor(vendor)}
                  style={{ cursor: "pointer" }}
                >
                  <div className={`icon-badge ${accentClass(vendor.accent)}`}>
                    <span className="emoji-glyph">{categoryEmoji(vendor.category)}</span>
                  </div>
                  <div>
                    <p className="vendor-title">{vendor.name}</p>
                    <span className="subtle">{vendor.upi_handle}</span>
                  </div>
                  <div className="vendor-meta">
                    <strong>{formatCurrency(vendor.default_amount)}</strong>
                    <span className="status-chip soft">{categoryLabel(vendor.category)}</span>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function AnalyticsView({ analytics }: { analytics: AnalyticsData }) {
  if (analytics.total_spent === 0) {
    return (
      <div className="analytics-shell">
        <section className="card" style={{ textAlign: "center", padding: "4rem 2rem" }}>
          <span className="material-symbols-outlined" style={{ fontSize: 64, opacity: 0.3, marginBottom: 16 }}>insights</span>
          <h2 className="page-title">No spending data yet.</h2>
          <p className="subtle">Record transactions to unlock intelligent insights, category breakdowns, and weekly pacing metrics.</p>
        </section>
      </div>
    );
  }

  const maxAmount = Math.max(...analytics.weekly_spend.map((item) => item.amount), 1);

  return (
    <div className="analytics-shell">
      <section className="card">
        <div className="section-header">
          <div>
            <p className="eyebrow">Signals</p>
            <h2 className="page-title section-title">Monthly Shape</h2>
          </div>
          <span className="status-chip">Current cycle</span>
        </div>
        <div className="analytics-grid">
          <div className="hero-ring">
            <div className="donut" />
            <div className="donut-content">
              <p className="eyebrow">Total spent</p>
              <h3 className="headline donut-value">{formatCurrency(analytics.total_spent)}</h3>
            </div>
          </div>
          <div className="soft-panel">
            <p className="eyebrow">Smart insight</p>
            <h3 className="headline panel-copy">{analytics.smart_insight}</h3>
          </div>
          <div className="full-width soft-panel">
            <div className="section-header">
              <h3 className="page-title section-title">Weekly Spend</h3>
              <span className="status-chip soft">Week 4 active</span>
            </div>
            <div className="analytics-bars">
              {analytics.weekly_spend.map((week) => (
                <div key={week.week_label} className={`bar-column ${week.is_active ? "active" : ""}`}>
                  <span style={{ height: `${Math.max((week.amount / maxAmount) * 100, 15)}%` }} />
                  <small className="subtle">{week.week_label}</small>
                </div>
              ))}
            </div>
          </div>
          {[analytics.highest_sector, analytics.busiest_day].map((card) => (
            <div className="soft-panel" key={card.title}>
              <p className="eyebrow">{card.title === analytics.highest_sector.title ? "Highest sector" : "Peak day"}</p>
              <h3 className="headline panel-copy compact">{card.title}</h3>
              <p className="subtle">{card.subtitle}</p>
            </div>
          ))}
          <div className="full-width card category-panel">
            <div className="section-header">
              <h3 className="page-title section-title">Category Breakdown</h3>
              <span className="subtle">
                {analytics.weekday_ratio}% weekday / {analytics.weekend_ratio}% weekend
              </span>
            </div>
            <div className="transactions-list">
              {analytics.category_breakdown.map((item) => (
                <div key={item.category} className="transaction-row">
                  <div className={`icon-badge ${accentClass(item.accent)}`}>
                    <span className="emoji-glyph">{categoryEmoji(item.category)}</span>
                  </div>
                  <div>
                    <p className="transaction-title">{categoryLabel(item.category)}</p>
                    <div className="mini-progress">
                      <span style={{ width: `${item.percentage}%` }} />
                    </div>
                  </div>
                  <strong>{item.percentage}%</strong>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function BudgetView({ budget }: { budget: BudgetScreenData }) {
  return (
    <div className="budget-shell">
      <section className="card">
        <div className="section-header">
          <div>
            <p className="eyebrow">Planning</p>
            <h2 className="page-title section-title">Budget Map</h2>
          </div>
          <div>
            <p className="eyebrow">Remaining budget</p>
            <strong>{formatCurrency(budget.remaining_budget)}</strong>
          </div>
        </div>
        <div className="budget-grid">
          {budget.budgets.map((item) => (
            <div key={item.id} className="budget-card">
              <div className={`icon-badge ${accentClass(item.accent)}`}>
                <span className="emoji-glyph">{categoryEmoji(item.category)}</span>
              </div>
              <div>
                <p className="transaction-title">{categoryLabel(item.category)}</p>
                <p className="subtle">
                  {formatCurrency(item.spent)} / {formatCurrency(item.limit_amount)}
                </p>
                <div className="progress-line">
                  <span style={{ width: `${clampPercent(item.progress)}%` }} />
                </div>
              </div>
              <strong>{Math.round(item.progress * 100)}%</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="card">
        <div className="section-header">
          <h2 className="page-title section-title">Upcoming Reminders</h2>
          <span className="status-chip soft">Calendar linked</span>
        </div>
        <div className="reminders-list">
          {budget.reminders.map((reminder) => (
            <div key={reminder.id} className="reminder-row">
              <div className="icon-badge accent-lavender">
                <span className="emoji-glyph">{"\u{23F0}"}</span>
              </div>
              <div>
                <p className="reminder-title">{reminder.title}</p>
                <span className="subtle">
                  {reminder.subtitle} | {formatDate(reminder.due_date)}
                </span>
              </div>
              <strong>{formatCurrency(reminder.amount)}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="card weekly-panel">
        <p className="eyebrow light">Saving Tip</p>
        <h3 className="headline white-copy">Protect more breathing room</h3>
        <p>{budget.savings_tip}</p>
      </section>
    </div>
  );
}

function SettingsView({ overview, onRefresh }: { overview: DashboardOverview; onRefresh: () => Promise<void> }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(overview.user.name);
  const [editPic, setEditPic] = useState(overview.user.profile_picture_url || "");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      await updateProfile({ name: editName, profile_picture_url: editPic });
      await onRefresh();
      setIsEditing(false);
    } catch (e) {
      alert("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="settings-shell">
      <section className="card">
        <div className="section-header">
          <div>
            <p className="eyebrow">Identity</p>
            <h2 className="page-title section-title">Profile</h2>
          </div>
          <button className="status-chip" onClick={() => (isEditing ? handleSave() : setIsEditing(true))} disabled={saving}>
            {saving ? "Saving..." : isEditing ? "Save Changes" : "Edit Profile"}
          </button>
        </div>

        <div className="profile-edit-grid">
          <div className="profile-avatar-large">
            {overview.user.profile_picture_url ? (
              <img src={overview.user.profile_picture_url} alt={overview.user.name} />
            ) : (
              <span>{overview.user.avatar_initials}</span>
            )}
          </div>
          <div className="profile-form">
            {isEditing ? (
              <>
                <div className="auth-form" style={{ gap: 12 }}>
                  <div className="input-field">
                    <label className="eyebrow">Display Name</label>
                    <input value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Full name" />
                  </div>
                  <div className="input-field">
                    <label className="eyebrow">Profile Picture URL</label>
                    <input value={editPic} onChange={(e) => setEditPic(e.target.value)} placeholder="https://..." />
                  </div>
                </div>
              </>
            ) : (
              <div className="profile-meta-static">
                <strong>{overview.user.name}</strong>
                <p className="subtle">{overview.user.email}</p>
                <span className="status-chip soft">{overview.user.plan}</span>
              </div>
            )}
          </div>
        </div>

        <div className="settings-list" style={{ marginTop: 32, borderTop: "1px solid var(--border-color)", paddingTop: 24 }}>
          {[
            ["Payment alerts", "Get a nudge for every large transfer or AutoPay reminder."],
            ["Device lock", "Use biometrics before sensitive UPI or bank actions."],
            ["Weekly digest", "Receive a soft snapshot of spend, trends, and buffers."],
          ].map(([title, subtitle]) => (
            <div key={title} className="setting-row">
              <div className="icon-badge accent-rose">
                <span className="emoji-glyph">✨</span>
              </div>
              <div>
                <p className="setting-title">{title}</p>
                <span className="subtle">{subtitle}</span>
              </div>
              <span className="status-chip">Enabled</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function filterTransactions(transactions: Transaction[], query: string) {
  const lowered = query.trim().toLowerCase();
  if (!lowered) {
    return transactions;
  }
  return transactions.filter((transaction) =>
    `${transaction.description || ""} ${transaction.category || ""} ${transaction.account_label || ""}`
      .toLowerCase()
      .includes(lowered),
  );
}

export default function App() {
  const [activeView, setActiveView] = useState<ViewId>("home");
  const [searchQuery, setSearchQuery] = useState("");
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [vendors, setVendors] = useState<VendorDirectoryData | null>(null);
  const [budget, setBudget] = useState<BudgetScreenData | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [sessionReady, setSessionReady] = useState(false);
  const [sessionUser, setSessionUser] = useState<DashboardOverview["user"] | null>(null);
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [authName, setAuthName] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSubmitting, setAuthSubmitting] = useState(false);
  const [warmingUp, setWarmingUp] = useState(false);
  const [showAddVendor, setShowAddVendor] = useState(false);

  const deferredSearch = useDeferredValue(searchQuery);

  useEffect(() => {
    let mounted = true;

    async function restoreSession() {
      // Warm up Render backend (free tier cold start can take ~15s)
      const isProduction = typeof window !== "undefined" &&
        window.location.hostname !== "localhost" &&
        window.location.hostname !== "127.0.0.1";

      if (isProduction) {
        setWarmingUp(true);
        await warmUpBackend();
        setWarmingUp(false);
      }

      try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw) {
          if (mounted) {
            setSessionReady(true);
          }
          return;
        }

        const parsed = JSON.parse(raw) as { token?: string };
        if (!parsed.token) {
          if (mounted) {
            setSessionReady(true);
          }
          return;
        }

        setAuthToken(parsed.token);
        const currentUser = await getCurrentUser();
        if (mounted) {
          setSessionUser(currentUser);
        }
      } catch {
        setAuthToken(null);
        window.localStorage.removeItem(STORAGE_KEY);
      } finally {
        if (mounted) {
          setSessionReady(true);
        }
      }
    }

    void restoreSession();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!sessionUser) {
      return;
    }

    let mounted = true;

    void loadDashboardBundle()
      .then((bundle) => {
        if (!mounted) {
          return;
        }
        setOverview(bundle.overview);
        setVendors(bundle.vendors);
        setBudget(bundle.budget);
        setAnalytics(bundle.analytics);
      })
      .catch(() => {
        if (!mounted) {
          return;
        }
        setOverview(null);
        setVendors(null);
        setBudget(null);
        setAnalytics(null);
      });

    return () => {
      mounted = false;
    };
  }, [sessionUser]);

  const filteredTransactions = useMemo(
    () => filterTransactions(overview?.recent_transactions ?? [], deferredSearch),
    [overview?.recent_transactions, deferredSearch],
  );

  async function handleAuthSubmit() {
    setAuthSubmitting(true);
    setAuthError(null);
    try {
      const response =
        authMode === "login"
          ? await login({ email: authEmail.trim(), password: authPassword })
          : await signUp({
              name: authName.trim(),
              email: authEmail.trim(),
              password: authPassword,
            });

      setAuthToken(response.access_token);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ token: response.access_token }));
      setSessionUser(response.user);
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "Unable to authenticate");
    } finally {
      setAuthSubmitting(false);
    }
  }

  async function handleRefresh() {
    const bundle = await loadDashboardBundle();
    setOverview(bundle.overview);
    setVendors(bundle.vendors);
    setBudget(bundle.budget);
    setAnalytics(bundle.analytics);
  }

  function handleSignOut() {
    setAuthToken(null);
    window.localStorage.removeItem(STORAGE_KEY);
    setSessionUser(null);
    setActiveView("home");
  }

  async function handleAddVendor(payload: any) {
    try {
      await addVendor(payload);
      setShowAddVendor(false);
      const bundle = await loadDashboardBundle();
      setOverview(bundle.overview);
      setVendors(bundle.vendors);
      setBudget(bundle.budget);
      setAnalytics(bundle.analytics);
    } catch (e) {
      alert("Failed to add vendor.");
    }
  }

  if (warmingUp || !sessionReady) {
    return (
      <main className="auth-shell">
        <section className="auth-card" style={{ textAlign: "center" }}>
          <BrandLockup />
          <p className="eyebrow">{warmingUp ? "Please wait" : "Loading"}</p>
          <h2 className="page-title">
            {warmingUp ? "Waking up server\u2026 (~15s)" : "Restoring your session"}
          </h2>
          {warmingUp && (
            <p className="subtle" style={{ marginTop: 8 }}>
              Render free tier sleeps after inactivity. This only happens once.
            </p>
          )}
        </section>
      </main>
    );
  }

  if (!sessionUser) {
    return (
      <AuthView
        mode={authMode}
        onModeChange={(mode) => setAuthMode(mode)}
        name={authName}
        email={authEmail}
        password={authPassword}
        onNameChange={(value) => setAuthName(value)}
        onEmailChange={(value) => setAuthEmail(value)}
        onPasswordChange={(value) => setAuthPassword(value)}
        onSubmit={handleAuthSubmit}
        submitting={authSubmitting}
        error={authError}
      />
    );
  }

  if (!overview || !vendors || !budget || !analytics) {
    return (
      <main className="auth-shell">
        <section className="auth-card" style={{ textAlign: "center" }}>
          <BrandLockup />
          <p className="eyebrow">Loading</p>
          <h2 className="page-title">Preparing your smart workspace…</h2>
        </section>
      </main>
    );
  }

  let content = <HomeView overview={overview} filteredTransactions={filteredTransactions} onAddVendor={() => setShowAddVendor(true)} />;
  if (activeView === "payments") {
    content = <PaymentsView vendors={vendors} onAddVendor={() => setShowAddVendor(true)} />;
  } else if (activeView === "analytics") {
    content = <AnalyticsView analytics={analytics} />;
  } else if (activeView === "budget") {
    content = <BudgetView budget={budget} />;
  } else if (activeView === "settings") {
    content = <SettingsView overview={overview} onRefresh={handleRefresh} />;
  }

  return (
    <div className="app-shell">
      {showAddVendor && <AddVendorModal onClose={() => setShowAddVendor(false)} onSave={handleAddVendor} />}
      <Sidebar activeView={activeView} onSelect={(view) => startTransition(() => setActiveView(view))} />
      <main className="main-pane">
        <Topbar
          query={searchQuery}
          onQueryChange={(value) => startTransition(() => setSearchQuery(value))}
          overview={overview}
          onSignOut={handleSignOut}
        />
        {content}
      </main>
    </div>
  );
}
