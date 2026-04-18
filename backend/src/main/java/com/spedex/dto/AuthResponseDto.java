package com.spedex.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class AuthResponseDto {
    @JsonProperty("access_token")
    public String accessToken;
    @JsonProperty("token_type")
    public String tokenType = "bearer";
    public SpedexUserDto user;

    public AuthResponseDto(String accessToken, SpedexUserDto user) {
        this.accessToken = accessToken;
        this.user = user;
    }
}
