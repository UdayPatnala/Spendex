export type SpedexUser = {
  id: number;
  name: string;
  email: string;
  plan: string;
  avatar_initials: string;
  member_since: string;
};

export type AuthResponse = {
  access_token: string;
  token_type: "bearer";
  user: SpedexUser;
};

export type Vendor = {
  id: number;
  name: string;
  category: string;
  icon: string;
  accent: string;
  upi_handle: string;
  default_amount: number;
  is_quick_pay: boolean;
};

export type Transaction = {
  id: number;
  description: string;
  category: string;
  amount: number;
  direction: "expense" | "income";
  payment_method: string;
  account_label: string;
  status: string;
  occurred_at: string;
};

export type Reminder = {
  id: number;
  title: string;
  subtitle: string;
  amount: number;
  due_date: string;
  autopay_enabled: boolean;
  status: string;
};

export type BudgetCard = {
  id: number;
  category: string;
  icon: string;
  accent: string;
  spent: number;
  limit_amount: number;
  progress: number;
};

export type DashboardOverview = {
  user: SpedexUser;
  monthly_total: number;
  monthly_budget: number;
  budget_used_ratio: number;
  budget_copy: string;
  quick_pay: Vendor[];
  recent_transactions: Transaction[];
  reminders: Reminder[];
  weekly_spending: number[];
  peak_day_label: string;
  weekly_average: number;
  security_message: string;
};

export type VendorDirectoryData = {
  user: SpedexUser;
  groups: Record<string, Vendor[]>;
};

export type BudgetScreenData = {
  remaining_budget: number;
  budgets: BudgetCard[];
  reminders: Reminder[];
  savings_tip: string;
};

export type AnalyticsData = {
  total_spent: number;
  smart_insight: string;
  category_breakdown: Array<{ category: string; percentage: number; accent: string }>;
  weekly_spend: Array<{ week_label: string; amount: number; is_active: boolean }>;
  highest_sector: { title: string; subtitle: string; accent: string; icon: string };
  busiest_day: { title: string; subtitle: string; accent: string; icon: string };
  weekday_ratio: number;
  weekend_ratio: number;
};
