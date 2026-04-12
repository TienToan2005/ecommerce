package com.tientoan21.mapper;

import com.tientoan21.dto.request.UserRequest;
import com.tientoan21.dto.response.UserResponse;
import com.tientoan21.entity.User;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring", uses = {AddressMapper.class, CartMapper.class, OrderMapper.class})
public interface UserMapper {
    UserResponse toUserResponse(User user);
    User toUser(UserRequest request);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateUserFromRequest(UserRequest request, @MappingTarget User user);


}
