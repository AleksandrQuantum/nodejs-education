import { verify } from '../../auth/controllers/auth';
import { create, getById } from '../controllers/supplier';
const supplierRouter = require('express').Router();

supplierRouter.post("/create", verify, create);
supplierRouter.get('/get/:supId', verify, getById);

export { supplierRouter };