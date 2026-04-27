import os

base_dir = r"d:\PROJECT\Spedex\backend\src\main\java\com\example\demo"
packages = ["model", "repository", "controller", "security", "dto"]

for pkg in packages:
    os.makedirs(os.path.join(base_dir, pkg), exist_ok=True)

models = {
    "User.java": """package com.example.demo.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name="users")
public class User {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    @Column(unique=true)
    private String email;
    private String passwordHash;
    private String plan = "Premium";
    private String avatarInitials = "AL";
    private LocalDateTime memberSince = LocalDateTime.now();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }
    public String getPlan() { return plan; }
    public void setPlan(String plan) { this.plan = plan; }
    public String getAvatarInitials() { return avatarInitials; }
    public void setAvatarInitials(String avatarInitials) { this.avatarInitials = avatarInitials; }
    public LocalDateTime getMemberSince() { return memberSince; }
    public void setMemberSince(LocalDateTime memberSince) { this.memberSince = memberSince; }
}
""",
    "Vendor.java": """package com.example.demo.model;

import jakarta.persistence.*;

@Entity
@Table(name="vendors")
public class Vendor {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long userId;
    private String name;
    private String category;
    private String icon;
    private String accent;
    private String upiHandle;
    private Double defaultAmount = 0.0;
    private Boolean isQuickPay = false;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getIcon() { return icon; }
    public void setIcon(String icon) { this.icon = icon; }
    public String getAccent() { return accent; }
    public void setAccent(String accent) { this.accent = accent; }
    public String getUpiHandle() { return upiHandle; }
    public void setUpiHandle(String upiHandle) { this.upiHandle = upiHandle; }
    public Double getDefaultAmount() { return defaultAmount; }
    public void setDefaultAmount(Double defaultAmount) { this.defaultAmount = defaultAmount; }
    public Boolean getIsQuickPay() { return isQuickPay; }
    public void setIsQuickPay(Boolean isQuickPay) { this.isQuickPay = isQuickPay; }
}
"""
}

# Just writing basic entities for now to satisfy the user request smoothly
for file_name, code in models.items():
    with open(os.path.join(base_dir, "model", file_name), "w") as f:
        f.write(code)

print("Models generated.")
