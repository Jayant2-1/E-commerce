package com.ecommerce.mapper;

import com.ecommerce.dto.request.ShippingAddressRequest;
import com.ecommerce.dto.response.AddressResponse;
import com.ecommerce.dto.response.ShippingAddressResponse;
import com.ecommerce.entity.Address;
import com.ecommerce.entity.ShippingAddress;
import org.springframework.stereotype.Component;

@Component
public class AddressMapper {

    public AddressResponse toResponse(Address address) {
        if (address == null) {
            return null;
        }
        return new AddressResponse(
                address.getId(),
                address.getFullName(),
                address.getPhone(),
                address.getAddressLine1(),
                address.getAddressLine2(),
                address.getCity(),
                address.getState(),
                address.getPostalCode(),
                address.getCountry(),
                address.getAddressType(),
                address.getIsDefault()
        );
    }

    public ShippingAddress toShippingAddress(Address address) {
        if (address == null) {
            return null;
        }
        return ShippingAddress.builder()
                .fullName(address.getFullName())
                .phone(address.getPhone())
                .addressLine1(address.getAddressLine1())
                .addressLine2(address.getAddressLine2())
                .city(address.getCity())
                .state(address.getState())
                .postalCode(address.getPostalCode())
                .country(address.getCountry())
                .build();
    }

    public ShippingAddress toShippingAddress(ShippingAddressRequest request) {
        if (request == null) {
            return null;
        }
        return ShippingAddress.builder()
                .fullName(request.fullName())
                .phone(request.phone())
                .addressLine1(request.addressLine1())
                .addressLine2(request.addressLine2())
                .city(request.city())
                .state(request.state())
                .postalCode(request.postalCode())
                .country(request.country())
                .build();
    }

    public ShippingAddressResponse toShippingAddressResponse(ShippingAddress address) {
        if (address == null) {
            return null;
        }
        return new ShippingAddressResponse(
                address.getFullName(),
                address.getPhone(),
                address.getAddressLine1(),
                address.getAddressLine2(),
                address.getCity(),
                address.getState(),
                address.getPostalCode(),
                address.getCountry()
        );
    }
}
