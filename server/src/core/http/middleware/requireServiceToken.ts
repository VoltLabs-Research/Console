import { timingSafeEqual } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';
import { env } from '../../config/env.js';
import { HttpError } from '../HttpError.js';

const extractBearer = (header: string | undefined): string | null => {
    if (!header) {
        return null;
    }
    const match = /^Bearer\s+(.+)$/i.exec(header.trim());
    return match && match[1] ? match[1].trim() : null;
};

const constantTimeEquals = (a: string, b: string): boolean => {
    const aBuf = Buffer.from(a, 'utf8');
    const bBuf = Buffer.from(b, 'utf8');
    if (aBuf.length !== bBuf.length) {
        return false;
    }
    return timingSafeEqual(aBuf, bBuf);
};

export const requireServiceToken = (req: Request, _res: Response, next: NextFunction): void => {
    const token = extractBearer(req.headers.authorization);
    if (!token) {
        next(HttpError.unauthorized('missing service token'));
        return;
    }
    if (!constantTimeEquals(token, env.REGISTRY_SERVICE_TOKEN)) {
        next(HttpError.unauthorized('invalid service token'));
        return;
    }
    next();
};
