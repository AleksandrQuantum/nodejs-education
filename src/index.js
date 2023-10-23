const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
// IMPORT ROUTES
const authRoute = require("./auth/routers/auth");
const userRoute = require("./user/routes/user");
const supplierRoute = require("./supplier/routes/supplier");
const customerRoute = require("./customer/routes/customer");
const invoiceRoute = require("./invoice/routes/invoice");
// ACCESSING TO ENVIRONMENT VARIABLES
dotenv.config();
const PORT = process.env.PORT || 3000;
// CONNECTION TO DATABASE
mongoose.connect(
    process.env.DB_CONNECT,
    { useNewUrlParser: true, useUnifiedTopology: true },
);
// MIDDLEWARE
app.use(express.json(), cors());
app.use("/", authRoute);
app.use("/users", userRoute);
app.use("/suppliers", supplierRoute);
app.use("/customers", customerRoute);
app.use("/invoices", invoiceRoute);

app.listen(PORT, () => {
    console.log('App listening on port:', PORT);
});