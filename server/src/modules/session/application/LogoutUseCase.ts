import { SessionRepository } from '../infrastructure/db/SessionRepository.js';
import { lookupForToken } from './tokenHashing.js';

export class LogoutUseCase {
    constructor(private readonly sessions: SessionRepository = new SessionRepository()) {}

    async execute(refreshToken: string): Promise<void> {
        await this.sessions.deleteByLookup(lookupForToken(refreshToken));
    }
}
