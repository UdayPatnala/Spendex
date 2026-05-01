package com.spedex.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class TransactionDto {
    public Long id;
    public String description;
    public String category;
    public Double amount;
    public String direction;
    @JsonProperty("payment_method")
    public String paymentMethod;
    @JsonProperty("account_label")
    public String accountLabel;
    public String status;
    @JsonProperty("external_reference")
    public String externalReference;
    @JsonProperty("occurred_at")
    public String occurredAt;
    @JsonProperty("vendor_name")
    public String vendorName;
}
