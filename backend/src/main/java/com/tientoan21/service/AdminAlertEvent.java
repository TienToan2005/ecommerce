package com.tientoan21.service;

/** Cảnh báo gửi cho admin; chỉ được phát đi sau khi transaction chứa nó commit. */
public record AdminAlertEvent(String message) {
}
