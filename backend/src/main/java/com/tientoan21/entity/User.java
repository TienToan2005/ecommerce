package com.tientoan21.entity;

import com.tientoan21.enums.UserRole;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;


@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(name = "users")
public class User extends BaseEntity{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String fullName;

    @Column(unique = true,nullable = false)
    private String email;

    @Column(unique = true)
    private String phoneNumber;
    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    private UserRole role;

    private LocalDate birthday;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Address> addresses = new ArrayList<>();

    @OneToOne(fetch = FetchType.LAZY,cascade = CascadeType.ALL)
    private Cart cart;

    @OneToMany(mappedBy = "user" , cascade = CascadeType.ALL)
    private List<Order> orders;

    @Builder.Default
    private boolean isEnabled = false;
    private String verificationCode;
    private LocalDateTime verificationCodeExpiresAt;
}