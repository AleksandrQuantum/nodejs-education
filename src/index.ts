import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";

const app = express();

// IMPORT ROUTES
import { authRouter } from "./auth/routers/auth";
import { userRouter } from "./user/routes/user";
import { supplierRouter } from "./supplier/routes/supplier";
import { customerRouter } from "./customer/routes/customer";
import { invoiceRouter } from "./invoice/routes/invoice";

// ACCESSING TO ENVIRONMENT VARIABLES
dotenv.config();
const PORT: string = process.env.PORT || "3000";

// CONNECTION TO DATABASE
let usernamePassword: string = ''
if (process.env.DB_USERNAME || process.env.DB_PASSWORD) {
    usernamePassword = `${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@`
}
const options: { [name: string]: boolean } = {
    useNewUrlParser: true,
    useUnifiedTopology: true 
}
if (process.env.DB_TLS_ENABLED === 'true') {
    options['tls'] = true,
    options['tlsCAFile'] = Boolean(process.env.DB_TLS_CA)
};
const url: string = `mongodb://${usernamePassword}${process.env.DB_HOST}:${process.env.DB_PORT}`;
mongoose.connect(url, options);

// MIDDLEWARE
app.use(express.json(), cors());
app.use("/", authRouter);
app.use("/users", userRouter);
app.use("/suppliers", supplierRouter);
app.use("/customers", customerRouter);
app.use("/invoices", invoiceRouter);

app.listen(PORT, () => {
    console.log('App listening on port:', PORT);
});

export { app };