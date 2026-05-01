package com.spedex.service;

import com.spedex.dto.SpedexUserDto;
import com.spedex.dto.VendorDto;
import com.spedex.model.Budget;
import com.spedex.model.Transaction;
import com.spedex.model.User;
import com.spedex.model.Vendor;
import com.spedex.repository.BudgetRepository;
import com.spedex.repository.ReminderRepository;
import com.spedex.repository.TransactionRepository;
import com.spedex.repository.UserRepository;
import com.spedex.repository.VendorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private VendorRepository vendorRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private BudgetRepository budgetRepository;

    @Autowired
    private ReminderRepository reminderRepository;

    @Autowired
    private UserService userService;

    public Map<String, Object> getOverview(String email) {
        User user = userRepository.findByEmail(email).orElseThrow();
        SpedexUserDto userDto = userService.mapToDto(user);
        List<Transaction> transactions = transactionRepository.findByUserId(user.getId());
        List<Budget> budgets = budgetRepository.findByUserId(user.getId());

        double monthlyTotal = expenseTransactions(transactions).stream()
                .mapToDouble(Transaction::getAmount)
                .sum();
        double monthlyBudget = budgets.stream().mapToDouble(Budget::getLimitAmount).sum();
        double safeBudget = monthlyBudget > 0 ? monthlyBudget : 1.0;
        double budgetUsedRatio = monthlyBudget > 0 ? monthlyTotal / safeBudget : 0.0;

        Map<String, Object> overview = new HashMap<>();
        overview.put("user", userDto);
        overview.put("monthly_total", monthlyTotal);
        overview.put("monthly_budget", monthlyBudget);
        overview.put("budget_used_ratio", budgetUsedRatio);
        overview.put(
                "budget_copy",
                monthlyBudget <= 0
                        ? "Set a budget to start tracking your monthly pace."
                        : monthlyTotal > monthlyBudget
                        ? "Warning: You have exceeded your budget!"
                        : "You've spent " + (int) (budgetUsedRatio * 100) + "% of your monthly budget."
        );

        List<VendorDto> quickPay = vendorRepository.findByUserId(user.getId()).stream()
                .filter(Vendor::getIsQuickPay)
                .limit(3)
                .map(userService::mapToDto)
                .collect(Collectors.toList());
        overview.put("quick_pay", quickPay);
        overview.put(
                "recent_transactions",
                transactions.stream()
                        .sorted(Comparator.comparing(Transaction::getOccurredAt, Comparator.nullsLast(Comparator.naturalOrder())).reversed())
                        .limit(5)
                        .map(userService::mapToDto)
                        .collect(Collectors.toList())
        );
        overview.put(
                "reminders",
                reminderRepository.findByUserId(user.getId()).stream()
                        .map(userService::mapToDto)
                        .collect(Collectors.toList())
        );

        List<Integer> weeklySpending = buildWeeklySpending(expenseTransactions(transactions));
        overview.put("weekly_spending", weeklySpending);
        overview.put("peak_day_label", findPeakDayLabel(expenseTransactions(transactions)));
        overview.put("weekly_average", monthlyTotal / 4.0);
        overview.put("security_message", "Your wallet is secured with multi-factor UPI authentication.");
        return overview;
    }

    public Map<String, Object> getMobileHome(String email) {
        User user = userRepository.findByEmail(email).orElseThrow();
        List<Transaction> transactions = transactionRepository.findByUserId(user.getId());
        List<Budget> budgets = budgetRepository.findByUserId(user.getId());
        LocalDate today = LocalDate.now();

        double todaySpend = expenseTransactions(transactions).stream()
                .filter(t -> t.getOccurredAt() != null && t.getOccurredAt().toLocalDate().equals(today))
                .mapToDouble(Transaction::getAmount)
                .sum();
        double monthlyBudget = budgets.stream().mapToDouble(Budget::getLimitAmount).sum();
        double todayBudget = monthlyBudget <= 0 ? 0.0 : monthlyBudget / today.lengthOfMonth();

        Map<String, Object> response = new HashMap<>();
        response.put("user", userService.mapToDto(user));
        response.put("today_spend", todaySpend);
        response.put("today_budget", todayBudget);
        response.put("on_track_copy", buildOnTrackCopy(todaySpend, todayBudget));
        response.put(
                "quick_pay",
                vendorRepository.findByUserId(user.getId()).stream()
                        .filter(Vendor::getIsQuickPay)
                        .limit(6)
                        .map(userService::mapToDto)
                        .collect(Collectors.toList())
        );
        response.put(
                "recent_transactions",
                transactions.stream()
                        .sorted(Comparator.comparing(Transaction::getOccurredAt, Comparator.nullsLast(Comparator.naturalOrder())).reversed())
                        .limit(5)
                        .map(userService::mapToDto)
                        .collect(Collectors.toList())
        );
        return response;
    }

    public Map<String, Object> addVendor(String email, Map<String, String> payload) {
        User user = userRepository.findByEmail(email).orElseThrow();

        String category = normalizeCategory(payload.get("category"));
        String name = payload.getOrDefault("name", "").trim();
        if (name.isEmpty()) {
            throw new RuntimeException("Missing vendor name");
        }

        Vendor vendor = new Vendor();
        vendor.setUser(user);
        vendor.setName(name);
        vendor.setCategory(category);
        vendor.setAccent(resolveAccent(category));
        vendor.setIcon(resolveIcon(category));
        vendor.setUpiHandle(normalizeUpiHandle(payload));
        vendor.setDefaultAmount(parseAmount(payload.get("default_amount")));
        vendor.setIsQuickPay(Boolean.parseBoolean(payload.getOrDefault("is_quick_pay", "false")));

        Vendor savedVendor = vendorRepository.save(vendor);
        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("vendor", userService.mapToDto(savedVendor));
        return response;
    }

    public Map<String, Object> editVendor(String email, Long id, Map<String, String> payload) {
        User user = userRepository.findByEmail(email).orElseThrow();
        Vendor vendor = vendorRepository.findById(id).orElseThrow();

        if (!vendor.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized");
        }

        if (payload.containsKey("name") && payload.get("name") != null) {
            String name = payload.get("name").trim();
            if (name.isEmpty()) {
                throw new RuntimeException("Missing vendor name");
            }
            vendor.setName(name);
        }
        if (payload.containsKey("category") && payload.get("category") != null) {
            String category = normalizeCategory(payload.get("category"));
            vendor.setCategory(category);
            vendor.setAccent(resolveAccent(category));
            vendor.setIcon(resolveIcon(category));
        }
        if (payload.containsKey("upi_handle") || payload.containsKey("phone_number")) {
            vendor.setUpiHandle(normalizeUpiHandle(payload));
        }
        if (payload.containsKey("default_amount")) {
            vendor.setDefaultAmount(parseAmount(payload.get("default_amount")));
        }
        if (payload.containsKey("is_quick_pay")) {
            vendor.setIsQuickPay(Boolean.parseBoolean(payload.get("is_quick_pay")));
        }

        Vendor savedVendor = vendorRepository.save(vendor);
        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("vendor", userService.mapToDto(savedVendor));
        return response;
    }

    public Map<String, Object> getVendors(String email) {
        User user = userRepository.findByEmail(email).orElseThrow();
        List<VendorDto> vendors = vendorRepository.findByUserId(user.getId()).stream()
                .map(userService::mapToDto)
                .collect(Collectors.toList());

        Map<String, List<VendorDto>> groups = vendors.stream()
                .collect(Collectors.groupingBy(vendor -> vendor.category));

        Map<String, Object> response = new HashMap<>();
        response.put("user", userService.mapToDto(user));
        response.put("groups", groups);
        return response;
    }

    public Map<String, Object> getBudgets(String email) {
        User user = userRepository.findByEmail(email).orElseThrow();
        List<Budget> budgets = budgetRepository.findByUserId(user.getId());
        double totalBudget = budgets.stream().mapToDouble(Budget::getLimitAmount).sum();

        Map<String, Object> response = new HashMap<>();
        response.put("remaining_budget", totalBudget);
        response.put("budgets", budgets.stream().map(userService::mapToDto).collect(Collectors.toList()));
        response.put(
                "reminders",
                reminderRepository.findByUserId(user.getId()).stream()
                        .map(userService::mapToDto)
                        .collect(Collectors.toList())
        );
        response.put(
                "savings_tip",
                budgets.isEmpty()
                        ? "Set a budget to start tracking your savings!"
                        : "Switching your coffee subscription to a weekly plan could save you \u20B9400/month."
        );
        return response;
    }

    public Map<String, Object> getAnalytics(String email) {
        User user = userRepository.findByEmail(email).orElseThrow();
        List<Transaction> transactions = transactionRepository.findByUserId(user.getId());
        List<Transaction> expenses = expenseTransactions(transactions);
        double totalSpent = expenses.stream().mapToDouble(Transaction::getAmount).sum();

        Map<String, Double> categoryTotals = expenses.stream()
                .collect(Collectors.groupingBy(Transaction::getCategory, Collectors.summingDouble(Transaction::getAmount)));

        List<Map<String, Object>> categoryBreakdown = categoryTotals.entrySet().stream()
                .sorted(Map.Entry.<String, Double>comparingByValue().reversed())
                .map(entry -> {
                    Map<String, Object> item = new HashMap<>();
                    item.put("category", entry.getKey());
                    item.put("percentage", totalSpent <= 0 ? 0 : (int) Math.round((entry.getValue() / totalSpent) * 100));
                    item.put("accent", resolveAccent(entry.getKey()));
                    return item;
                })
                .collect(Collectors.toList());

        int weekdayRatio = computeWeekdayRatio(expenses);

        Map<String, Object> response = new HashMap<>();
        response.put("total_spent", totalSpent);
        response.put(
                "smart_insight",
                totalSpent == 0
                        ? "You haven't spent anything yet this month. Keep it up!"
                        : "Your spending is tracked in real time across recent categories and weekly pace."
        );
        response.put("category_breakdown", categoryBreakdown);
        response.put("weekly_spend", buildWeeklySpend(expenses));
        response.put("highest_sector", buildHighestSector(categoryTotals));
        response.put("busiest_day", buildBusiestDay(expenses));
        response.put("weekday_ratio", weekdayRatio);
        response.put("weekend_ratio", 100 - weekdayRatio);
        return response;
    }

    private List<Transaction> expenseTransactions(List<Transaction> transactions) {
        return transactions.stream()
                .filter(t -> "expense".equals(t.getDirection()))
                .collect(Collectors.toList());
    }

    private List<Integer> buildWeeklySpending(List<Transaction> transactions) {
        LocalDateTime now = LocalDateTime.now();
        List<Double> weeklySpendingDouble = new ArrayList<>(Arrays.asList(0.0, 0.0, 0.0, 0.0));

        transactions.stream()
                .filter(t -> t.getOccurredAt() != null
                        && t.getOccurredAt().getYear() == now.getYear()
                        && t.getOccurredAt().getMonthValue() == now.getMonthValue())
                .forEach(t -> {
                    int day = t.getOccurredAt().getDayOfMonth();
                    int weekIndex;
                    if (day <= 7) {
                        weekIndex = 0;
                    } else if (day <= 14) {
                        weekIndex = 1;
                    } else if (day <= 21) {
                        weekIndex = 2;
                    } else {
                        weekIndex = 3;
                    }
                    weeklySpendingDouble.set(weekIndex, weeklySpendingDouble.get(weekIndex) + t.getAmount());
                });

        return weeklySpendingDouble.stream().map(Double::intValue).collect(Collectors.toList());
    }

    private List<Map<String, Object>> buildWeeklySpend(List<Transaction> transactions) {
        LocalDateTime now = LocalDateTime.now();
        int activeWeek = Math.min((now.getDayOfMonth() - 1) / 7, 3);
        List<Integer> weeklySpending = buildWeeklySpending(transactions);
        List<Map<String, Object>> result = new ArrayList<>();

        for (int i = 0; i < weeklySpending.size(); i++) {
            Map<String, Object> item = new HashMap<>();
            item.put("week_label", "W" + (i + 1));
            item.put("amount", weeklySpending.get(i));
            item.put("is_active", i == activeWeek);
            result.add(item);
        }

        return result;
    }

    private String findPeakDayLabel(List<Transaction> transactions) {
        return transactions.stream()
                .filter(t -> t.getOccurredAt() != null)
                .collect(Collectors.groupingBy(t -> t.getOccurredAt().getDayOfWeek(), Collectors.summingDouble(Transaction::getAmount)))
                .entrySet()
                .stream()
                .max(Map.Entry.comparingByValue())
                .map(entry -> titleCase(entry.getKey().name()))
                .orElse("N/A");
    }

    private Map<String, Object> buildHighestSector(Map<String, Double> categoryTotals) {
        Map<String, Object> result = new HashMap<>();
        Map.Entry<String, Double> topCategory = categoryTotals.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .orElse(null);

        if (topCategory == null) {
            result.put("title", "N/A");
            result.put("subtitle", "\u20B90 spent");
            result.put("accent", "rose");
            result.put("icon", "payments");
            return result;
        }

        result.put("title", topCategory.getKey());
        result.put("subtitle", "\u20B9" + Math.round(topCategory.getValue()) + " spent");
        result.put("accent", resolveAccent(topCategory.getKey()));
        result.put("icon", resolveIcon(topCategory.getKey()));
        return result;
    }

    private Map<String, Object> buildBusiestDay(List<Transaction> transactions) {
        Map<String, Object> result = new HashMap<>();
        Map.Entry<DayOfWeek, Long> busiest = transactions.stream()
                .filter(t -> t.getOccurredAt() != null)
                .collect(Collectors.groupingBy(t -> t.getOccurredAt().getDayOfWeek(), Collectors.counting()))
                .entrySet()
                .stream()
                .max(Map.Entry.comparingByValue())
                .orElse(null);

        if (busiest == null) {
            result.put("title", "N/A");
            result.put("subtitle", "0 transactions");
        } else {
            result.put("title", titleCase(busiest.getKey().name()));
            result.put("subtitle", busiest.getValue() + " transactions");
        }
        result.put("accent", "mint");
        result.put("icon", "event_busy");
        return result;
    }

    private int computeWeekdayRatio(List<Transaction> transactions) {
        long weekdayCount = transactions.stream()
                .filter(t -> t.getOccurredAt() != null)
                .filter(t -> t.getOccurredAt().getDayOfWeek().getValue() <= 5)
                .count();
        long weekendCount = transactions.stream()
                .filter(t -> t.getOccurredAt() != null)
                .filter(t -> t.getOccurredAt().getDayOfWeek().getValue() > 5)
                .count();
        long totalCount = weekdayCount + weekendCount;
        if (totalCount == 0) {
            return 50;
        }
        return (int) Math.round((weekdayCount * 100.0) / totalCount);
    }

    private String buildOnTrackCopy(double todaySpend, double todayBudget) {
        if (todayBudget <= 0) {
            return "Set a budget to start tracking your daily pace.";
        }
        if (todaySpend <= todayBudget) {
            return "You're within today's budget pace.";
        }
        return "You've crossed today's budget pace. Slow down on quick spends.";
    }

    private String titleCase(String value) {
        String lower = value.toLowerCase();
        return lower.substring(0, 1).toUpperCase() + lower.substring(1);
    }

    private String normalizeCategory(String category) {
        if (category == null || category.isBlank()) {
            return "Miscellaneous";
        }
        return category.trim();
    }

    private String normalizeUpiHandle(Map<String, String> payload) {
        String upiHandle = payload.getOrDefault("upi_handle", "").trim();
        if (!upiHandle.isEmpty()) {
            return upiHandle;
        }

        String phoneNumber = payload.getOrDefault("phone_number", "").trim();
        if (phoneNumber.isEmpty()) {
            throw new RuntimeException("Invalid vendor payment details");
        }
        return phoneNumber.contains("@") ? phoneNumber : phoneNumber + "@upi";
    }

    private double parseAmount(String rawAmount) {
        if (rawAmount == null || rawAmount.isBlank()) {
            return 0.0;
        }
        return Double.parseDouble(rawAmount);
    }

    private String resolveAccent(String category) {
        return switch (category.toLowerCase()) {
            case "dining", "food", "restaurant" -> "rose";
            case "groceries", "shopping" -> "amber";
            case "transport", "travel" -> "mint";
            default -> "lavender";
        };
    }

    private String resolveIcon(String category) {
        return switch (category.toLowerCase()) {
            case "dining", "food", "restaurant" -> "restaurant";
            case "groceries" -> "shopping_basket";
            case "shopping" -> "shopping_bag";
            case "transport", "travel" -> "directions_bus";
            case "bills", "utilities" -> "bolt";
            default -> "payments";
        };
    }
}
