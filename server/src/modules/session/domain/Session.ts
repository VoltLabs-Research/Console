export interface SessionProps {
    id: string;
    accountId: string;
    refreshTokenHash: string;
    refreshTokenLookup: string;
    userAgent: string;
    ip: string;
    expiresAt: Date;
    createdAt: Date;
}

export class Session {
    public readonly id: string;
    public readonly accountId: string;
    public readonly refreshTokenHash: string;
    public readonly refreshTokenLookup: string;
    public readonly userAgent: string;
    public readonly ip: string;
    public readonly expiresAt: Date;
    public readonly createdAt: Date;

    constructor(props: SessionProps) {
        this.id = props.id;
        this.accountId = props.accountId;
        this.refreshTokenHash = props.refreshTokenHash;
        this.refreshTokenLookup = props.refreshTokenLookup;
        this.userAgent = props.userAgent;
        this.ip = props.ip;
        this.expiresAt = props.expiresAt;
        this.createdAt = props.createdAt;
    }

    isExpired(now: Date = new Date()): boolean {
        return this.expiresAt.getTime() <= now.getTime();
    }
}
