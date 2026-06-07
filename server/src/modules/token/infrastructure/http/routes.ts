import { Router } from 'express';
import { asyncHandler } from '../../../../core/http/asyncHandler.js';
import { requireJwt } from '../../../../core/http/middleware/requireJwt.js';
import { requireServiceToken } from '../../../../core/http/middleware/requireServiceToken.js';
import { TokenController } from './TokenController.js';

const controller = new TokenController();

export const tokenRouter = Router();

tokenRouter.post('/auth/tokens', asyncHandler(requireJwt), asyncHandler(controller.createHandler));
tokenRouter.get('/auth/tokens', asyncHandler(requireJwt), asyncHandler(controller.listHandler));
tokenRouter.delete('/auth/tokens/:id', asyncHandler(requireJwt), asyncHandler(controller.revokeHandler));
tokenRouter.post('/auth/introspect', requireServiceToken, asyncHandler(controller.introspectHandler));
