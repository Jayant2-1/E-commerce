package com.ecommerce.common;

import com.ecommerce.exception.ErrorCode;
import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.LocalDateTime;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record ApiResponse<T>(
        boolean success,
        String message,
        T data,
        ErrorCode errorCode,
        LocalDateTime timestamp,
        String path
) {
    public static <T> ApiResponse<T> success(String message, T data, String path) {
        return new ApiResponse<>(true, message, data, null, LocalDateTime.now(), path);
    }

    public static ApiResponse<Void> success(String message, String path) {
        return new ApiResponse<>(true, message, null, null, LocalDateTime.now(), path);
    }

    public static ApiResponse<Void> error(String message, ErrorCode errorCode, String path) {
        return new ApiResponse<>(false, message, null, errorCode, LocalDateTime.now(), path);
    }
}
