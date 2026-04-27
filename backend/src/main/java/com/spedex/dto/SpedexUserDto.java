package com.spedex.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class SpedexUserDto {
    public Long id;
    public String name;
    public String email;
    public String plan;
    @JsonProperty("avatar_initials")
    public String avatarInitials;
    @JsonProperty("member_since")
    public String memberSince; // ISO string
    @JsonProperty("profile_picture_url")
    public String profilePictureUrl;
}
