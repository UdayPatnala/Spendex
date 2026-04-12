import type { AnalyticsData, BudgetScreenData, DashboardOverview, VendorDirectoryData } from "./types";

export const mockOverview: DashboardOverview = {
  user: {
    id: 1,
    name: "Ananya Rao",
    email: "ananya@spedex.app",
    plan: "Rose Gold",
    avatar_initials: "AR",
    member_since: "2025-02-10T00:00:00Z",
  },
  monthly_total: 31901,
  monthly_budget: 26500,
  budget_used_ratio: 1.2,
  budget_copy: "Budget is over target by 20.4%. A lighter weekend will bring the index back in line.",
  quick_pay: [
    { id: 1, name: "Blue Tokai", category: "Snacks", icon: "coffee", accent: "rose", upi_handle: "bluetokai@okhdfc", default_amount: 240, is_quick_pay: true },
    { id: 2, name: "Namma Metro", category: "Transport", icon: "subway", accent: "amber", upi_handle: "metro@okaxis", default_amount: 60, is_quick_pay: true },
    { id: 3, name: "Sapna Book House", category: "Books", icon: "menu_book", accent: "lavender", upi_handle: "sapnabooks@oksbi", default_amount: 649, is_quick_pay: true },
  ],
  recent_transactions: [
    { id: 1, description: "Blinkit", category: "Groceries", amount: 820, direction: "expense", payment_method: "UPI", account_label: "ICICI UPI", status: "completed", occurred_at: "2026-04-11T19:20:00Z" },
    { id: 2, description: "Salary Credit - Bengaluru Studio", category: "Income", amount: 96000, direction: "income", payment_method: "Bank Transfer", account_label: "Salary Account", status: "completed", occurred_at: "2026-04-08T09:15:00Z" },
    { id: 3, description: "Myntra", category: "Shopping", amount: 2199, direction: "expense", payment_method: "Card", account_label: "HDFC Credit Card", status: "completed", occurred_at: "2026-04-06T18:15:00Z" },
  ],
  reminders: [
    { id: 1, title: "Rent - Indiranagar", subtitle: "UPI AutoPay ready", amount: 22000, due_date: "2026-04-15T00:00:00Z", autopay_enabled: true, status: "scheduled" },
    { id: 2, title: "JioFiber Bill", subtitle: "Broadband recharge", amount: 999, due_date: "2026-04-18T00:00:00Z", autopay_enabled: true, status: "scheduled" },
    { id: 3, title: "Netflix India", subtitle: "Streaming renewal", amount: 649, due_date: "2026-04-22T00:00:00Z", autopay_enabled: false, status: "scheduled" },
  ],
  weekly_spending: [4520, 8860, 6240, 12281],
  peak_day_label: "Saturday (₹12,281)",
  weekly_average: 7975.25,
  security_message: "UPI guardrails are active. Add device lock and payment alerts for every high-value transfer.",
};

export const mockVendors: VendorDirectoryData = {
  user: mockOverview.user,
  groups: {
    Snacks: [
      { id: 4, name: "Zomato", category: "Snacks", icon: "restaurant", accent: "rose", upi_handle: "zomato@okicici", default_amount: 325, is_quick_pay: false },
      { id: 5, name: "Blue Tokai", category: "Snacks", icon: "coffee", accent: "rose", upi_handle: "bluetokai@okhdfc", default_amount: 240, is_quick_pay: false },
    ],
    Groceries: [
      { id: 6, name: "Blinkit", category: "Groceries", icon: "shopping_basket", accent: "mint", upi_handle: "blinkit@okhdfc", default_amount: 820, is_quick_pay: false },
    ],
    Books: [
      { id: 7, name: "Sapna Book House", category: "Books", icon: "menu_book", accent: "lavender", upi_handle: "sapnabooks@oksbi", default_amount: 649, is_quick_pay: false },
    ],
    Transport: [
      { id: 8, name: "Namma Metro", category: "Transport", icon: "directions_bus", accent: "amber", upi_handle: "metro@okaxis", default_amount: 60, is_quick_pay: false },
    ],
    Bills: [
      { id: 9, name: "BESCOM", category: "Bills", icon: "bolt", accent: "amber", upi_handle: "bescom@oksbi", default_amount: 1860, is_quick_pay: false },
      { id: 10, name: "JioFiber", category: "Bills", icon: "wifi", accent: "lavender", upi_handle: "jiofiber@okicici", default_amount: 999, is_quick_pay: false },
    ],
  },
};

export const mockBudget: BudgetScreenData = {
  remaining_budget: 8950,
  budgets: [
    { id: 1, category: "Groceries", icon: "shopping_basket", accent: "mint", spent: 5400, limit_amount: 9000, progress: 0.6 },
    { id: 2, category: "Snacks", icon: "restaurant", accent: "rose", spent: 1650, limit_amount: 3000, progress: 0.55 },
    { id: 3, category: "Books", icon: "menu_book", accent: "lavender", spent: 920, limit_amount: 2500, progress: 0.37 },
    { id: 4, category: "Transport", icon: "directions_bus", accent: "amber", spent: 1180, limit_amount: 4000, progress: 0.295 },
    { id: 5, category: "Shopping", icon: "shopping_bag", accent: "rose", spent: 3420, limit_amount: 8000, progress: 0.4275 },
  ],
  reminders: mockOverview.reminders,
  savings_tip: "Books is still comfortably under plan. Sweep that buffer into your travel or emergency fund before month-end.",
};

export const mockAnalytics: AnalyticsData = {
  total_spent: 31901,
  smart_insight: "Weekend spending is leading at 63.8%. Keeping one low-spend day could soften your shopping bill.",
  category_breakdown: [
    { category: "Rent", percentage: 68.9, accent: "rose" },
    { category: "Shopping", percentage: 6.9, accent: "rose" },
    { category: "Bills", percentage: 9, accent: "amber" },
    { category: "Groceries", percentage: 2.6, accent: "mint" },
  ],
  weekly_spend: [
    { week_label: "Week 1", amount: 4520, is_active: false },
    { week_label: "Week 2", amount: 8860, is_active: false },
    { week_label: "Week 3", amount: 6240, is_active: false },
    { week_label: "Week 4", amount: 12281, is_active: true },
  ],
  highest_sector: { title: "Rent", subtitle: "68.9% of this month's spend is flowing into rent.", accent: "rose", icon: "home_work" },
  busiest_day: { title: "Saturday", subtitle: "Your heaviest outflow this month landed on Saturday at ₹12,281.", accent: "amber", icon: "event_busy" },
  weekday_ratio: 36.2,
  weekend_ratio: 63.8,
};
