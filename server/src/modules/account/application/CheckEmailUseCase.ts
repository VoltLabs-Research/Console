import { AccountRepository } from '../infrastructure/db/AccountRepository.js';

export interface CheckEmailInput {
    email: string;
}

export interface CheckEmailOutput {
    exists: boolean;
}

export class CheckEmailUseCase {
    constructor(private readonly accounts: AccountRepository = new AccountRepository()) {}

    async execute(input: CheckEmailInput): Promise<CheckEmailOutput> {
        const account = await this.accounts.findByEmail(input.email.toLowerCase());
        return { exists: account !== null };
    }
}
