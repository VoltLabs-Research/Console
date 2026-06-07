import { HttpError } from '../../../core/http/HttpError.js';
import { DeviceAuthorizationRepository } from '../infrastructure/db/DeviceAuthorizationRepository.js';

export type DeviceDecision = 'approve' | 'deny';

export class ApproveDeviceUseCase {
    constructor(
        private readonly devices: DeviceAuthorizationRepository = new DeviceAuthorizationRepository()
    ) {}

    async execute(userCode: string, accountId: string, decision: DeviceDecision): Promise<void> {
        const normalizedCode = userCode.trim().toUpperCase();
        const authorization = await this.devices.findByUserCode(normalizedCode);
        if (!authorization) {
            throw new HttpError(404, 'unknown_user_code', 'unknown or mistyped code');
        }
        if (authorization.isExpired()) {
            await this.devices.updateStatus(authorization.id, 'expired');
            throw new HttpError(410, 'expired_user_code', 'this code has expired, start again from the CLI');
        }
        if (authorization.status !== 'pending') {
            throw new HttpError(409, 'already_resolved', 'this code was already used');
        }

        if (decision === 'deny') {
            await this.devices.updateStatus(authorization.id, 'expired');
            return;
        }

        await this.devices.updateStatus(authorization.id, 'approved', accountId);
    }
}
