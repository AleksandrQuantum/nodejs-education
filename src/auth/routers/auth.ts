const authRouter = require('express').Router();
import { login } from '../controllers/auth';

// LOGIN USER
authRouter.get("/login", login);

export { authRouter };