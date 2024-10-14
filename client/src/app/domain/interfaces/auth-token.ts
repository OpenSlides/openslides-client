export interface AuthToken {
    expiresAt: Date;
    userId: number;
    sessionId: string;
    iat: number;
    exp: number;
    rawAccessToken: string;
}
