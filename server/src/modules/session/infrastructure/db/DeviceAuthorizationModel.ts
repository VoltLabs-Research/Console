import { Schema, model, type HydratedDocument, type InferSchemaType } from 'mongoose';

const deviceAuthorizationSchema = new Schema(
    {
        deviceCode: { type: String, required: true, unique: true, index: true },
        userCode: { type: String, required: true, unique: true, index: true },
        status: {
            type: String,
            required: true,
            enum: ['pending', 'approved', 'consumed', 'expired'],
            default: 'pending'
        },
        accountId: { type: Schema.Types.ObjectId, ref: 'Account', default: null },
        expiresAt: { type: Date, required: true, index: true },
        createdAt: { type: Date, required: true, default: () => new Date() }
    },
    {
        collection: 'device_authorizations',
        versionKey: false
    }
);

export type DeviceAuthorizationDocument = HydratedDocument<InferSchemaType<typeof deviceAuthorizationSchema>>;

export const DeviceAuthorizationModel = model('DeviceAuthorization', deviceAuthorizationSchema);
