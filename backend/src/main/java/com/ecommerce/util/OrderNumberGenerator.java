package com.ecommerce.util;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.concurrent.ThreadLocalRandom;

public final class OrderNumberGenerator {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.BASIC_ISO_DATE;

    private OrderNumberGenerator() {
    }

    public static String nextOrderNumber() {
        int random = ThreadLocalRandom.current().nextInt(100000, 999999);
        return "ORD-" + LocalDate.now().format(DATE_FORMATTER) + "-" + random;
    }
}
