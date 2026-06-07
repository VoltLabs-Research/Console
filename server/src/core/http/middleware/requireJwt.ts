import type { NextFunction, Request, Response } from 'express';
import { jwtVerify } from 'jose';
import { JWT_ALG, JWT_AUDIENCE, JWT_ISSUER, getPublicKey } from '../../config/crypto.js';
import { HttpError } from '../HttpError.js';

export interface AuthenticatedAccount {
    accountId: string;
    email: string;
    username: string;
}

declare module 'express-serve-static-core' {
    interface Request {
        account?: AuthenticatedAccount;
    }
}

const extractBearer = (header: string | undefined): string | null => {
    if (!header) {
        return null;
    }
    const match = /^Bearer\s+(.+)$/i.exec(header.trim());
    return match && match[1] ? match[1].trim() : null;
};

export const requireJwt = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
        const token = extractBearer(req.headers.authorization);
        if (!token) {
            throw HttpError.unauthorized('missing bearer token');
        }

        const { payload } = await jwtVerify(token, getPublicKey(), {
            issuer: JWT_ISSUER,
            audience: JWT_AUDIENCE,
            algorithms: [JWT_ALG]
        });

        if (!payload.sub || typeof payload.sub !== 'string') {
            throw HttpError.unauthorized('invalid token subject');
        }
        const { email, username } = payload as { email: string; username: string };

        req.account = {
            accountId: payload.sub,
            email,
            username
        };

        next();
    } catch (error) {
        if (error instanceof HttpError) {
            next(error);
            return;
        }
        next(HttpError.unauthorized('invalid or expired token'));
    }
};
