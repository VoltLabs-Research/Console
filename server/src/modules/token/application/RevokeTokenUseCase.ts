import { HttpError } from '../../../core/http/HttpError.js';
import { TokenRepository } from '../infrastructure/db/TokenRepository.js';

export class RevokeTokenUseCase {
    constructor(private readonly tokens: TokenRepository = new TokenRepository()) {}

    async execute(accountId: string, id: string): Promise<void> {
        const deleted = await this.tokens.deleteByIdAndAccount(id, accountId);
        if (!deleted) {
            throw HttpError.notFound('token not found');
        }
    }
}
