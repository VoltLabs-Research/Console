import { DeviceAuthorization, type DeviceAuthorizationStatus } from '../../domain/DeviceAuthorization.js';
import { DeviceAuthorizationModel, type DeviceAuthorizationDocument } from './DeviceAuthorizationModel.js';

const toDomain = (doc: DeviceAuthorizationDocument): DeviceAuthorization =>
    new DeviceAuthorization({
        id: doc._id.toString(),
        deviceCode: doc.deviceCode,
        userCode: doc.userCode,
        status: doc.status as DeviceAuthorizationStatus,
        accountId: doc.accountId ? doc.accountId.toString() : null,
        expiresAt: doc.expiresAt,
        createdAt: doc.createdAt
    });

export class DeviceAuthorizationRepository {
    async create(input: { deviceCode: string; userCode: string; expiresAt: Date }): Promise<DeviceAuthorization> {
        const doc = await DeviceAuthorizationModel.create(input);
        return toDomain(doc);
    }

    async findByDeviceCode(deviceCode: string): Promise<DeviceAuthorization | null> {
        const doc = await DeviceAuthorizationModel.findOne({ deviceCode });
        return doc ? toDomain(doc) : null;
    }

    async findByUserCode(userCode: string): Promise<DeviceAuthorization | null> {
        const doc = await DeviceAuthorizationModel.findOne({ userCode });
        return doc ? toDomain(doc) : null;
    }

    async updateStatus(id: string, status: DeviceAuthorizationStatus, accountId?: string): Promise<void> {
        await DeviceAuthorizationModel.updateOne(
            { _id: id },
            { $set: { status, ...(accountId ? { accountId } : {}) } }
        );
    }
}
