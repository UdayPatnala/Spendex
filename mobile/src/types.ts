export type SpedexUser = {
  id: number;
  name: string;
  email: string;
  plan: string;
  avatar_initials: string;
  member_since: string;
  profile_picture_url?: string | null;
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
  external_reference?: string | null;
  occurred_at: string;
  vendor_name?: string | null;
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

export type Reminder = {
  id: number;
  title: string;
  subtitle: string;
  amount: number;
  due_date: string;
  autopay_enabled: boolean;
  status: string;
};

export type HomeOverview = {
  user: SpedexUser;
  today_spend: number;
  today_budget: number;
  on_track_copy: string;
  quick_pay: Vendor[];
  recent_transactions: Transaction[];
};

export type BudgetScreenData = {
  remaining_budget: number;
  budgets: BudgetCard[];
  reminders: Reminder[];
  savings_tip: string;
};

export type VendorDirectoryData = {
  user: SpedexUser;
  groups: Record<string, Vendor[]>;
};

export type CategoryBreakdown = {
  category: string;
  percentage: number;
  accent: string;
};

export type WeeklySpendPoint = {
  week_label: string;
  amount: number;
  is_active: boolean;
};

export type HighlightCard = {
  title: string;
  subtitle: string;
  accent: string;
  icon: string;
};

export type AnalyticsData = {
  total_spent: number;
  smart_insight: string;
  category_breakdown: CategoryBreakdown[];
  weekly_spend: WeeklySpendPoint[];
  highest_sector: HighlightCard;
  busiest_day: HighlightCard;
  weekday_ratio: number;
  weekend_ratio: number;
};

export type PaymentIntentResponse = {
  transaction: Transaction;
  upi_url: string;
  redirect_message: string;
};
