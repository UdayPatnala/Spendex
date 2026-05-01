package com.spedex.service;

import com.spedex.dto.AuthResponseDto;
import com.spedex.dto.BudgetDto;
import com.spedex.dto.LoginRequestDto;
import com.spedex.dto.ReminderDto;
import com.spedex.dto.SignUpRequestDto;
import com.spedex.dto.SpedexUserDto;
import com.spedex.dto.TransactionDto;
import com.spedex.dto.VendorDto;
import com.spedex.model.Budget;
import com.spedex.model.Reminder;
import com.spedex.model.Transaction;
import com.spedex.model.User;
import com.spedex.model.Vendor;
import com.spedex.repository.UserRepository;
import com.spedex.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    public AuthResponseDto login(LoginRequestDto request) {
        User user = userRepository.findByEmail(request.email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(request.password, user.getPasswordHash())) {
            throw new RuntimeException("Invalid password");
        }

        String token = jwtUtil.generateToken(user.getEmail());
        return new AuthResponseDto(token, mapToDto(user));
    }

    public AuthResponseDto signup(SignUpRequestDto request) {
        if (userRepository.findByEmail(request.email).isPresent()) {
            throw new RuntimeException("Email already exists");
        }

        User user = new User();
        user.setName(request.name);
        user.setEmail(request.email);
        user.setPasswordHash(passwordEncoder.encode(request.password));
        user = userRepository.save(user);

        String token = jwtUtil.generateToken(user.getEmail());
        return new AuthResponseDto(token, mapToDto(user));
    }

    public SpedexUserDto findByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return mapToDto(user);
    }

    public SpedexUserDto updateProfile(String email, SpedexUserDto profileUpdates) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (profileUpdates.name != null) {
            user.setName(profileUpdates.name);
        }
        if (profileUpdates.profilePictureUrl != null) {
            user.setProfilePictureUrl(profileUpdates.profilePictureUrl);
        }

        user = userRepository.save(user);
        return mapToDto(user);
    }

    public SpedexUserDto mapToDto(User user) {
        SpedexUserDto dto = new SpedexUserDto();
        dto.id = user.getId();
        dto.name = user.getName();
        dto.email = user.getEmail();
        dto.plan = user.getPlan();
        dto.avatarInitials = user.getAvatarInitials();
        dto.profilePictureUrl = user.getProfilePictureUrl();
        dto.memberSince = user.getMemberSince().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME);
        return dto;
    }

    public VendorDto mapToDto(Vendor vendor) {
        VendorDto dto = new VendorDto();
        dto.id = vendor.getId();
        dto.name = vendor.getName();
        dto.category = vendor.getCategory();
        dto.icon = vendor.getIcon();
        dto.accent = vendor.getAccent();
        dto.upiHandle = vendor.getUpiHandle();
        dto.defaultAmount = vendor.getDefaultAmount();
        dto.isQuickPay = vendor.getIsQuickPay();
        return dto;
    }

    public TransactionDto mapToDto(Transaction transaction) {
        TransactionDto dto = new TransactionDto();
        dto.id = transaction.getId();
        dto.description = transaction.getDescription();
        dto.category = transaction.getCategory();
        dto.amount = transaction.getAmount();
        dto.direction = transaction.getDirection();
        dto.paymentMethod = transaction.getPaymentMethod();
        dto.accountLabel = transaction.getAccountLabel();
        dto.status = transaction.getStatus();
        dto.externalReference = transaction.getExternalReference();
        dto.occurredAt = transaction.getOccurredAt() == null
                ? null
                : transaction.getOccurredAt().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME);
        dto.vendorName = transaction.getVendor() == null ? null : transaction.getVendor().getName();
        return dto;
    }

    public BudgetDto mapToDto(Budget budget) {
        BudgetDto dto = new BudgetDto();
        dto.id = budget.getId();
        dto.category = budget.getCategory();
        dto.icon = budget.getIcon();
        dto.accent = budget.getAccent();
        dto.spent = budget.getSpent();
        dto.limitAmount = budget.getLimitAmount();
        double spent = budget.getSpent() == null ? 0.0 : budget.getSpent();
        double limitAmount = budget.getLimitAmount() == null ? 0.0 : budget.getLimitAmount();
        dto.progress = limitAmount <= 0 ? 0.0 : spent / limitAmount;
        return dto;
    }

    public ReminderDto mapToDto(Reminder reminder) {
        ReminderDto dto = new ReminderDto();
        dto.id = reminder.getId();
        dto.title = reminder.getTitle();
        dto.subtitle = reminder.getSubtitle();
        dto.amount = reminder.getAmount();
        dto.dueDate = reminder.getDueDate() == null
                ? null
                : reminder.getDueDate().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME);
        dto.autopayEnabled = reminder.getAutopayEnabled();
        dto.status = reminder.getStatus();
        return dto;
    }
}
