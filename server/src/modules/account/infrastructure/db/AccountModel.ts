import { Schema, model, type HydratedDocument, type InferSchemaType } from 'mongoose';

const accountSchema = new Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true
        },
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true
        },
        passwordHash: {
            type: String,
            required: true
        },
        createdAt: {
            type: Date,
            required: true,
            default: () => new Date()
        }
    },
    {
        collection: 'accounts',
        versionKey: false
    }
);

export type AccountDocument = HydratedDocument<InferSchemaType<typeof accountSchema>>;

export const AccountModel = model('Account', accountSchema);
