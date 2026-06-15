import type { Request, Response } from 'express';
import { z } from 'zod';
import { HttpError } from '../../../../core/http/HttpError.js';
import { CheckEmailUseCase } from '../../application/CheckEmailUseCase.js';
import { SignupUseCase } from '../../application/SignupUseCase.js';
import { WhoamiUseCase } from '../../application/WhoamiUseCase.js';

const signupSchema = z.object({
    email: z.string().email(),
    username: z
        .string()
        .min(2)
        .max(39)
        .regex(/^[a-z0-9][a-z0-9-]*$/, 'username must be lowercase letters, digits and dashes'),
    password: z.string().min(8).max(256)
});

const checkEmailSchema = z.object({
    email: z.string().email()
});

export class AccountController {
    constructor(
        private readonly signup: SignupUseCase = new SignupUseCase(),
        private readonly whoami: WhoamiUseCase = new WhoamiUseCase(),
        private readonly checkEmail: CheckEmailUseCase = new CheckEmailUseCase()
    ) {}

    signupHandler = async (req: Request, res: Response): Promise<void> => {
        const parsed = signupSchema.safeParse(req.body);
        if (!parsed.success) {
            throw HttpError.badRequest('invalid signup payload', { issues: parsed.error.issues });
        }
        const result = await this.signup.execute(parsed.data);
        res.status(201).json(result);
    };

    whoamiHandler = async (req: Request, res: Response): Promise<void> => {
        const profile = await this.whoami.execute(req.account!.accountId);
        res.status(200).json(profile);
    };

    checkEmailHandler = async (req: Request, res: Response): Promise<void> => {
        const parsed = checkEmailSchema.safeParse(req.body);
        if (!parsed.success) {
            throw HttpError.badRequest('invalid check-email payload', { issues: parsed.error.issues });
        }
        const result = await this.checkEmail.execute(parsed.data);
        res.status(200).json(result);
    };
}
