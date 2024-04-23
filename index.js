const mongoose = require('mongoose');
mongoose.connect("mongodb://127.0.0.1:27017/phonezee_Ecommerce");
const nocache = require('nocache');
const path = require('path');

const dotenv = require('dotenv');
dotenv.config();

const express = require("express");
const app = express();

app.use(nocache());
app.use(express.static(path.join(__dirname, "public")));

app.set("view engine","ejs");

// for user routes
const userRoute = require('./routes/userRoutes');
app.use('/', userRoute);

// for admin routes
const adminRoute = require('./routes/adminRoutes')
app.use('/admin', adminRoute);

app.listen(process.env.PORT, () => {
    console.log(`Server is Running On : http://localhost:${process.env.PORT}`);
});