package com.spedex.controller;

import com.spedex.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    @GetMapping("/dashboard/overview")
    public ResponseEntity<Map<String, Object>> overview() {
        String email = (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return ResponseEntity.ok(dashboardService.getOverview(email));
    }

    @GetMapping("/mobile/vendors")
    public ResponseEntity<Map<String, Object>> vendors() {
        String email = (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return ResponseEntity.ok(dashboardService.getVendors(email));
    }

    @PostMapping({"/mobile/vendors", "/vendors"})
    public ResponseEntity<Map<String, Object>> addVendor(@RequestBody Map<String, String> payload) {
        String email = (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return ResponseEntity.ok(dashboardService.addVendor(email, payload));
    }

    @PutMapping({"/mobile/vendors/{id}", "/vendors/{id}"})
    public ResponseEntity<Map<String, Object>> editVendor(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        String email = (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return ResponseEntity.ok(dashboardService.editVendor(email, id, payload));
    }

    @GetMapping("/mobile/budgets")
    public ResponseEntity<Map<String, Object>> budgets() {
        String email = (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return ResponseEntity.ok(dashboardService.getBudgets(email));
    }

    @GetMapping("/mobile/analytics")
    public ResponseEntity<Map<String, Object>> analytics() {
        String email = (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return ResponseEntity.ok(dashboardService.getAnalytics(email));
    }
}
