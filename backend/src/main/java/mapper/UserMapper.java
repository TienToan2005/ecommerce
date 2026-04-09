package mapper;

import dto.request.UserRequest;
import dto.response.UserResponse;
import entity.User;
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
