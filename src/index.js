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
var uri = `mongodb://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}`;
var options = {
    useNewUrlParser: true,
    useUnifiedTopology: true 
}
if (process.env.DB_TLS_ENABLED === 'true') {
    options['tls'] = true,
    options['tlsCAFile'] = process.env.DB_TLS_CA
};
mongoose.connect(
    uri,
    options,
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