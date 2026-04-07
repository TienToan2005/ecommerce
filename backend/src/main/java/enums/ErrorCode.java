package enums;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@AllArgsConstructor
@NoArgsConstructor
public enum ErrorCode {
    USER_NOT_FOUND(1001,HttpStatus.NOT_FOUND,"User not found");
    private int code;
    private HttpStatus status;
    private String message;
}
