
export interface LoginRequest {
    username: string;
    password: string;
}
export interface RegisterRequest {
    phoneNumber: string;
    fullName: string;
    email: string;
    password: string;
    birthday: string;
}
export interface TokenResponse extends RefreshTokenResponse {
    username?: string;
    role?: string;
    authenticated?: boolean;
}
export interface RefreshTokenResponse {
    accessToken: string;
    refreshToken: string;
}
export interface UserRequest {
    fullName?: string;
    email: string;
    phoneNumber: string;
    password?: string;
    role?: string;
    address?: string;
    birthday?: string;
}

export interface UserResponse extends UserRequest {
    id?: number;
    role: string;
    createdAt?: Date;
}
