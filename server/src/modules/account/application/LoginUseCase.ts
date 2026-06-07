import argon2 from 'argon2';
import { HttpError } from '../../../core/http/HttpError.js';
import { Account } from '../domain/Account.js';
import { AccountRepository } from '../infrastructure/db/AccountRepository.js';

export interface LoginInput {
    email: string;
    password: string;
}

export class LoginUseCase {
    constructor(private readonly accounts: AccountRepository = new AccountRepository()) {}

    async execute(input: LoginInput): Promise<Account> {
        const account = await this.accounts.findByEmail(input.email);
        if (!account) {
            throw HttpError.unauthorized('invalid credentials');
        }
        const ok = await argon2.verify(account.passwordHash, input.password);
        if (!ok) {
            throw HttpError.unauthorized('invalid credentials');
        }
        return account;
    }
}
