import { Router } from 'express';
import { asyncHandler } from '../../../../core/http/asyncHandler.js';
import { requireJwtOrPat } from '../../../../core/http/middleware/jwtOrPat.js';
import { AccountController } from './AccountController.js';

const controller = new AccountController();

export const accountRouter = Router();

accountRouter.post('/auth/signup', asyncHandler(controller.signupHandler));
accountRouter.post('/auth/check-email', asyncHandler(controller.checkEmailHandler));
accountRouter.get('/auth/whoami', asyncHandler(requireJwtOrPat), asyncHandler(controller.whoamiHandler));
