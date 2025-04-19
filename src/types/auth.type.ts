export interface DecodedToken {
    userId: string;
    username: string;
    role: string;
    exp: number;
    iat: number;
}

export interface LoginResponse {
    status: string;
    results: Array<{
        userId: string;
        email: string;
        role: string;
        accessToken: string;
    }>;
}
