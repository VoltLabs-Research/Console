export type ScopeMask = string[] | '*';

export interface TokenProps {
    id: string;
    accountId: string;
    hashedToken: string;
    lookup: string;
    label: string;
    scopes: string[];
    scopeMask: ScopeMask;
    expiresAt: Date | null;
    lastUsedAt: Date | null;
    createdAt: Date;
}

export class Token {
    public readonly id: string;
    public readonly accountId: string;
    public readonly hashedToken: string;
    public readonly lookup: string;
    public readonly label: string;
    public readonly scopes: string[];
    public readonly scopeMask: ScopeMask;
    public readonly expiresAt: Date | null;
    public readonly lastUsedAt: Date | null;
    public readonly createdAt: Date;

    constructor(props: TokenProps) {
        this.id = props.id;
        this.accountId = props.accountId;
        this.hashedToken = props.hashedToken;
        this.lookup = props.lookup;
        this.label = props.label;
        this.scopes = props.scopes;
        this.scopeMask = props.scopeMask;
        this.expiresAt = props.expiresAt;
        this.lastUsedAt = props.lastUsedAt;
        this.createdAt = props.createdAt;
    }

    isExpired(now: Date = new Date()): boolean {
        if (!this.expiresAt) {
            return false;
        }
        return this.expiresAt.getTime() <= now.getTime();
    }

    toListing(): {
        id: string;
        label: string;
        scopes: string[];
        scopeMask: ScopeMask;
        lastUsedAt: Date | null;
        expiresAt: Date | null;
        createdAt: Date;
    } {
        return {
            id: this.id,
            label: this.label,
            scopes: this.scopes,
            scopeMask: this.scopeMask,
            lastUsedAt: this.lastUsedAt,
            expiresAt: this.expiresAt,
            createdAt: this.createdAt
        };
    }
}
