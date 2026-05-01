package com.spedex.controller;

import com.spedex.dto.TransactionDto;
import com.spedex.model.Transaction;
import com.spedex.model.User;
import com.spedex.model.Vendor;
import com.spedex.repository.TransactionRepository;
import com.spedex.repository.UserRepository;
import com.spedex.repository.VendorRepository;
import com.spedex.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private VendorRepository vendorRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private UserService userService;

    @PostMapping("/prepare")
    public ResponseEntity<Map<String, Object>> preparePayment(@RequestBody Map<String, Object> payload) {
        String email = (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = userRepository.findByEmail(email).orElseThrow();
        double amount = payload.get("amount") instanceof Number number ? number.doubleValue() : 0.0;
        String payeeName = String.valueOf(payload.getOrDefault("payee_name", "Unknown Vendor"));
        String upiHandle = String.valueOf(payload.getOrDefault("upi_handle", ""));

        Vendor vendor = null;
        Object vendorId = payload.get("vendor_id");
        if (vendorId instanceof Number number) {
            vendor = vendorRepository.findById(number.longValue()).orElse(null);
        }

        Transaction transaction = new Transaction();
        transaction.setUser(user);
        transaction.setVendor(vendor);
        transaction.setDescription("Payment to " + payeeName);
        transaction.setCategory(vendor == null ? "Payments" : vendor.getCategory());
        transaction.setAmount(amount);
        transaction.setDirection("expense");
        transaction.setPaymentMethod("upi");
        transaction.setAccountLabel("Primary UPI");
        transaction.setStatus("pending");
        transaction.setOccurredAt(LocalDateTime.now());
        transaction = transactionRepository.save(transaction);

        TransactionDto transactionDto = userService.mapToDto(transaction);

        Map<String, Object> response = new HashMap<>();
        response.put("transaction", transactionDto);
        response.put("upi_url", "upi://pay?pa=" + upiHandle + "&pn=" + payeeName + "&am=" + amount + "&cu=INR");
        response.put("redirect_message", "Redirecting to UPI app...");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{transactionId}/complete")
    public ResponseEntity<Map<String, Object>> completePayment(@PathVariable Long transactionId, @RequestBody Map<String, String> payload) {
        String email = (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = userRepository.findByEmail(email).orElseThrow();
        Transaction transaction = transactionRepository.findById(transactionId).orElseThrow();
        if (!transaction.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized");
        }

        String requestedStatus = payload.getOrDefault("status", "failed");
        String normalizedStatus = "completed".equalsIgnoreCase(requestedStatus) || "success".equalsIgnoreCase(requestedStatus)
                ? "success"
                : "failed";
        transaction.setStatus(normalizedStatus);
        transactionRepository.save(transaction);

        Map<String, Object> response = new HashMap<>();
        response.put("transaction_id", transactionId);
        response.put("status", normalizedStatus);
        response.put("message", "Payment state updated");
        return ResponseEntity.ok(response);
    }
}
