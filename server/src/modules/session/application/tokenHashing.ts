import { createHash, randomBytes } from 'node:crypto';
import argon2 from 'argon2';

const REFRESH_TOKEN_BYTES = 32;

export const REFRESH_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export const generateRefreshToken = (): string => {
    return randomBytes(REFRESH_TOKEN_BYTES).toString('base64url');
};

export const lookupForToken = (token: string): string => {
    return createHash('sha256').update(token).digest('hex').slice(0, 32);
};

export const hashRefreshToken = (token: string): Promise<string> => {
    return argon2.hash(token, { type: argon2.argon2id });
};

export const verifyRefreshToken = (hash: string, token: string): Promise<boolean> => {
    return argon2.verify(hash, token);
};
