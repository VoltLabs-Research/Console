import { Session } from '../../domain/Session.js';
import { SessionModel, type SessionDocument } from './SessionModel.js';

const toDomain = (doc: SessionDocument): Session =>
    new Session({
        id: doc._id.toString(),
        accountId: doc.accountId.toString(),
        refreshTokenHash: doc.refreshTokenHash,
        refreshTokenLookup: doc.refreshTokenLookup,
        userAgent: doc.userAgent,
        ip: doc.ip,
        expiresAt: doc.expiresAt,
        createdAt: doc.createdAt
    });

export class SessionRepository {
    async create(input: {
        accountId: string;
        refreshTokenHash: string;
        refreshTokenLookup: string;
        userAgent: string;
        ip: string;
        expiresAt: Date;
    }): Promise<Session> {
        const doc = await SessionModel.create(input);
        return toDomain(doc);
    }

    async findByLookup(lookup: string): Promise<Session | null> {
        const doc = await SessionModel.findOne({ refreshTokenLookup: lookup });
        return doc ? toDomain(doc) : null;
    }

    async deleteByLookup(lookup: string): Promise<boolean> {
        const res = await SessionModel.deleteOne({ refreshTokenLookup: lookup });
        return res.deletedCount > 0;
    }
}
