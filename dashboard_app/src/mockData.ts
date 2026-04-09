import type { AnalyticsData, BudgetScreenData, DashboardOverview, VendorDirectoryData } from "./types";

export const mockOverview: DashboardOverview = {
  user: {
    id: 1,
    name: "Alex Thompson",
    email: "alex@ledger.dev",
    plan: "Premium Member",
    avatar_initials: "AT",
    member_since: "2025-02-10T00:00:00Z",
  },
  monthly_total: 3482.12,
  monthly_budget: 4800,
  budget_used_ratio: 0.72,
  budget_copy: "You are on track. Spending is 4.2% lower than this time last month.",
  quick_pay: [
    { id: 1, name: "Starbucks", category: "Food & Dining", icon: "coffee", accent: "mint", upi_handle: "starbucks@okbank", default_amount: 5.5, is_quick_pay: true },
    { id: 2, name: "Metro", category: "Transport", icon: "subway", accent: "amber", upi_handle: "metro@okicici", default_amount: 2, is_quick_pay: true },
    { id: 3, name: "Zerox", category: "Office", icon: "print", accent: "indigo", upi_handle: "xerox@okaxis", default_amount: 1, is_quick_pay: true },
  ],
  recent_transactions: [
    { id: 1, description: "Whole Foods Market", category: "Grocery", amount: 142.3, direction: "expense", payment_method: "Debit Card", account_label: "Debit Card ****42", status: "completed", occurred_at: "2026-04-04T10:42:00Z" },
    { id: 2, description: "Salary Deposit - TechFlow Inc.", category: "Income", amount: 4200, direction: "income", payment_method: "Direct Deposit", account_label: "Checking Account", status: "completed", occurred_at: "2026-04-03T09:15:00Z" },
    { id: 3, description: "Uber Trip", category: "Transport", amount: 18.5, direction: "expense", payment_method: "Card", account_label: "Personal Account", status: "completed", occurred_at: "2026-04-02T18:15:00Z" },
  ],
  reminders: [
    { id: 1, title: "Amazon AWS Cloud", subtitle: "Subscription Renewal", amount: 42.99, due_date: "2026-04-28T00:00:00Z", autopay_enabled: true, status: "scheduled" },
    { id: 2, title: "Rent Payment", subtitle: "Auto-pay scheduled", amount: 2100, due_date: "2026-05-02T00:00:00Z", autopay_enabled: true, status: "scheduled" },
    { id: 3, title: "Gym Membership", subtitle: "Wellness plan", amount: 58, due_date: "2026-05-15T00:00:00Z", autopay_enabled: false, status: "scheduled" },
  ],
  weekly_spending: [132, 204, 96, 185, 268, 142, 412],
  peak_day_label: "Saturday ($412)",
  weekly_average: 185.2,
  security_message: "2FA is now available for all external transfers. Enable it in settings for enhanced sanctuary protection.",
};

export const mockVendors: VendorDirectoryData = {
  user: mockOverview.user,
  groups: {
    "Food & Dining": [
      { id: 4, name: "Blue Bottle Coffee", category: "Food & Dining", icon: "restaurant", accent: "mint", upi_handle: "bluebottle@oksbi", default_amount: 15, is_quick_pay: false },
      { id: 5, name: "Whole Foods Market", category: "Food & Dining", icon: "shopping_basket", accent: "mint", upi_handle: "wholefoods@okhdfc", default_amount: 85.2, is_quick_pay: false },
    ],
    Transport: [{ id: 6, name: "Uber Technologies", category: "Transport", icon: "directions_car", accent: "amber", upi_handle: "uber@okaxis", default_amount: 24, is_quick_pay: false }],
    Utilities: [
      { id: 7, name: "Con Edison", category: "Utilities", icon: "bolt", accent: "lavender", upi_handle: "conedison@oksbi", default_amount: 142, is_quick_pay: false },
      { id: 8, name: "Verizon Wireless", category: "Utilities", icon: "wifi", accent: "lavender", upi_handle: "verizon@okicici", default_amount: 75, is_quick_pay: false },
    ],
  },
};

export const mockBudget: BudgetScreenData = {
  remaining_budget: 1240.5,
  budgets: [
    { id: 1, category: "Food & Dining", icon: "restaurant", accent: "mint", spent: 100, limit_amount: 150, progress: 0.66 },
    { id: 2, category: "Transport", icon: "directions_bus", accent: "amber", spent: 45, limit_amount: 80, progress: 0.56 },
    { id: 3, category: "Shopping", icon: "shopping_bag", accent: "indigo", spent: 120, limit_amount: 300, progress: 0.4 },
  ],
  reminders: mockOverview.reminders,
  savings_tip: "You've spent 20% less on transport this week than usual. Consider moving that extra cash into your emergency fund.",
};

export const mockAnalytics: AnalyticsData = {
  total_spent: 4280,
  smart_insight: "Your savings increased by 12% compared to last month.",
  category_breakdown: [
    { category: "Shopping", percentage: 40, accent: "indigo" },
    { category: "Food", percentage: 25, accent: "mint" },
    { category: "Transport", percentage: 15, accent: "amber" },
    { category: "Others", percentage: 20, accent: "lavender" },
  ],
  weekly_spend: [
    { week_label: "Week 1", amount: 210, is_active: false },
    { week_label: "Week 2", amount: 260, is_active: false },
    { week_label: "Week 3", amount: 180, is_active: false },
    { week_label: "Week 4", amount: 320, is_active: true },
  ],
  highest_sector: { title: "Food", subtitle: "You spent $1,070 on dining out this month.", accent: "mint", icon: "restaurant" },
  busiest_day: { title: "Saturday", subtitle: "Weekends account for 64% of your total activity.", accent: "amber", icon: "event_busy" },
  weekday_ratio: 36,
  weekend_ratio: 64,
};

