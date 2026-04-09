package enums;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@AllArgsConstructor
@NoArgsConstructor
public enum ErrorCode {
    INVALID_CREDENTIALS(1000,HttpStatus.BAD_REQUEST,"INVALID_CREDENTIALS"),
    USER_NOT_FOUND(1001,HttpStatus.NOT_FOUND,"User not found"),
    USER_EXISTS(1002,HttpStatus.BAD_REQUEST, "User already exists"),
    CATEGORY_NOT_FOUND(1001,HttpStatus.NOT_FOUND,"Category not found"),
    CATEGORY_EXISTS(1002,HttpStatus.BAD_REQUEST, "Category already exists");
    private int code;
    private HttpStatus status;
    private String message;
}
