package com.tientoan21.exception;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class ApiError {
    private int code;
    private String message;
}
