import { Schema, model, type HydratedDocument, type InferSchemaType } from 'mongoose';

const sessionSchema = new Schema(
    {
        accountId: { type: Schema.Types.ObjectId, required: true, ref: 'Account', index: true },
        refreshTokenHash: { type: String, required: true },
        refreshTokenLookup: { type: String, required: true, index: true, unique: true },
        userAgent: { type: String, default: '' },
        ip: { type: String, default: '' },
        expiresAt: { type: Date, required: true, index: true },
        createdAt: { type: Date, required: true, default: () => new Date() }
    },
    {
        collection: 'sessions',
        versionKey: false
    }
);

export type SessionDocument = HydratedDocument<InferSchemaType<typeof sessionSchema>>;

export const SessionModel = model('Session', sessionSchema);
