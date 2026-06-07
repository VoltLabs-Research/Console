import { createHash } from 'node:crypto';
import argon2 from 'argon2';
import { customAlphabet } from 'nanoid';

const TOKEN_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
const TOKEN_SUFFIX_LENGTH = 32;
const TOKEN_PREFIX = 'vpm_pub_';

const generateSuffix = customAlphabet(TOKEN_ALPHABET, TOKEN_SUFFIX_LENGTH);

export const generatePatToken = (): string => `${TOKEN_PREFIX}${generateSuffix()}`;

export const isPatTokenFormat = (raw: string): boolean => raw.startsWith(TOKEN_PREFIX);

export const lookupForPat = (raw: string): string => {
    return createHash('sha256').update(raw).digest('hex').slice(0, 16);
};

export const hashPat = (raw: string): Promise<string> => argon2.hash(raw, { type: argon2.argon2id });

export const verifyPat = (hash: string, raw: string): Promise<boolean> => argon2.verify(hash, raw);
