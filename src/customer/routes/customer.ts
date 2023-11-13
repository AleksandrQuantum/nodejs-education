import { verify } from '../../auth/controllers/auth';
import { create, getById } from '../controllers/customer';
const customerRouter = require('express').Router();

customerRouter.post("/create", verify, create);
customerRouter.get('/get/:cusId', verify, getById);

export { customerRouter };