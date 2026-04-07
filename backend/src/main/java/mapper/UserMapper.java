package mapper;

import dto.response.UserResponse;
import entity.User;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public class UserMapper {
    UserResponse toUserResponse(User user);
}
