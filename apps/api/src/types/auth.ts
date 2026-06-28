export interface JWTPayload {
    user_id: string;
    email: string;
    username?: string;
    iat: number;
    exp: number;
}

export interface AuthResponse {
    token: string;
    user: {
        id: string;
        email: string;
        username: string;
        avatar_url: string | null;
    }
}
