const mongoose = require('mongoose');
const nocache = require('nocache');
const path = require('path');

const dotenv = require('dotenv');
dotenv.config();

const express = require("express");
const app = express();

mongoose.connect(process.env.MONGO_URL).then(() => {
    console.log("Mongo Connected...");
});

app.use(nocache());
app.use(express.static(path.join(__dirname, "public")));

app.set("view engine","ejs");

// for user routes
const userRoute = require('./routes/userRoutes');
app.use('/', userRoute);

// for admin routes
const adminRoute = require('./routes/adminRoutes')
app.use('/admin', adminRoute);

// Error page for unknown urls
app.get('*', (req, res) => {
    res.redirect('/404');
}); 

app.listen(process.env.PORT, () => {
    console.log(`Server is Running On : http://localhost:${process.env.PORT}`);
    console.log(`Admin is On : http://localhost:${process.env.PORT}/admin`)
});