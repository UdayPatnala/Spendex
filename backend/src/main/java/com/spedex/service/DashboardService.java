package com.spedex.service;

import com.spedex.dto.SpedexUserDto;
import com.spedex.model.User;
import com.spedex.model.Vendor;
import com.spedex.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
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

        List<com.spedex.model.Transaction> transactions = transactionRepository.findByUserId(user.getId());
        double monthlyTotal = transactions.stream()
                .filter(t -> t.getDirection().equals("expense"))
                .mapToDouble(com.spedex.model.Transaction::getAmount)
                .sum();

        List<com.spedex.model.Budget> budgets = budgetRepository.findByUserId(user.getId());
        double monthlyBudget = budgets.stream()
                .mapToDouble(com.spedex.model.Budget::getLimitAmount)
                .sum();
        if (monthlyBudget == 0) monthlyBudget = 1.0; // Avoid division by zero

        Map<String, Object> overview = new HashMap<>();
        overview.put("user", userDto);
        overview.put("monthly_total", monthlyTotal);
        overview.put("monthly_budget", monthlyBudget);
        overview.put("budget_used_ratio", monthlyTotal / monthlyBudget);
        overview.put("budget_copy", monthlyTotal > monthlyBudget ? "Warning: You have exceeded your budget!" : "You've spent " + (int)((monthlyTotal / monthlyBudget) * 100) + "% of your monthly budget.");
        
        List<Vendor> quickPay = vendorRepository.findByUserId(user.getId()).stream()
                .filter(v -> v.getIsQuickPay())
                .limit(3)
                .collect(Collectors.toList());
        overview.put("quick_pay", quickPay);
        
        overview.put("recent_transactions", transactions.stream().limit(5).collect(Collectors.toList()));
        overview.put("reminders", reminderRepository.findByUserId(user.getId()));

        // Calculate weekly spending with date filtering
        LocalDateTime now = LocalDateTime.now();
        List<Double> weeklySpendingDouble = new ArrayList<>(Arrays.asList(0.0, 0.0, 0.0, 0.0));

        transactions.stream()
                .filter(t -> "expense".equals(t.getDirection()))
                .filter(t -> t.getOccurredAt() != null &&
                             t.getOccurredAt().getYear() == now.getYear() &&
                             t.getOccurredAt().getMonthValue() == now.getMonthValue())
                .forEach(t -> {
                    int day = t.getOccurredAt().getDayOfMonth();
                    int weekIndex;
                    if (day <= 7) weekIndex = 0;
                    else if (day <= 14) weekIndex = 1;
                    else if (day <= 21) weekIndex = 2;
                    else weekIndex = 3;

                    weeklySpendingDouble.set(weekIndex, weeklySpendingDouble.get(weekIndex) + t.getAmount());
                });

        List<Integer> weeklySpending = weeklySpendingDouble.stream()
                .map(Double::intValue)
                .collect(Collectors.toList());

        overview.put("weekly_spending", weeklySpending);
        overview.put("peak_day_label", "N/A");
        overview.put("weekly_average", monthlyTotal / 4.0);
        overview.put("security_message", "Your wallet is secured with multi-factor UPI authentication.");

        return overview;
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
        response.put("vendor", savedVendor);
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
        response.put("vendor", savedVendor);
        return response;
    }

    public Map<String, Object> getVendors(String email) {
        User user = userRepository.findByEmail(email).orElseThrow();
        List<Vendor> vendors = vendorRepository.findByUserId(user.getId());
        
        Map<String, List<Vendor>> groups = vendors.stream()
                .collect(Collectors.groupingBy(Vendor::getCategory));

        Map<String, Object> response = new HashMap<>();
        response.put("user", userService.mapToDto(user));
        response.put("groups", groups);
        return response;
    }

    public Map<String, Object> getBudgets(String email) {
        User user = userRepository.findByEmail(email).orElseThrow();
        List<com.spedex.model.Budget> budgets = budgetRepository.findByUserId(user.getId());
        double totalBudget = budgets.stream().mapToDouble(com.spedex.model.Budget::getLimitAmount).sum();
        
        Map<String, Object> response = new HashMap<>();
        response.put("remaining_budget", totalBudget);
        response.put("budgets", budgets);
        response.put("reminders", reminderRepository.findByUserId(user.getId()));
        response.put("savings_tip", budgets.isEmpty() ? "Set a budget to start tracking your savings!" : "Switching your coffee subscription to a weekly plan could save you ₹400/month.");
        return response;
    }

    public Map<String, Object> getAnalytics(String email) {
        User user = userRepository.findByEmail(email).orElseThrow();
        List<com.spedex.model.Transaction> transactions = transactionRepository.findByUserId(user.getId());
        double totalSpent = transactions.stream()
                .filter(t -> t.getDirection().equals("expense"))
                .mapToDouble(com.spedex.model.Transaction::getAmount).sum();

        Map<String, Object> response = new HashMap<>();
        response.put("total_spent", totalSpent);
        response.put("smart_insight", totalSpent == 0 ? "You haven't spent anything yet this month. Keep it up!" : "Your spending is tracked in real-time.");
        response.put("category_breakdown", new ArrayList<>());
        response.put("weekly_spend", new ArrayList<>());
        response.put("highest_sector", Map.of("title", "Dining", "subtitle", "₹0 spent", "accent", "rose", "icon", "restaurant"));
        response.put("busiest_day", Map.of("title", "N/A", "subtitle", "0 transactions", "accent", "mint", "icon", "event_busy"));
        response.put("weekday_ratio", 50);
        response.put("weekend_ratio", 50);
        return response;
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
