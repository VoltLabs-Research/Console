import type { ScopeMask } from '../domain/Token.js';
import { TokenRepository } from '../infrastructure/db/TokenRepository.js';
import { generatePatToken, hashPat, lookupForPat } from './tokenHashing.js';

export interface CreateTokenInput {
    accountId: string;
    label: string;
    scopes: string[];
    scopeMask?: ScopeMask;
    expiresAt?: Date | null;
}

export interface CreateTokenOutput {
    id: string;
    token: string;
    label: string;
    scopes: string[];
    scopeMask: ScopeMask;
    createdAt: Date;
}

export class CreateTokenUseCase {
    constructor(private readonly tokens: TokenRepository = new TokenRepository()) {}

    async execute(input: CreateTokenInput): Promise<CreateTokenOutput> {
        const raw = generatePatToken();
        const hashedToken = await hashPat(raw);
        const lookup = lookupForPat(raw);
        const scopeMask: ScopeMask = input.scopeMask ?? [];

        const token = await this.tokens.create({
            accountId: input.accountId,
            hashedToken,
            lookup,
            label: input.label,
            scopes: input.scopes,
            scopeMask,
            expiresAt: input.expiresAt ?? null
        });

        return {
            id: token.id,
            token: raw,
            label: token.label,
            scopes: token.scopes,
            scopeMask: token.scopeMask,
            createdAt: token.createdAt
        };
    }
}
