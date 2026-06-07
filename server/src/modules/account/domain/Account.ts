export interface AccountProps {
    id: string;
    email: string;
    username: string;
    passwordHash: string;
    createdAt: Date;
}

export interface PublicProfile {
    accountId: string;
    email: string;
    username: string;
}

export class Account {
    public readonly id: string;
    public readonly email: string;
    public readonly username: string;
    public readonly passwordHash: string;
    public readonly createdAt: Date;

    constructor(props: AccountProps) {
        this.id = props.id;
        this.email = props.email;
        this.username = props.username;
        this.passwordHash = props.passwordHash;
        this.createdAt = props.createdAt;
    }

    toPublicProfile(): PublicProfile {
        return {
            accountId: this.id,
            email: this.email,
            username: this.username
        };
    }
}
