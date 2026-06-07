import { ACCESS_TOKEN_TTL_SECONDS, signAccessToken } from '../../../core/config/crypto.js';
import { HttpError } from '../../../core/http/HttpError.js';
import { AccountRepository } from '../../account/infrastructure/db/AccountRepository.js';
import { SessionRepository } from '../infrastructure/db/SessionRepository.js';
import { generateRefreshToken, hashRefreshToken, lookupForToken, verifyRefreshToken } from './tokenHashing.js';

const REFRESH_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export interface RefreshOutput {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}

export interface RefreshContext {
    userAgent: string;
    ip: string;
}

export class RefreshUseCase {
    constructor(
        private readonly sessions: SessionRepository = new SessionRepository(),
        private readonly accounts: AccountRepository = new AccountRepository()
    ) {}

    async execute(refreshToken: string, context: RefreshContext): Promise<RefreshOutput> {
        const lookup = lookupForToken(refreshToken);
        const session = await this.sessions.findByLookup(lookup);
        if (!session) {
            throw HttpError.unauthorized('invalid refresh token');
        }
        if (session.isExpired()) {
            await this.sessions.deleteByLookup(lookup);
            throw HttpError.unauthorized('refresh token expired');
        }
        const ok = await verifyRefreshToken(session.refreshTokenHash, refreshToken);
        if (!ok) {
            throw HttpError.unauthorized('invalid refresh token');
        }
        const account = await this.accounts.findById(session.accountId);
        if (!account) {
            await this.sessions.deleteByLookup(lookup);
            throw HttpError.unauthorized('account no longer exists');
        }

        await this.sessions.deleteByLookup(lookup);

        const nextRefreshToken = generateRefreshToken();
        const nextHash = await hashRefreshToken(nextRefreshToken);
        const nextLookup = lookupForToken(nextRefreshToken);
        const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_MS);

        await this.sessions.create({
            accountId: account.id,
            refreshTokenHash: nextHash,
            refreshTokenLookup: nextLookup,
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
            refreshToken: nextRefreshToken,
            expiresIn: ACCESS_TOKEN_TTL_SECONDS
        };
    }
}
