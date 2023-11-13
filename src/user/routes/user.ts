import { verify } from '../../auth/controllers/auth';
import { getById, create } from '../controllers/user';
const userRouter = require('express').Router();

userRouter.post("/create", create);
userRouter.get('/get/:userId', verify, getById);

export { userRouter };