import type { ScopeMask } from '../domain/Token.js';
import { TokenRepository } from '../infrastructure/db/TokenRepository.js';

export interface ListedToken {
    id: string;
    label: string;
    scopes: string[];
    scopeMask: ScopeMask;
    lastUsedAt: Date | null;
    expiresAt: Date | null;
    createdAt: Date;
}

export class ListTokensUseCase {
    constructor(private readonly tokens: TokenRepository = new TokenRepository()) {}

    async execute(accountId: string): Promise<ListedToken[]> {
        const tokens = await this.tokens.findByAccountId(accountId);
        return tokens.map((token) => token.toListing());
    }
}
