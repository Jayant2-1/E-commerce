package com.ecommerce.service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Objects;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ecommerce.dto.response.DemoBootstrapResponse;
import com.ecommerce.entity.Cart;
import com.ecommerce.entity.CartItem;
import com.ecommerce.entity.Category;
import com.ecommerce.entity.Inventory;
import com.ecommerce.entity.Product;
import com.ecommerce.entity.ProductImage;
import com.ecommerce.entity.User;
import com.ecommerce.entity.Wishlist;
import com.ecommerce.enums.Role;
import com.ecommerce.repository.CartItemRepository;
import com.ecommerce.repository.CartRepository;
import com.ecommerce.repository.CategoryRepository;
import com.ecommerce.repository.InventoryRepository;
import com.ecommerce.repository.ProductRepository;
import com.ecommerce.repository.UserRepository;
import com.ecommerce.repository.WishlistRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DemoBootstrapService {

    private static final String ADMIN_EMAIL = "admin@amazon.local";
    private static final String ADMIN_PASSWORD = "admin123";

    private static final List<CategorySeed> CATEGORY_SEEDS = List.of(
            new CategorySeed("Electronics", "electronics", "Phones, laptops, audio, and smart gadgets."),
            new CategorySeed("Computers", "computers", "Desktops, laptops, monitors, and accessories."),
            new CategorySeed("Mobiles", "mobiles", "Smartphones, cases, chargers, and wearables."),
            new CategorySeed("Home & Kitchen", "home-kitchen", "Daily-use essentials for a modern home."),
            new CategorySeed("Fashion", "fashion", "Apparel, footwear, and style essentials."),
            new CategorySeed("Beauty", "beauty", "Skincare, grooming, and wellness products."),
            new CategorySeed("Sports", "sports", "Fitness, outdoor, and athletic gear."),
            new CategorySeed("Books", "books", "Popular titles, learning guides, and bestsellers."),
            new CategorySeed("Toys", "toys", "Playtime, learning, and gifting favorites."),
            new CategorySeed("Groceries", "groceries", "Daily pantry, beverages, and staples.")
    );

    private static final List<UserSeed> USER_SEEDS = List.of(
            new UserSeed("Aarav Sharma", "aarav"),
            new UserSeed("Diya Patel", "diya"),
            new UserSeed("Kabir Singh", "kabir"),
            new UserSeed("Isha Verma", "isha"),
            new UserSeed("Rohan Mehta", "rohan"),
            new UserSeed("Ananya Roy", "ananya"),
            new UserSeed("Vivaan Gupta", "vivaan"),
            new UserSeed("Meera Nair", "meera"),
            new UserSeed("Arjun Das", "arjun"),
            new UserSeed("Sara Khan", "sara")
    );

    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;
    private final WishlistRepository wishlistRepository;
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final InventoryRepository inventoryRepository;

    @Transactional
    public DemoBootstrapResponse bootstrap() {
        boolean adminCreated = ensureAdmin();
        List<Category> categories = ensureCategories();
        List<Product> products = ensureProducts(categories);
        int usersCreated = ensureUsers();
        int cartsSeeded = clearDemoCarts();

        return new DemoBootstrapResponse(adminCreated, ADMIN_EMAIL, categories.size(), products.size(), usersCreated, cartsSeeded);
    }

    @Transactional
    public int clearAllCarts() {
        int cleared = 0;
        List<Cart> carts = cartRepository.findAll();
        for (Cart cart : carts) {
            releaseCartReservations(cart);
            cartItemRepository.deleteAllByCartId(cart.getId());
            cleared++;
        }
        return cleared;
    }

    private boolean ensureAdmin() {
        if (userRepository.existsByEmailIgnoreCase(ADMIN_EMAIL)) {
            User admin = userRepository.findByEmailIgnoreCase(ADMIN_EMAIL).orElseThrow();
            ensureCartAndWishlist(admin);
            return false;
        }

        User admin = userRepository.save(User.builder()
                .fullName("Admin")
                .email(ADMIN_EMAIL)
                .password(passwordEncoder.encode(ADMIN_PASSWORD))
                .role(Role.ADMIN)
                .isActive(true)
                .isEmailVerified(true)
                .phone("9999999999")
                .build());
        ensureCartAndWishlist(admin);
        return true;
    }

    private List<Category> ensureCategories() {
        List<Category> categories = new ArrayList<>();
        for (CategorySeed seed : CATEGORY_SEEDS) {
            Category category = categoryRepository.findBySlug(seed.slug())
                    .orElseGet(() -> categoryRepository.save(Category.builder()
                            .name(seed.name())
                            .slug(seed.slug())
                            .description(seed.description())
                            .imageUrl("https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=1200&q=80&sig=" + seed.slug())
                            .build()));
            categories.add(category);
        }
        return categories;
    }

    private List<Product> ensureProducts(List<Category> categories) {
        List<Product> products = new ArrayList<>();
        int sequence = 1;

        for (Category category : categories) {
            for (int item = 1; item <= 10; item++) {
                int currentSequence = sequence;
                String suffix = String.format(Locale.ROOT, "%02d", item);
                String slug = category.getSlug() + "-premium-" + suffix;
                String sku = category.getSlug().substring(0, Math.min(4, category.getSlug().length())).toUpperCase(Locale.ROOT) + "-" + String.format(Locale.ROOT, "%03d", currentSequence);

                Product product = productRepository.findBySlug(slug).orElse(null);
                if (product == null) {
                    product = productRepository.save(Product.builder()
                            .name(category.getName() + " Premium Item " + suffix)
                            .slug(slug)
                            .description("Best-selling " + category.getName().toLowerCase(Locale.ROOT) + " product with a polished marketplace experience.")
                            .price(BigDecimal.valueOf(499 + (currentSequence * 19L)))
                            .discountPrice(BigDecimal.valueOf(449 + (currentSequence * 17L)))
                            .active(true)
                            .brand(category.getName())
                            .sku(sku)
                            .category(category)
                            .images(new ArrayList<>())
                            .build());
                }

                ensureInventory(product, 120 + (currentSequence % 30));
                ensureImages(product);
                products.add(product);
                sequence++;
            }
        }

        return products;
    }

    private int ensureUsers() {
        int created = 0;
        for (UserSeed seed : USER_SEEDS) {
            String email = seed.username() + "@amazon.local";
            User user = userRepository.findByEmailIgnoreCase(email).orElse(null);
            if (user == null) {
                user = userRepository.save(User.builder()
                        .fullName(seed.fullName())
                        .email(email)
                        .password(passwordEncoder.encode("user12345"))
                        .role(Role.USER)
                        .isActive(true)
                        .isEmailVerified(true)
                        .phone("9" + String.format(Locale.ROOT, "%09d", Math.abs(Objects.hash(email)) % 1_000_000_000L))
                        .build());
                created++;
            }
            ensureCartAndWishlist(user);
        }
        return created;
    }

    private int clearDemoCarts() {
        int cleared = 0;

        for (UserSeed seed : USER_SEEDS) {
            String email = seed.username() + "@amazon.local";
            userRepository.findByEmailIgnoreCase(email).ifPresent(user -> {
                Cart cart = ensureCart(user);
                releaseCartReservations(cart);
                cartItemRepository.deleteAllByCartId(cart.getId());
            });
            cleared++;
        }

        userRepository.findByEmailIgnoreCase(ADMIN_EMAIL).ifPresent(user -> {
            Cart cart = ensureCart(user);
            releaseCartReservations(cart);
            cartItemRepository.deleteAllByCartId(cart.getId());
        });

        return cleared;
    }

    private void releaseCartReservations(Cart cart) {
        if (cart.getItems() == null || cart.getItems().isEmpty()) {
            return;
        }

        for (CartItem item : new ArrayList<>(cart.getItems())) {
            Inventory inventory = inventoryRepository.findByProductId(item.getProduct().getId()).orElse(null);
            if (inventory != null) {
                inventory.releaseReservation(item.getQuantity());
                inventoryRepository.save(inventory);
            }
        }
    }

    private Cart ensureCart(User user) {
        return cartRepository.findByUserId(user.getId())
                .orElseGet(() -> cartRepository.save(Cart.builder().user(user).build()));
    }

    private void ensureCartAndWishlist(User user) {
        ensureCart(user);
        wishlistRepository.findByUserId(user.getId()).stream().findFirst()
                .orElseGet(() -> wishlistRepository.save(Wishlist.builder().user(user).name("My Wishlist").build()));
    }

    private Inventory ensureInventory(Product product, int stockQuantity) {
        return inventoryRepository.findByProductId(product.getId())
                .orElseGet(() -> inventoryRepository.save(Inventory.builder()
                        .product(product)
                        .sku(product.getSku())
                        .stockQuantity(stockQuantity)
                        .reservedQuantity(0)
                        .soldQuantity(0)
                        .lowStockThreshold(10)
                        .inStock(true)
                        .build()));
    }

    private void ensureImages(Product product) {
        if (product.getImages() != null && !product.getImages().isEmpty()) {
            return;
        }

        product.getImages().addAll(List.of(
                image(product, 0, true),
                image(product, 1, false),
                image(product, 2, false)
        ));
        productRepository.save(product);
    }

    private ProductImage image(Product product, int index, boolean primary) {
        return ProductImage.builder()
                .product(product)
                .imageUrl("https://picsum.photos/seed/" + product.getSlug() + "-" + index + "/800/800")
                .altText(product.getName() + " image " + (index + 1))
                .isPrimary(primary)
                .displayOrder(index)
                .build();
    }

    private record CategorySeed(String name, String slug, String description) {}

    private record UserSeed(String fullName, String username) {}
}
