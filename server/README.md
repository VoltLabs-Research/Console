# console.voltcloud.dev

VoltCloud identity core. Phase 1: account + session + token + JWKS.

## Stack

- Node.js 20+, TypeScript strict
- Express 4
- Mongoose 8 (MongoDB 7)
- argon2id for password and PAT hashing
- jose (RS256) for JWT signing and JWKS export
- zod for input validation
- pino for structured logging

Layered architecture per module: `domain/` (entities), `application/` (use cases), `infrastructure/` (db + http).

## Generate the RSA keypair

The console signs JWTs with RS256 and publishes the public key over JWKS. Generate a 2048-bit RSA keypair:

```bash
openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:2048 -out jwt-private.pem
openssl pkey -in jwt-private.pem -pubout -out jwt-public.pem
```

Then copy them into `.env`. If you keep the literal newlines, wrap each value in double quotes; otherwise replace `\n` escapes inline:

```bash
JWT_PRIVATE_KEY_PEM="$(awk '{printf "%s\\n", $0}' jwt-private.pem)"
JWT_PUBLIC_KEY_PEM="$(awk '{printf "%s\\n", $0}' jwt-public.pem)"
```

The env loader transparently un-escapes `\n` sequences.

## Local development

```bash
cp .env.example .env
# edit .env, paste your RSA keys

docker compose -f docker-compose.dev.yml up -d
npm install
npm run dev
```

Server listens on `http://localhost:8081`.

## Smoke test via curl

Replace `$ACCESS` with the `accessToken` returned by `/auth/login`.

```bash
# 1. signup
curl -sX POST http://localhost:8081/auth/signup \
  -H 'content-type: application/json' \
  -d '{"email":"dev@voltcloud.dev","password":"password123","displayName":"Dev"}'

# 2. login
curl -sX POST http://localhost:8081/auth/login \
  -H 'content-type: application/json' \
  -d '{"email":"dev@voltcloud.dev","password":"password123"}'

# export ACCESS=<accessToken from above>

# 3. create a PAT
curl -sX POST http://localhost:8081/auth/tokens \
  -H "authorization: Bearer $ACCESS" \
  -H 'content-type: application/json' \
  -d '{"label":"laptop","scopes":["publish:read","publish:write"]}'

# 4. whoami (JWT)
curl -s http://localhost:8081/auth/whoami \
  -H "authorization: Bearer $ACCESS"

# 5. introspect a PAT (service-to-service, called by Registry)
curl -sX POST http://localhost:8081/auth/introspect \
  -H 'authorization: Bearer dev-service-token' \
  -H 'content-type: application/json' \
  -d '{"token":"vpm_pub_REPLACE_WITH_RAW_PAT"}'

# 6. JWKS (called by Registry to verify JWTs offline)
curl -s http://localhost:8081/.well-known/jwks.json
```

## Endpoints

All endpoints live at the root (no `/v1` prefix).

| Method | Path | Auth | Notes |
| --- | --- | --- | --- |
| POST | `/auth/signup` | none | creates an account |
| POST | `/auth/login` | none | returns access + refresh token pair |
| POST | `/auth/refresh` | none (uses refresh token) | rotates refresh token |
| POST | `/auth/logout` | none (uses refresh token) | 204 |
| POST | `/auth/device-code` | none | starts a device authorization |
| POST | `/auth/device-token` | none | polls device authorization (`428` if pending) |
| POST | `/auth/tokens` | Bearer JWT | creates a PAT; raw value returned ONCE |
| GET | `/auth/tokens` | Bearer JWT | lists PATs (no raw values) |
| DELETE | `/auth/tokens/:id` | Bearer JWT | revokes a PAT |
| POST | `/auth/introspect` | Bearer service token | verifies a PAT (used by Registry) |
| GET | `/auth/whoami` | Bearer JWT or PAT | returns `{accountId,email,displayName}` |
| GET | `/.well-known/jwks.json` | none | RS256 public key in JWKS format |

## JWT shape

```
iss: https://console.voltcloud.dev
sub: <accountId>
aud: registry.voltcloud.dev
email, displayName
iat, exp (15 min default)
```

## PAT shape

`vpm_pub_` + 32 url-safe random chars. Stored as argon2id hash plus a sha256-derived lookup prefix for O(1) lookups during introspection. The raw token is returned only on creation.

## Phase scope

Phase 1 is identity only. The Registry, scopes, package publish flow, OAuth, 2FA, and audit logs are deliberately not implemented here.
