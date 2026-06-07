import { randomBytes } from 'node:crypto';
import { customAlphabet } from 'nanoid';
import { env } from '../../../core/config/env.js';
import { DeviceAuthorizationRepository } from '../infrastructure/db/DeviceAuthorizationRepository.js';

const DEVICE_CODE_BYTES = 32;
const USER_CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const DEVICE_AUTHORIZATION_TTL_SECONDS = 600;
const POLL_INTERVAL_SECONDS = 5;
const VERIFICATION_URI = `${env.CONSOLE_WEB_URL}/device`;

const generateUserCode = customAlphabet(USER_CODE_ALPHABET, 8);

export interface DeviceCodeStartOutput {
    deviceCode: string;
    userCode: string;
    verificationUri: string;
    interval: number;
    expiresIn: number;
}

export class DeviceCodeStartUseCase {
    constructor(
        private readonly devices: DeviceAuthorizationRepository = new DeviceAuthorizationRepository()
    ) {}

    async execute(): Promise<DeviceCodeStartOutput> {
        const deviceCode = randomBytes(DEVICE_CODE_BYTES).toString('base64url');
        const userCode = generateUserCode();
        const expiresAt = new Date(Date.now() + DEVICE_AUTHORIZATION_TTL_SECONDS * 1000);

        await this.devices.create({ deviceCode, userCode, expiresAt });

        return {
            deviceCode,
            userCode,
            verificationUri: VERIFICATION_URI,
            interval: POLL_INTERVAL_SECONDS,
            expiresIn: DEVICE_AUTHORIZATION_TTL_SECONDS
        };
    }
}
