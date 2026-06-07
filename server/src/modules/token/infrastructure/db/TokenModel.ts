import { Schema, model, type HydratedDocument, type InferSchemaType } from 'mongoose';

const tokenSchema = new Schema(
    {
        accountId: { type: Schema.Types.ObjectId, required: true, ref: 'Account', index: true },
        hashedToken: { type: String, required: true },
        lookup: { type: String, required: true, index: true },
        label: { type: String, required: true, trim: true },
        scopes: { type: [String], required: true, default: [] },
        scopeMask: { type: Schema.Types.Mixed, required: true, default: [] },
        expiresAt: { type: Date, required: false, default: null },
        lastUsedAt: { type: Date, required: false, default: null },
        createdAt: { type: Date, required: true, default: () => new Date() }
    },
    {
        collection: 'tokens',
        versionKey: false
    }
);

export type TokenDocument = HydratedDocument<InferSchemaType<typeof tokenSchema>>;

export const TokenModel = model('Token', tokenSchema);
