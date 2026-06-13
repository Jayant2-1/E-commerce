package com.ecommerce.dto.response;

public record DemoBootstrapResponse(
        boolean adminCreated,
        String adminEmail,
        int categoriesCreated,
        int productsCreated,
        int usersCreated,
        int cartsSeeded
) {
}
