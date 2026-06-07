import argon2 from 'argon2';
import { HttpError } from '../../../core/http/HttpError.js';
import { AccountRepository } from '../infrastructure/db/AccountRepository.js';

export interface SignupInput {
    email: string;
    username: string;
    password: string;
}

export interface SignupOutput {
    accountId: string;
    username: string;
}

export class SignupUseCase {
    constructor(private readonly accounts: AccountRepository = new AccountRepository()) {}

    async execute(input: SignupInput): Promise<SignupOutput> {
        const email = input.email.toLowerCase();
        const username = input.username.toLowerCase();

        if (await this.accounts.findByEmail(email)) {
            throw HttpError.conflict('email already registered');
        }
        if (await this.accounts.findByUsername(username)) {
            throw HttpError.conflict('username already taken');
        }

        const passwordHash = await argon2.hash(input.password, { type: argon2.argon2id });
        const account = await this.accounts.create({
            email,
            username,
            passwordHash
        });
        return { accountId: account.id, username: account.username };
    }
}
