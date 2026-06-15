import type { Request, Response } from 'express';
import { z } from 'zod';
import { HttpError } from '../../../../core/http/HttpError.js';
import { CreateTokenUseCase } from '../../application/CreateTokenUseCase.js';
import { IntrospectUseCase } from '../../application/IntrospectUseCase.js';
import { ListTokensUseCase } from '../../application/ListTokensUseCase.js';
import { RevokeTokenUseCase } from '../../application/RevokeTokenUseCase.js';

const scopeMaskSchema = z.union([z.literal('*'), z.array(z.string())]);

const createSchema = z.object({
    label: z.string().min(1).max(120),
    scopes: z.array(z.string()).default([]),
    scopeMask: scopeMaskSchema.optional(),
    expiresAt: z
        .string()
        .datetime()
        .optional()
        .transform((value) => (value ? new Date(value) : null))
});

const introspectSchema = z.object({
    token: z.string().min(1)
});

export class TokenController {
    constructor(
        private readonly create: CreateTokenUseCase = new CreateTokenUseCase(),
        private readonly list: ListTokensUseCase = new ListTokensUseCase(),
        private readonly revoke: RevokeTokenUseCase = new RevokeTokenUseCase(),
        private readonly introspect: IntrospectUseCase = new IntrospectUseCase()
    ) {}

    createHandler = async (req: Request, res: Response): Promise<void> => {
        const parsed = createSchema.safeParse(req.body);
        if (!parsed.success) {
            throw HttpError.badRequest('invalid token payload', { issues: parsed.error.issues });
        }
        const result = await this.create.execute({
            accountId: req.account!.accountId,
            label: parsed.data.label,
            scopes: parsed.data.scopes,
            scopeMask: parsed.data.scopeMask,
            expiresAt: parsed.data.expiresAt
        });
        res.status(201).json(result);
    };

    listHandler = async (req: Request, res: Response): Promise<void> => {
        const tokens = await this.list.execute(req.account!.accountId);
        res.status(200).json(tokens);
    };

    revokeHandler = async (req: Request, res: Response): Promise<void> => {
        await this.revoke.execute(req.account!.accountId, req.params.id!);
        res.status(204).end();
    };

    introspectHandler = async (req: Request, res: Response): Promise<void> => {
        const parsed = introspectSchema.safeParse(req.body);
        if (!parsed.success) {
            throw HttpError.badRequest('invalid introspect payload', { issues: parsed.error.issues });
        }
        const result = await this.introspect.execute(parsed.data.token);
        if (!result.active) {
            res.status(200).json({ active: false });
            return;
        }
        res.status(200).json({
            active: true,
            accountId: result.accountId,
            username: result.username,
            scopes: result.scopes,
            scopeMask: result.scopeMask,
            expiresAt: result.expiresAt
        });
    };
}
