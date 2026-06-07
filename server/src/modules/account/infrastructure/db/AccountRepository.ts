import { Account } from '../../domain/Account.js';
import { AccountModel, type AccountDocument } from './AccountModel.js';

const toDomain = (doc: AccountDocument): Account =>
    new Account({
        id: doc._id.toString(),
        email: doc.email,
        username: doc.username,
        passwordHash: doc.passwordHash,
        createdAt: doc.createdAt
    });

export interface CreateAccountInput {
    email: string;
    username: string;
    passwordHash: string;
}

export class AccountRepository {
    async findByEmail(email: string): Promise<Account | null> {
        const doc = await AccountModel.findOne({ email: email.toLowerCase() });
        return doc ? toDomain(doc) : null;
    }

    async findByUsername(username: string): Promise<Account | null> {
        const doc = await AccountModel.findOne({ username: username.toLowerCase() });
        return doc ? toDomain(doc) : null;
    }

    async findById(id: string): Promise<Account | null> {
        const doc = await AccountModel.findById(id);
        return doc ? toDomain(doc) : null;
    }

    async create(input: CreateAccountInput): Promise<Account> {
        const doc = await AccountModel.create({
            email: input.email.toLowerCase(),
            username: input.username.toLowerCase(),
            passwordHash: input.passwordHash
        });
        return toDomain(doc);
    }
}
