package com.tientoan21.mapper;

import com.tientoan21.dto.request.AddressRequest;
import com.tientoan21.dto.response.AddressResponse;
import com.tientoan21.entity.Address;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring")
public interface AddressMapper {
    AddressResponse toAddressResponse(Address address);
    Address toEntity(AddressRequest request);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateAddressFromRequest(AddressRequest request,@MappingTarget Address address);
}
