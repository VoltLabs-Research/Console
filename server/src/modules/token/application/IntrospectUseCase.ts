import type { ScopeMask } from '../domain/Token.js';
import { AccountRepository } from '../../account/infrastructure/db/AccountRepository.js';
import { TokenRepository } from '../infrastructure/db/TokenRepository.js';
import { isPatTokenFormat, lookupForPat, verifyPat } from './tokenHashing.js';

export interface IntrospectResult {
    active: boolean;
    accountId?: string;
    email?: string;
    username?: string;
    scopes?: string[];
    scopeMask?: ScopeMask;
    expiresAt?: Date | null;
}

export class IntrospectUseCase {
    constructor(
        private readonly tokens: TokenRepository = new TokenRepository(),
        private readonly accounts: AccountRepository = new AccountRepository()
    ) {}

    async execute(rawToken: string): Promise<IntrospectResult> {
        if (!isPatTokenFormat(rawToken)) {
            return { active: false };
        }

        const lookup = lookupForPat(rawToken);
        const candidates = await this.tokens.findByLookup(lookup);
        if (candidates.length === 0) {
            return { active: false };
        }

        for (const candidate of candidates) {
            const ok = await verifyPat(candidate.hashedToken, rawToken).catch(() => false);
            if (!ok) {
                continue;
            }
            if (candidate.isExpired()) {
                return { active: false };
            }

            await this.tokens.touchLastUsed(candidate.id);

            const account = await this.accounts.findById(candidate.accountId);
            return {
                active: true,
                accountId: candidate.accountId,
                email: account?.email,
                username: account?.username,
                scopes: candidate.scopes,
                scopeMask: candidate.scopeMask,
                expiresAt: candidate.expiresAt
            };
        }

        return { active: false };
    }
}
