package com.spedex.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class VendorDto {
    public Long id;
    public String name;
    public String category;
    public String icon;
    public String accent;
    @JsonProperty("upi_handle")
    public String upiHandle;
    @JsonProperty("default_amount")
    public Double defaultAmount;
    @JsonProperty("is_quick_pay")
    public Boolean isQuickPay;
}
