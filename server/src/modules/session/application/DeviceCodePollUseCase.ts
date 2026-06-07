import { HttpError } from '../../../core/http/HttpError.js';
import { AccountRepository } from '../../account/infrastructure/db/AccountRepository.js';
import { DeviceAuthorizationRepository } from '../infrastructure/db/DeviceAuthorizationRepository.js';
import { LoginIssueUseCase, type LoginIssueOutput } from './LoginIssueUseCase.js';

export interface DeviceCodePollContext {
    userAgent: string;
    ip: string;
}

export class DeviceCodePollUseCase {
    constructor(
        private readonly devices: DeviceAuthorizationRepository = new DeviceAuthorizationRepository(),
        private readonly accounts: AccountRepository = new AccountRepository(),
        private readonly loginIssue: LoginIssueUseCase = new LoginIssueUseCase()
    ) {}

    async execute(deviceCode: string, context: DeviceCodePollContext): Promise<LoginIssueOutput> {
        const authorization = await this.devices.findByDeviceCode(deviceCode);
        if (!authorization) {
            throw new HttpError(400, 'invalid_grant', 'unknown device code');
        }
        if (authorization.isExpired()) {
            await this.devices.updateStatus(authorization.id, 'expired');
            throw new HttpError(400, 'expired_token', 'device code expired');
        }
        if (authorization.status === 'consumed') {
            throw new HttpError(400, 'invalid_grant', 'device code already consumed');
        }
        if (authorization.status !== 'approved' || !authorization.accountId) {
            throw new HttpError(428, 'authorization_pending', 'authorization pending');
        }

        const account = await this.accounts.findById(authorization.accountId);
        if (!account) {
            throw new HttpError(400, 'invalid_grant', 'approving account no longer exists');
        }

        const tokens = await this.loginIssue.execute(account, context);
        await this.devices.updateStatus(authorization.id, 'consumed');
        return tokens;
    }
}
