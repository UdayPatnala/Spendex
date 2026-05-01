package com.spedex.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class BudgetDto {
    public Long id;
    public String category;
    public String icon;
    public String accent;
    public Double spent;
    @JsonProperty("limit_amount")
    public Double limitAmount;
    public Double progress;
}
