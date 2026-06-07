import type { Request, Response } from 'express';
import { getJwks } from '../../../../core/config/crypto.js';

export class JwksController {
    jwksHandler = (_req: Request, res: Response): void => {
        res.setHeader('Cache-Control', 'public, max-age=300');
        res.status(200).json(getJwks());
    };
}
