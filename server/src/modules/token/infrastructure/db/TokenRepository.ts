import { Token, type ScopeMask } from '../../domain/Token.js';
import { TokenModel, type TokenDocument } from './TokenModel.js';

const toDomain = (doc: TokenDocument): Token => {
    const rawMask = doc.scopeMask as unknown;
    const scopeMask: ScopeMask = rawMask === '*' ? '*' : Array.isArray(rawMask) ? rawMask.map(String) : [];

    return new Token({
        id: doc._id.toString(),
        accountId: doc.accountId.toString(),
        hashedToken: doc.hashedToken,
        lookup: doc.lookup,
        label: doc.label,
        scopes: doc.scopes.map(String),
        scopeMask,
        expiresAt: doc.expiresAt ?? null,
        lastUsedAt: doc.lastUsedAt ?? null,
        createdAt: doc.createdAt
    });
};

export class TokenRepository {
    async create(input: {
        accountId: string;
        hashedToken: string;
        lookup: string;
        label: string;
        scopes: string[];
        scopeMask: ScopeMask;
        expiresAt: Date | null;
    }): Promise<Token> {
        const doc = await TokenModel.create(input);
        return toDomain(doc);
    }

    async findByLookup(lookup: string): Promise<Token[]> {
        const docs = await TokenModel.find({ lookup });
        return docs.map(toDomain);
    }

    async findByAccountId(accountId: string): Promise<Token[]> {
        const docs = await TokenModel.find({ accountId }).sort({ createdAt: -1 });
        return docs.map(toDomain);
    }

    async findByIdAndAccount(id: string, accountId: string): Promise<Token | null> {
        const doc = await TokenModel.findOne({ _id: id, accountId });
        return doc ? toDomain(doc) : null;
    }

    async deleteByIdAndAccount(id: string, accountId: string): Promise<boolean> {
        const res = await TokenModel.deleteOne({ _id: id, accountId });
        return res.deletedCount > 0;
    }

    async touchLastUsed(id: string): Promise<void> {
        await TokenModel.updateOne({ _id: id }, { $set: { lastUsedAt: new Date() } });
    }
}
