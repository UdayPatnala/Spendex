import { startTransition, useDeferredValue, useEffect, useMemo, useState } from "react";

import { getCurrentUser, loadDashboardBundle, login, setAuthToken, signUp } from "./api";
import { mockAnalytics, mockBudget, mockOverview, mockVendors } from "./mockData";
import type {
  DashboardOverview,
  Transaction,
  VendorDirectoryData,
} from "./types";

type ViewId = "home" | "payments" | "analytics" | "budget" | "settings";
type AuthMode = "login" | "signup";
const STORAGE_KEY = "ledger.dashboard.session";

const navItems: Array<{ id: ViewId; label: string; icon: string }> = [
  { id: "home", label: "Home", icon: "home" },
  { id: "payments", label: "Payments", icon: "account_balance_wallet" },
  { id: "analytics", label: "Analytics", icon: "bar_chart" },
  { id: "budget", label: "Budget", icon: "event_note" },
  { id: "settings", label: "Settings", icon: "settings" },
];

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
}

function formatDate(isoDate: string) {
  return new Date(isoDate).toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
  });
}

function formatTime(isoDate: string) {
  return new Date(isoDate).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function iconFor(name: string) {
  const map: Record<string, string> = {
    coffee: "local_cafe",
    subway: "subway",
    print: "print",
    restaurant: "restaurant",
    shopping_basket: "shopping_basket",
    directions_car: "directions_car",
    bolt: "bolt",
    wifi: "wifi",
    cloud: "cloud",
    home_work: "home_work",
    fitness_center: "fitness_center",
    bakery_dining: "bakery_dining",
    directions_bus: "directions_bus",
    shopping_bag: "shopping_bag",
    event_busy: "event_busy",
  };
  return map[name] ?? "payments";
}

function accentClass(accent: string) {
  const map: Record<string, string> = {
    mint: "accent-mint",
    amber: "accent-amber",
    lavender: "accent-lavender",
    indigo: "accent-indigo",
  };
  return map[accent] ?? "accent-indigo";
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
      <div className="brand-lockup">
        <div className="brand-mark">
          <span className="material-symbols-outlined">account_balance</span>
        </div>
        <div className="brand-copy">
          <h1>Ledger</h1>
          <p>Secure Digital Sanctuary</p>
        </div>
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

      <button className="sidebar-cta" type="button">
        + Send Payment
      </button>
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
      <div className="searchbar">
        <span className="material-symbols-outlined">search</span>
        <input
          aria-label="Search transactions"
          placeholder="Search transactions, bills, or reports..."
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
        />
      </div>

      <div className="topbar-actions">
        <span className="material-symbols-outlined">notifications</span>
        <span className="material-symbols-outlined">shield</span>
        <span className="material-symbols-outlined">help</span>
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
        <div className="brand-lockup">
          <div className="brand-mark">
            <span className="material-symbols-outlined">account_balance</span>
          </div>
          <div className="brand-copy">
            <h1>Ledger</h1>
            <p>Secure Digital Sanctuary</p>
          </div>
        </div>

        <p className="eyebrow">Session Access</p>
        <h2 className="page-title">
          {mode === "login" ? "Sign in to your sanctuary" : "Create a new Ledger account"}
        </h2>
        <p className="subtle">
          {mode === "login"
            ? "Use the seeded demo credentials or sign in with your own account."
            : "New accounts get a starter budget, payees, reminders, and analytics data."}
        </p>

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
            {submitting ? "Working..." : mode === "login" ? "Enter Ledger" : "Create Account"}
          </button>
        </div>

        <p className="subtle">Demo credentials: `alex@ledger.dev` / `ledger123`</p>
      </section>
    </main>
  );
}

function HomeView({
  overview,
  filteredTransactions,
}: {
  overview: DashboardOverview;
  filteredTransactions: Transaction[];
}) {
  const weeklyMax = Math.max(...overview.weekly_spending, 1);

  return (
    <div className="dashboard-grid">
      <div className="left-column">
        <div className="kpi-strip">
          <section className="card">
            <p className="eyebrow">Daily Outlook</p>
            <h2 className="headline">{formatCurrency(overview.monthly_total)}</h2>
            <p className="subtle">Total spending this month</p>
          </section>

          <section className="card">
            <div className="section-header">
              <div>
                <p className="eyebrow">Monthly Budget</p>
                <strong>{Math.round(overview.budget_used_ratio * 100)}% used</strong>
              </div>
              <strong>{formatCurrency(overview.monthly_budget)}</strong>
            </div>
            <div className="budget-bar">
              <span style={{ width: `${overview.budget_used_ratio * 100}%` }} />
            </div>
            <p className="subtle">{overview.budget_copy}</p>
          </section>
        </div>

        <section className="card">
          <div className="section-header">
            <h3 className="page-title">Quick Pay</h3>
            <button className="calendar-pill" type="button">
              Manage Payees
            </button>
          </div>
          <div className="quick-grid">
            {overview.quick_pay.map((vendor) => (
              <button key={vendor.id} className="quick-pay-card" type="button">
                <div className={`icon-badge ${accentClass(vendor.accent)}`}>
                  <span className="material-symbols-outlined">{iconFor(vendor.icon)}</span>
                </div>
                <strong>{vendor.name}</strong>
                <span className="subtle">{formatCurrency(vendor.default_amount)}</span>
              </button>
            ))}
            <button className="quick-pay-card add" type="button">
              <div className="icon-badge accent-indigo">
                <span className="material-symbols-outlined">add</span>
              </div>
              <strong>New</strong>
              <span className="subtle">Quick link</span>
            </button>
          </div>
        </section>

        <section className="card">
          <div className="transactions-header">
            <h3 className="page-title">Recent Transactions</h3>
            <span className="subtle">Download CSV</span>
          </div>
          <div className="transactions-list">
            {filteredTransactions.map((transaction) => (
              <div key={transaction.id} className="transaction-row">
                <div className={`icon-badge ${transaction.direction === "income" ? "accent-mint" : "accent-indigo"}`}>
                  <span className="material-symbols-outlined">
                    {transaction.direction === "income" ? "payments" : "shopping_bag"}
                  </span>
                </div>
                <div>
                  <p className="transaction-title">{transaction.description}</p>
                  <span className="subtle">
                    {formatDate(transaction.occurred_at)} • {formatTime(transaction.occurred_at)} • {transaction.category}
                  </span>
                </div>
                <strong style={{ color: transaction.direction === "income" ? "#0a7b47" : "#c72e2e" }}>
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
            <p className="eyebrow" style={{ color: "rgba(255,255,255,0.72)" }}>
              Weekly Spending
            </p>
            <span className="muted-chip">Aug 18 - 24</span>
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
              <p className="subtle" style={{ color: "rgba(255,255,255,0.72)" }}>
                Peak Day
              </p>
              <strong>{overview.peak_day_label}</strong>
            </div>
            <div>
              <p className="subtle" style={{ color: "rgba(255,255,255,0.72)" }}>
                Weekly Avg
              </p>
              <strong>{formatCurrency(overview.weekly_average)}</strong>
            </div>
          </div>
        </section>

        <section className="card">
          <div className="section-header">
            <h3 className="page-title">Upcoming Reminders</h3>
            <span className="subtle">View Full Calendar</span>
          </div>
          <div className="reminders-list">
            {overview.reminders.map((reminder) => (
              <div key={reminder.id} className="reminder-row">
                <div className="icon-badge accent-indigo">
                  <span className="material-symbols-outlined">calendar_month</span>
                </div>
                <div>
                  <p className="reminder-title">{reminder.title}</p>
                  <span className="subtle">
                    {reminder.subtitle} • {formatDate(reminder.due_date)}
                  </span>
                </div>
                <strong>{formatCurrency(reminder.amount)}</strong>
              </div>
            ))}
          </div>
        </section>

        <section className="card security-card">
          <div className="section-header">
            <span className="material-symbols-outlined">shield</span>
            <strong>Security Update</strong>
          </div>
          <p>{overview.security_message}</p>
        </section>
      </div>
    </div>
  );
}

function PaymentsView({ vendors }: { vendors: VendorDirectoryData }) {
  return (
    <div className="payments-shell">
      <section className="card">
        <div className="section-header">
          <div>
            <p className="eyebrow">Manage Directory</p>
            <h2 className="page-title">Vendors</h2>
          </div>
          <button className="calendar-pill" type="button">
            Add New Vendor
          </button>
        </div>

        <div className="vendors-list">
          {Object.entries(vendors.groups).map(([groupName, groupVendors]) => (
            <div key={groupName} className="full-width">
              <div className="section-header">
                <p className="eyebrow">{groupName}</p>
              </div>
              {groupVendors.map((vendor) => (
                <div key={vendor.id} className="vendor-row">
                  <div className={`icon-badge ${accentClass(vendor.accent)}`}>
                    <span className="material-symbols-outlined">{iconFor(vendor.icon)}</span>
                  </div>
                  <div>
                    <p className="vendor-title">{vendor.name}</p>
                    <span className="subtle">{vendor.upi_handle}</span>
                  </div>
                  <strong>{formatCurrency(vendor.default_amount)}</strong>
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
  const maxAmount = Math.max(...analytics.weekly_spend.map((item) => item.amount), 1);

  return (
    <div className="analytics-shell">
      <section className="card">
        <div className="section-header">
          <div>
            <p className="eyebrow">Monthly Insights</p>
            <h2 className="page-title">Spending Shape</h2>
          </div>
          <span className="muted-chip">Current Month</span>
        </div>
        <div className="analytics-grid">
          <div className="hero-ring">
            <div className="donut" />
            <div className="donut-content">
              <p className="eyebrow">Total Spent</p>
              <h3 className="headline">{formatCurrency(analytics.total_spent)}</h3>
            </div>
          </div>
          <div className="card" style={{ background: "var(--surface-low)" }}>
            <p className="eyebrow">Smart Insight</p>
            <h3 className="headline" style={{ fontSize: "2rem" }}>
              {analytics.smart_insight}
            </h3>
          </div>
          <div className="full-width card" style={{ background: "var(--surface-low)" }}>
            <div className="section-header">
              <h3 className="page-title">Weekly Spend</h3>
              <span className="muted-chip">Week 4 Active</span>
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
          <div className="card">
            <p className="eyebrow">Highest Sector</p>
            <h3 className="headline" style={{ fontSize: "2rem" }}>
              {analytics.highest_sector.title}
            </h3>
            <p className="subtle">{analytics.highest_sector.subtitle}</p>
          </div>
          <div className="card">
            <p className="eyebrow">Busiest Day</p>
            <h3 className="headline" style={{ fontSize: "2rem" }}>
              {analytics.busiest_day.title}
            </h3>
            <p className="subtle">{analytics.busiest_day.subtitle}</p>
          </div>
          <div className="full-width card">
            <div className="section-header">
              <h3 className="page-title">Category Breakdown</h3>
              <span className="subtle">
                {analytics.weekday_ratio}% weekday / {analytics.weekend_ratio}% weekend
              </span>
            </div>
            <div className="transactions-list">
              {analytics.category_breakdown.map((item) => (
                <div key={item.category} className="transaction-row">
                  <div className={`icon-badge ${accentClass(item.accent)}`}>
                    <span className="material-symbols-outlined">pie_chart</span>
                  </div>
                  <div>
                    <p className="transaction-title">{item.category}</p>
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
            <p className="eyebrow">Current Planning</p>
            <h2 className="page-title">Weekly Ledger</h2>
          </div>
          <div>
            <p className="eyebrow">Remaining Budget</p>
            <strong>{formatCurrency(budget.remaining_budget)}</strong>
          </div>
        </div>
        <div className="budget-grid">
          {budget.budgets.map((item) => (
            <div key={item.id} className="budget-card">
              <div className={`icon-badge ${accentClass(item.accent)}`}>
                <span className="material-symbols-outlined">{iconFor(item.icon)}</span>
              </div>
              <div>
                <p className="transaction-title">{item.category}</p>
                <p className="subtle">
                  {formatCurrency(item.spent)} / {formatCurrency(item.limit_amount)}
                </p>
                <div className="progress-line">
                  <span style={{ width: `${item.progress * 100}%` }} />
                </div>
              </div>
              <strong>{Math.round(item.progress * 100)}%</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="card">
        <div className="section-header">
          <h2 className="page-title">Upcoming Reminders</h2>
          <button className="calendar-pill" type="button">
            View Calendar
          </button>
        </div>
        <div className="reminders-list">
          {budget.reminders.map((reminder) => (
            <div key={reminder.id} className="reminder-row">
              <div className="icon-badge accent-indigo">
                <span className="material-symbols-outlined">event</span>
              </div>
              <div>
                <p className="reminder-title">{reminder.title}</p>
                <span className="subtle">
                  {reminder.subtitle} • {formatDate(reminder.due_date)}
                </span>
              </div>
              <strong>{formatCurrency(reminder.amount)}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="card weekly-panel">
        <p className="eyebrow" style={{ color: "rgba(255,255,255,0.72)" }}>
          Proactive Saving Tip
        </p>
        <h3 className="headline" style={{ color: "white", fontSize: "2rem" }}>
          Spend with more breathing room
        </h3>
        <p>{budget.savings_tip}</p>
      </section>
    </div>
  );
}

function SettingsView({ overview }: { overview: DashboardOverview }) {
  return (
    <div className="settings-shell">
      <section className="card">
        <div className="section-header">
          <div>
            <p className="eyebrow">Identity</p>
            <h2 className="page-title">Profile</h2>
          </div>
          <div className="profile-chip">
            <div className="profile-meta">
              <strong>{overview.user.name}</strong>
              <small>{overview.user.plan}</small>
            </div>
            <div className="profile-avatar">{overview.user.avatar_initials}</div>
          </div>
        </div>
        <div className="settings-list">
          {[
            ["Smart Notifications", "Receive reminder and payment alerts."],
            ["Biometric Lock", "Use Face ID or fingerprint for fast entry."],
            ["Weekly Digest", "Get a summary every Monday morning."],
          ].map(([title, subtitle]) => (
            <div key={title} className="setting-row">
              <div className="icon-badge accent-indigo">
                <span className="material-symbols-outlined">tune</span>
              </div>
              <div>
                <p className="setting-title">{title}</p>
                <span className="subtle">{subtitle}</span>
              </div>
              <span className="muted-chip">Enabled</span>
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
    [transaction.description, transaction.category, transaction.account_label]
      .join(" ")
      .toLowerCase()
      .includes(lowered),
  );
}

export default function App() {
  const [activeView, setActiveView] = useState<ViewId>("home");
  const [searchQuery, setSearchQuery] = useState("");
  const [overview, setOverview] = useState(mockOverview);
  const [vendors, setVendors] = useState(mockVendors);
  const [budget, setBudget] = useState(mockBudget);
  const [analytics, setAnalytics] = useState(mockAnalytics);
  const [sessionReady, setSessionReady] = useState(false);
  const [sessionUser, setSessionUser] = useState<DashboardOverview["user"] | null>(null);
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [authName, setAuthName] = useState("");
  const [authEmail, setAuthEmail] = useState("alex@ledger.dev");
  const [authPassword, setAuthPassword] = useState("ledger123");
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSubmitting, setAuthSubmitting] = useState(false);

  const deferredSearch = useDeferredValue(searchQuery);

  useEffect(() => {
    let mounted = true;

    async function restoreSession() {
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

    restoreSession();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!sessionUser) {
      return;
    }

    let mounted = true;

    loadDashboardBundle()
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
        setOverview(mockOverview);
        setVendors(mockVendors);
        setBudget(mockBudget);
        setAnalytics(mockAnalytics);
      });

    return () => {
      mounted = false;
    };
  }, [sessionUser]);

  const filteredTransactions = useMemo(
    () => filterTransactions(overview.recent_transactions, deferredSearch),
    [overview.recent_transactions, deferredSearch],
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

  function handleSignOut() {
    setAuthToken(null);
    window.localStorage.removeItem(STORAGE_KEY);
    setSessionUser(null);
    setActiveView("home");
  }

  if (!sessionReady) {
    return (
      <main className="auth-shell">
        <section className="auth-card">
          <p className="eyebrow">Loading</p>
          <h2 className="page-title">Restoring your Ledger session</h2>
        </section>
      </main>
    );
  }

  if (!sessionUser) {
    return (
      <AuthView
        mode={authMode}
        onModeChange={(mode) => startTransition(() => setAuthMode(mode))}
        name={authName}
        email={authEmail}
        password={authPassword}
        onNameChange={(value) => startTransition(() => setAuthName(value))}
        onEmailChange={(value) => startTransition(() => setAuthEmail(value))}
        onPasswordChange={(value) => startTransition(() => setAuthPassword(value))}
        onSubmit={handleAuthSubmit}
        submitting={authSubmitting}
        error={authError}
      />
    );
  }

  let content = <HomeView overview={overview} filteredTransactions={filteredTransactions} />;
  if (activeView === "payments") {
    content = <PaymentsView vendors={vendors} />;
  } else if (activeView === "analytics") {
    content = <AnalyticsView analytics={analytics} />;
  } else if (activeView === "budget") {
    content = <BudgetView budget={budget} />;
  } else if (activeView === "settings") {
    content = <SettingsView overview={overview} />;
  }

  return (
    <div className="app-shell">
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
