export type DeviceAuthorizationStatus = 'pending' | 'approved' | 'consumed' | 'expired';

export interface DeviceAuthorizationProps {
    id: string;
    deviceCode: string;
    userCode: string;
    status: DeviceAuthorizationStatus;
    accountId?: string | null;
    expiresAt: Date;
    createdAt: Date;
}

export class DeviceAuthorization {
    public readonly id: string;
    public readonly deviceCode: string;
    public readonly userCode: string;
    public readonly status: DeviceAuthorizationStatus;
    public readonly accountId: string | null;
    public readonly expiresAt: Date;
    public readonly createdAt: Date;

    constructor(props: DeviceAuthorizationProps) {
        this.id = props.id;
        this.deviceCode = props.deviceCode;
        this.userCode = props.userCode;
        this.status = props.status;
        this.accountId = props.accountId ?? null;
        this.expiresAt = props.expiresAt;
        this.createdAt = props.createdAt;
    }

    isExpired(now: Date = new Date()): boolean {
        return this.expiresAt.getTime() <= now.getTime();
    }
}
