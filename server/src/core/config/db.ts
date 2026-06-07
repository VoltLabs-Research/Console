import mongoose from 'mongoose';
import { env } from './env.js';
import { logger } from './logger.js';

export const connectMongo = async (): Promise<void> => {
    mongoose.set('strictQuery', true);
    await mongoose.connect(env.MONGO_URL);
    logger.info({ url: env.MONGO_URL }, 'mongo connected');
};

export const disconnectMongo = async (): Promise<void> => {
    await mongoose.disconnect();
};
