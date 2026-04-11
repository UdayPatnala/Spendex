import type { AnalyticsData, BudgetScreenData, HomeOverview, VendorDirectoryData } from "../types";

export const mockHomeOverview: HomeOverview = {
  user: {
    id: 1,
    name: "Alex Thompson",
    email: "alex@spedex.app",
    plan: "Premium Member",
    avatar_initials: "AT",
    member_since: "2025-02-10T00:00:00Z",
  },
  today_spend: 45,
  today_budget: 50,
  on_track_copy: "You're on track! Only $5 left in your budget for today.",
  quick_pay: [
    { id: 1, name: "Starbucks", category: "Food & Dining", icon: "coffee", accent: "mint", upi_handle: "starbucks@okbank", default_amount: 5.5, is_quick_pay: true },
    { id: 2, name: "Metro", category: "Transport", icon: "subway", accent: "amber", upi_handle: "metro@okicici", default_amount: 2, is_quick_pay: true },
    { id: 3, name: "Zerox", category: "Office", icon: "print", accent: "indigo", upi_handle: "xerox@okaxis", default_amount: 1, is_quick_pay: true },
  ],
  recent_transactions: [
    { id: 1, description: "Artisan Bakery", category: "Food & Drink", amount: 12.4, direction: "expense", payment_method: "UPI", account_label: "Personal Account", status: "completed", occurred_at: "2026-04-04T11:45:00Z" },
    { id: 2, description: "City Transit", category: "Transport", amount: 2.75, direction: "expense", payment_method: "UPI", account_label: "Personal Account", status: "completed", occurred_at: "2026-04-04T08:30:00Z" },
    { id: 3, description: "Whole Foods Market", category: "Food & Drink", amount: 48.2, direction: "expense", payment_method: "Card", account_label: "Debit Card", status: "completed", occurred_at: "2026-04-03T19:20:00Z" },
  ],
};

export const mockBudgetData: BudgetScreenData = {
  remaining_budget: 1240.5,
  budgets: [
    { id: 1, category: "Food & Dining", icon: "restaurant", accent: "mint", spent: 100, limit_amount: 150, progress: 0.66 },
    { id: 2, category: "Transport", icon: "directions_bus", accent: "amber", spent: 45, limit_amount: 80, progress: 0.56 },
    { id: 3, category: "Shopping", icon: "shopping_bag", accent: "indigo", spent: 120, limit_amount: 300, progress: 0.4 },
  ],
  reminders: [
    { id: 1, title: "Monthly Rent Payment", subtitle: "Secure home lease", amount: 2100, due_date: "2026-04-25T00:00:00Z", autopay_enabled: true, status: "scheduled" },
    { id: 2, title: "Electricity Bill", subtitle: "City power utility", amount: 203, due_date: "2026-04-28T00:00:00Z", autopay_enabled: false, status: "scheduled" },
    { id: 3, title: "Cloud Storage Sync", subtitle: "Annual productivity tools", amount: 19, due_date: "2026-05-02T00:00:00Z", autopay_enabled: true, status: "scheduled" },
  ],
  savings_tip: "You've spent 20% less on transport this week than usual. Consider moving that extra cash into your emergency fund.",
};

export const mockVendorDirectory: VendorDirectoryData = {
  user: mockHomeOverview.user,
  groups: {
    "Food & Dining": [
      { id: 4, name: "Blue Bottle Coffee", category: "Food & Dining", icon: "restaurant", accent: "mint", upi_handle: "bluebottle@oksbi", default_amount: 15, is_quick_pay: false },
      { id: 5, name: "Whole Foods Market", category: "Food & Dining", icon: "shopping_basket", accent: "mint", upi_handle: "wholefoods@okhdfc", default_amount: 85.2, is_quick_pay: false },
    ],
    Transport: [
      { id: 6, name: "Uber Technologies", category: "Transport", icon: "directions_car", accent: "amber", upi_handle: "uber@okaxis", default_amount: 24, is_quick_pay: false },
    ],
    Utilities: [
      { id: 7, name: "Con Edison", category: "Utilities", icon: "bolt", accent: "lavender", upi_handle: "conedison@oksbi", default_amount: 142, is_quick_pay: false },
      { id: 8, name: "Verizon Wireless", category: "Utilities", icon: "wifi", accent: "lavender", upi_handle: "verizon@okicici", default_amount: 75, is_quick_pay: false },
    ],
  },
};

export const mockAnalyticsData: AnalyticsData = {
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

