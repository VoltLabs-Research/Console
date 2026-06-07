import { Router } from 'express';
import { asyncHandler } from '../../../../core/http/asyncHandler.js';
import { requireJwt } from '../../../../core/http/middleware/requireJwt.js';
import { JwksController } from './JwksController.js';
import { SessionController } from './SessionController.js';

const sessionController = new SessionController();
const jwksController = new JwksController();

export const sessionRouter = Router();

sessionRouter.post('/auth/login', asyncHandler(sessionController.loginHandler));
sessionRouter.post('/auth/refresh', asyncHandler(sessionController.refreshHandler));
sessionRouter.post('/auth/logout', asyncHandler(sessionController.logoutHandler));
sessionRouter.post('/auth/device-code', asyncHandler(sessionController.deviceCodeHandler));
sessionRouter.post('/auth/device-token', asyncHandler(sessionController.deviceTokenHandler));
sessionRouter.post('/auth/device/approve', asyncHandler(requireJwt), asyncHandler(sessionController.approveDeviceHandler));
sessionRouter.post('/auth/device/deny', asyncHandler(requireJwt), asyncHandler(sessionController.denyDeviceHandler));

export const jwksRouter = Router();
jwksRouter.get('/.well-known/jwks.json', jwksController.jwksHandler);
