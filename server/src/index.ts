import { env } from './core/config/env.js';
import { connectMongo } from './core/config/db.js';
import { initCrypto } from './core/config/crypto.js';
import { createApp } from './core/config/express.js';
import { logger } from './core/config/logger.js';

const bootstrap = async (): Promise<void> => {
    await initCrypto();
    await connectMongo();
    const app = createApp();

    app.listen(env.PORT, () => {
        logger.info({ port: env.PORT }, 'console.voltcloud listening');
    });
};

bootstrap().catch((error: unknown) => {
    logger.error({ err: error }, 'fatal bootstrap failure');
    process.exit(1);
});
