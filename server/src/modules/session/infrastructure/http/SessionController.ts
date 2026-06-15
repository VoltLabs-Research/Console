import type { Request, Response } from 'express';
import { z } from 'zod';
import { HttpError } from '../../../../core/http/HttpError.js';
import { LoginUseCase } from '../../../account/application/LoginUseCase.js';
import { ApproveDeviceUseCase } from '../../application/ApproveDeviceUseCase.js';
import { DeviceCodePollUseCase } from '../../application/DeviceCodePollUseCase.js';
import { DeviceCodeStartUseCase } from '../../application/DeviceCodeStartUseCase.js';
import { LoginIssueUseCase } from '../../application/LoginIssueUseCase.js';
import { LogoutUseCase } from '../../application/LogoutUseCase.js';
import { RefreshUseCase } from '../../application/RefreshUseCase.js';

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1).max(256)
});

const refreshSchema = z.object({
    refreshToken: z.string().min(1)
});

const deviceTokenSchema = z.object({
    deviceCode: z.string().min(1)
});

const deviceDecisionSchema = z.object({
    userCode: z.string().min(1).max(16)
});

const readContext = (req: Request): { userAgent: string; ip: string } => ({
    userAgent: typeof req.headers['user-agent'] === 'string' ? req.headers['user-agent'] : '',
    ip: req.ip ?? ''
});

export class SessionController {
    constructor(
        private readonly login: LoginUseCase = new LoginUseCase(),
        private readonly loginIssue: LoginIssueUseCase = new LoginIssueUseCase(),
        private readonly refresh: RefreshUseCase = new RefreshUseCase(),
        private readonly logout: LogoutUseCase = new LogoutUseCase(),
        private readonly deviceCodeStart: DeviceCodeStartUseCase = new DeviceCodeStartUseCase(),
        private readonly deviceCodePoll: DeviceCodePollUseCase = new DeviceCodePollUseCase(),
        private readonly approveDevice: ApproveDeviceUseCase = new ApproveDeviceUseCase()
    ) {}

    loginHandler = async (req: Request, res: Response): Promise<void> => {
        const parsed = loginSchema.safeParse(req.body);
        if (!parsed.success) {
            throw HttpError.badRequest('invalid login payload', { issues: parsed.error.issues });
        }
        const account = await this.login.execute(parsed.data);
        const tokens = await this.loginIssue.execute(account, readContext(req));
        res.status(200).json(tokens);
    };

    refreshHandler = async (req: Request, res: Response): Promise<void> => {
        const parsed = refreshSchema.safeParse(req.body);
        if (!parsed.success) {
            throw HttpError.badRequest('invalid refresh payload', { issues: parsed.error.issues });
        }
        const result = await this.refresh.execute(parsed.data.refreshToken, readContext(req));
        res.status(200).json(result);
    };

    logoutHandler = async (req: Request, res: Response): Promise<void> => {
        const parsed = refreshSchema.safeParse(req.body);
        if (!parsed.success) {
            throw HttpError.badRequest('invalid logout payload', { issues: parsed.error.issues });
        }
        await this.logout.execute(parsed.data.refreshToken);
        res.status(204).end();
    };

    deviceCodeHandler = async (_req: Request, res: Response): Promise<void> => {
        const result = await this.deviceCodeStart.execute();
        res.status(200).json(result);
    };

    deviceTokenHandler = async (req: Request, res: Response): Promise<void> => {
        const parsed = deviceTokenSchema.safeParse(req.body);
        if (!parsed.success) {
            throw HttpError.badRequest('invalid device-token payload', { issues: parsed.error.issues });
        }
        try {
            const tokens = await this.deviceCodePoll.execute(parsed.data.deviceCode, readContext(req));
            res.status(200).json(tokens);
        } catch (error) {
            if (error instanceof HttpError && error.status === 428) {
                res.status(428).json(error.toBody());
                return;
            }
            throw error;
        }
    };

    approveDeviceHandler = async (req: Request, res: Response): Promise<void> => {
        const parsed = deviceDecisionSchema.safeParse(req.body);
        if (!parsed.success) {
            throw HttpError.badRequest('invalid device approval payload', { issues: parsed.error.issues });
        }
        await this.approveDevice.execute(parsed.data.userCode, req.account!.accountId, 'approve');
        res.status(200).json({ approved: true });
    };

    denyDeviceHandler = async (req: Request, res: Response): Promise<void> => {
        const parsed = deviceDecisionSchema.safeParse(req.body);
        if (!parsed.success) {
            throw HttpError.badRequest('invalid device decision payload', { issues: parsed.error.issues });
        }
        await this.approveDevice.execute(parsed.data.userCode, req.account!.accountId, 'deny');
        res.status(200).json({ approved: false });
    };
}
