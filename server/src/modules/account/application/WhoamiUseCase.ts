import { HttpError } from '../../../core/http/HttpError.js';
import type { PublicProfile } from '../domain/Account.js';
import { AccountRepository } from '../infrastructure/db/AccountRepository.js';

export type WhoamiOutput = PublicProfile;

export class WhoamiUseCase {
    constructor(private readonly accounts: AccountRepository = new AccountRepository()) {}

    async execute(accountId: string): Promise<WhoamiOutput> {
        const account = await this.accounts.findById(accountId);
        if (!account) {
            throw HttpError.notFound('account not found');
        }
        return account.toPublicProfile();
    }
}
