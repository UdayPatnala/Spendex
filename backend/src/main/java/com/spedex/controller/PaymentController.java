package com.spedex.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    @PostMapping("/prepare")
    public ResponseEntity<Map<String, Object>> preparePayment(@RequestBody Map<String, Object> payload) {
        double amount = payload.get("amount") instanceof Number number ? number.doubleValue() : 0.0;
        String payeeName = String.valueOf(payload.getOrDefault("payee_name", "Unknown Vendor"));
        String upiHandle = String.valueOf(payload.getOrDefault("upi_handle", ""));

        Map<String, Object> transaction = new HashMap<>();
        transaction.put("id", System.currentTimeMillis());
        transaction.put("description", "Payment to " + payeeName);
        transaction.put("category", "Payments");
        transaction.put("amount", amount);
        transaction.put("direction", "expense");
        transaction.put("payment_method", "upi");
        transaction.put("account_label", "Primary UPI");
        transaction.put("status", "pending");
        transaction.put("occurred_at", LocalDateTime.now().toString());
        transaction.put("vendor_name", payeeName);

        Map<String, Object> response = new HashMap<>();
        response.put("transaction", transaction);
        response.put("upi_url", "upi://pay?pa=" + upiHandle + "&pn=" + payeeName + "&am=" + amount + "&cu=INR");
        response.put("redirect_message", "Redirecting to UPI app...");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{transactionId}/complete")
    public ResponseEntity<Map<String, Object>> completePayment(@PathVariable Long transactionId, @RequestBody Map<String, String> payload) {
        Map<String, Object> response = new HashMap<>();
        response.put("transaction_id", transactionId);
        response.put("status", payload.getOrDefault("status", "unknown"));
        response.put("message", "Payment state updated");
        return ResponseEntity.ok(response);
    }
}
