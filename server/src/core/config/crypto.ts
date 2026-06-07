import { createPrivateKey, createPublicKey, type KeyObject } from 'node:crypto';
import { SignJWT, exportJWK, type JWK } from 'jose';
import { env } from './env.js';

export const JWT_ISSUER = 'https://console.voltcloud.dev';
export const JWT_AUDIENCE = 'registry.voltcloud.dev';
export const JWT_ALG = 'RS256';
export const ACCESS_TOKEN_TTL_SECONDS = 15 * 60;

interface JwtCryptoState {
    privateKey: KeyObject;
    publicKey: KeyObject;
    kid: string;
    jwks: { keys: JWK[] };
}

let state: JwtCryptoState | null = null;

export const initCrypto = async (): Promise<void> => {
    const privateKey = createPrivateKey({ key: env.JWT_PRIVATE_KEY_PEM, format: 'pem' });
    const publicKey = createPublicKey({ key: env.JWT_PUBLIC_KEY_PEM, format: 'pem' });

    const publicJwk = await exportJWK(publicKey);
    publicJwk.kid = env.JWT_KID;
    publicJwk.alg = JWT_ALG;
    publicJwk.use = 'sig';

    state = {
        privateKey,
        publicKey,
        kid: env.JWT_KID,
        jwks: { keys: [publicJwk] }
    };
};

const requireState = (): JwtCryptoState => {
    if (!state) {
        throw new Error('crypto subsystem not initialized — call initCrypto() first');
    }
    return state;
};

export interface AccessTokenClaims {
    accountId: string;
    email: string;
    username: string;
}

export interface VerifiedAccessToken {
    accountId: string;
    email: string;
    username: string;
    expiresAt: Date;
}

export const signAccessToken = async (claims: AccessTokenClaims): Promise<string> => {
    const { privateKey, kid } = requireState();

    return new SignJWT({
        email: claims.email,
        username: claims.username
    })
        .setProtectedHeader({ alg: JWT_ALG, kid, typ: 'JWT' })
        .setIssuer(JWT_ISSUER)
        .setAudience(JWT_AUDIENCE)
        .setSubject(claims.accountId)
        .setIssuedAt()
        .setExpirationTime(`${ACCESS_TOKEN_TTL_SECONDS}s`)
        .sign(privateKey);
};

export const getJwks = (): { keys: JWK[] } => requireState().jwks;

export const getPublicKey = (): KeyObject => requireState().publicKey;
