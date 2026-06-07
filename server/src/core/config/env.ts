import 'dotenv/config';
import { z } from 'zod';

const pemTransform = (value: string): string => value.replace(/\\n/g, '\n');

const envSchema = z.object({
    MONGO_URL: z.string().url(),
    JWT_PRIVATE_KEY_PEM: z.string().min(1).transform(pemTransform),
    JWT_PUBLIC_KEY_PEM: z.string().min(1).transform(pemTransform),
    JWT_KID: z.string().min(1),
    REGISTRY_SERVICE_TOKEN: z.string().min(1),
    // Public base URL of the console web UI, embedded into the device-code
    // verification URI shown to the CLI. Override per environment.
    CONSOLE_WEB_URL: z.string().url().default('https://console.voltcloud.dev'),
    CORS_ORIGINS: z
        .string()
        .default('')
        .transform((value) =>
            value
                .split(',')
                .map((entry) => entry.trim())
                .filter((entry) => entry.length > 0)
        ),
    PORT: z
        .string()
        .default('8081')
        .transform((value) => Number.parseInt(value, 10))
        .pipe(z.number().int().positive())
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
    const issues = parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('\n  ');
    throw new Error(`Invalid environment configuration:\n  ${issues}`);
}

export const env = parsed.data;
export type Env = typeof env;
