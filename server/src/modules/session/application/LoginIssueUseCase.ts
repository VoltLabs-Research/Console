import { ACCESS_TOKEN_TTL_SECONDS, signAccessToken } from '../../../core/config/crypto.js';
import { Account } from '../../account/domain/Account.js';
import { SessionRepository } from '../infrastructure/db/SessionRepository.js';
import { generateRefreshToken, hashRefreshToken, lookupForToken } from './tokenHashing.js';

const REFRESH_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export interface LoginIssueOutput {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    tokenType: 'Bearer';
}

export interface LoginIssueContext {
    userAgent: string;
    ip: string;
}

export class LoginIssueUseCase {
    constructor(private readonly sessions: SessionRepository = new SessionRepository()) {}

    async execute(account: Account, context: LoginIssueContext): Promise<LoginIssueOutput> {
        const refreshToken = generateRefreshToken();
        const refreshTokenHash = await hashRefreshToken(refreshToken);
        const refreshTokenLookup = lookupForToken(refreshToken);
        const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_MS);

        await this.sessions.create({
            accountId: account.id,
            refreshTokenHash,
            refreshTokenLookup,
            userAgent: context.userAgent,
            ip: context.ip,
            expiresAt
        });

        const accessToken = await signAccessToken({
            accountId: account.id,
            email: account.email,
            username: account.username
        });

        return {
            accessToken,
            refreshToken,
            expiresIn: ACCESS_TOKEN_TTL_SECONDS,
            tokenType: 'Bearer'
        };
    }
}
