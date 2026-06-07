import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { type Express, type NextFunction, type Request, type Response } from 'express';
import helmet from 'helmet';
import { pinoHttp } from 'pino-http';
import { env } from './env.js';
import { logger } from './logger.js';
import { accountRouter } from '../../modules/account/infrastructure/http/routes.js';
import { sessionRouter, jwksRouter } from '../../modules/session/infrastructure/http/routes.js';
import { tokenRouter } from '../../modules/token/infrastructure/http/routes.js';
import { HttpError } from '../http/HttpError.js';

export const createApp = (): Express => {
    const app = express();

    app.disable('x-powered-by');
    app.set('trust proxy', 1);

    app.use(helmet());
    app.use(
        cors({
            origin: (origin, callback) => {
                if (!origin) {
                    callback(null, true);
                    return;
                }
                if (env.CORS_ORIGINS.includes(origin)) {
                    callback(null, true);
                    return;
                }
                callback(new Error(`CORS rejected origin: ${origin}`));
            },
            credentials: true
        })
    );
    app.use(pinoHttp({ logger }));
    app.use(cookieParser());
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    app.get('/healthz', (_req: Request, res: Response) => {
        res.status(200).json({ status: 'ok' });
    });

    app.use(accountRouter);
    app.use(sessionRouter);
    app.use(tokenRouter);
    app.use(jwksRouter);

    app.use((req: Request, res: Response) => {
        res.status(404).json({ error: 'not_found', path: req.path });
    });

    app.use((err: unknown, req: Request, res: Response, _next: NextFunction) => {
        if (err instanceof HttpError) {
            res.status(err.status).json(err.toBody());
            return;
        }
        req.log?.error({ err }, 'unhandled error');
        res.status(500).json({ error: 'internal_error' });
    });

    return app;
};
