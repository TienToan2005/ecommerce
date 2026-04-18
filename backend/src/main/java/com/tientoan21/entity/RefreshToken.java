package com.tientoan21.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.Instant;

@Entity
@Data
@Table(name = "refresh_tokens")
public class RefreshToken {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String token;

    private Instant expiryDate;;

    private boolean revoked;
    @ManyToOne
    private User user;

    @ManyToOne
    private RefreshToken parent;
}
