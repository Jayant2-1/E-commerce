package com.ecommerce.mapper;

import com.ecommerce.dto.response.CartResponse;
import com.ecommerce.dto.response.OrderResponse;
import com.ecommerce.dto.response.ProductResponse;
import com.ecommerce.entity.Cart;
import com.ecommerce.entity.CartItem;
import com.ecommerce.entity.Category;
import com.ecommerce.entity.Inventory;
import com.ecommerce.entity.Order;
import com.ecommerce.entity.OrderItem;
import com.ecommerce.entity.Payment;
import com.ecommerce.entity.Product;
import com.ecommerce.entity.ProductImage;
import com.ecommerce.entity.ShippingAddress;
import com.ecommerce.enums.OrderStatus;
import com.ecommerce.enums.PaymentMethod;
import com.ecommerce.enums.PaymentStatus;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class MapperTest {

    private final ProductMapper productMapper = new ProductMapper();

    @Test
    void productMapperPreservesNestedProductFields() {
        Category category = Category.builder().name("Electronics").slug("electronics").build();
        category.setId(UUID.randomUUID());

        Inventory inventory = Inventory.builder()
                .sku("PHONE-1")
                .stockQuantity(20)
                .reservedQuantity(3)
                .soldQuantity(4)
                .lowStockThreshold(5)
                .inStock(true)
                .build();
        inventory.setId(UUID.randomUUID());

        ProductImage image = ProductImage.builder()
                .imageUrl("https://example.com/phone.jpg")
                .altText("Phone")
                .isPrimary(true)
                .displayOrder(0)
                .build();

        Product product = Product.builder()
                .name("Phone")
                .slug("phone")
                .description("Description")
                .price(new BigDecimal("1000.00"))
                .discountPrice(new BigDecimal("900.00"))
                .active(true)
                .brand("Brand")
                .sku("PHONE-1")
                .avgRating(4.5)
                .totalReviews(12)
                .category(category)
                .inventory(inventory)
                .images(List.of(image))
                .build();
        product.setId(UUID.randomUUID());

        ProductResponse response = productMapper.toResponse(product);

        assertThat(response.id()).isEqualTo(product.getId());
        assertThat(response.effectivePrice()).isEqualByComparingTo("900.00");
        assertThat(response.categoryId()).isEqualTo(category.getId());
        assertThat(response.inventory().availableQuantity()).isEqualTo(17);
        assertThat(response.images()).singleElement().satisfies(mapped ->
                assertThat(mapped.imageUrl()).isEqualTo(image.getImageUrl()));
    }

    @Test
    void cartMapperPreservesTotals() {
        Product product = Product.builder()
                .name("Phone")
                .slug("phone")
                .price(new BigDecimal("100.00"))
                .sku("PHONE-1")
                .build();
        CartItem item = CartItem.builder()
                .product(product)
                .quantity(3)
                .priceAtAddition(new BigDecimal("80.00"))
                .build();
        Cart cart = Cart.builder().items(List.of(item)).build();

        CartResponse response = new CartMapper(productMapper).toResponse(cart);

        assertThat(response.totalItems()).isEqualTo(3);
        assertThat(response.subtotal()).isEqualByComparingTo("240.00");
        assertThat(response.shippingAmount()).isEqualByComparingTo("0.00");
        assertThat(response.totalAmount()).isEqualByComparingTo("240.00");
    }

    @Test
    void orderMapperPreservesOrderItemsPaymentAndAddress() {
        Product product = Product.builder().name("Phone").slug("phone").sku("PHONE-1")
                .price(new BigDecimal("100.00")).build();
        product.setId(UUID.randomUUID());
        OrderItem item = OrderItem.builder()
                .product(product)
                .quantity(2)
                .purchasePrice(new BigDecimal("90.00"))
                .subtotal(new BigDecimal("180.00"))
                .build();
        Payment payment = Payment.builder()
                .amount(new BigDecimal("180.00"))
                .currency("INR")
                .status(PaymentStatus.COMPLETED)
                .method(PaymentMethod.UPI)
                .paidAt(LocalDateTime.now())
                .build();
        Order order = Order.builder()
                .orderNumber("ORD-1")
                .totalPrice(new BigDecimal("200.00"))
                .discountAmount(new BigDecimal("20.00"))
                .finalPrice(new BigDecimal("180.00"))
                .orderStatus(OrderStatus.CONFIRMED)
                .paymentStatus(PaymentStatus.COMPLETED)
                .shippingAddress(ShippingAddress.builder().fullName("Test User").country("India").build())
                .items(List.of(item))
                .payment(payment)
                .build();

        OrderResponse response = new OrderMapper(new AddressMapper()).toResponse(order);

        assertThat(response.orderNumber()).isEqualTo("ORD-1");
        assertThat(response.shippingAddress().fullName()).isEqualTo("Test User");
        assertThat(response.items()).singleElement().satisfies(mapped ->
                assertThat(mapped.productId()).isEqualTo(product.getId()));
        assertThat(response.payment().method()).isEqualTo(PaymentMethod.UPI);
    }
}
