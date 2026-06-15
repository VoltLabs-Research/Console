import type { NextFunction, Request, Response } from 'express';
import { jwtVerify } from 'jose';
import { JWT_ALG, JWT_AUDIENCE, JWT_ISSUER, getPublicKey } from '../../config/crypto.js';
import { HttpError } from '../HttpError.js';
import { IntrospectUseCase } from '../../../modules/token/application/IntrospectUseCase.js';
import { extractBearer } from '../extractBearer.js';

const introspect = new IntrospectUseCase();

export const requireJwtOrPat = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
        const token = extractBearer(req.headers.authorization);
        if (!token) {
            throw HttpError.unauthorized('missing bearer token');
        }

        if (token.startsWith('vpm_pub_')) {
            const result = await introspect.execute(token);
            if (!result.active || !result.accountId) {
                throw HttpError.unauthorized('invalid or expired token');
            }
            req.account = {
                accountId: result.accountId,
                email: result.email ?? '',
                username: result.username ?? ''
            };
            next();
            return;
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
