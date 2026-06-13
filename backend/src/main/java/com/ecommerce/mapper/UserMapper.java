package com.ecommerce.mapper;

import org.springframework.stereotype.Component;

import com.ecommerce.dto.response.UserResponse;
import com.ecommerce.entity.User;

@Component
public class UserMapper {

    public UserResponse toResponse(User user) {
        if (user == null) {
            return null;
        }
        return new UserResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getRole(),
                user.getIsActive(),
                user.getIsEmailVerified(),
                user.getPhone(),
                user.getProfileImageUrl(),
                user.getCreatedAt()
        );
    }
}