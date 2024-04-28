const express = require('express');
const user_route = express();

const session = require('express-session');

const passport = require('passport');
require('../passport');

user_route.use(session({
    secret: 'seceretKey',
}));

user_route.use(passport.initialize());
user_route.use(passport.session());

user_route.set('view engine', 'ejs');
user_route.set('views', './views/userPages');

const bodyParser = require('body-parser');

user_route.use(bodyParser.json());
user_route.use(bodyParser.urlencoded({extended: true}));

// Requering the User Routes
const userController = require('../controllers/userControllers');

// Requerung the User Auth
const userAuth = require('../middlewares/userAuth');

// Requerung the User Block Check
const userBlocked = require('../middlewares/userBlocked');

// //requering the Helpers
// const { otpMailValidator } = require('../helpers/validation');

// Starting The User Routes
// Get Requests
user_route.get('/', userBlocked.isBlocked, userController.loadHome);
user_route.get('/login', userAuth.isLogout, userController.loadLoginPage);
user_route.get('/register', userAuth.isLogout, userController.loadSignUpPage);
user_route.get('/otp', userAuth.isLogout, userController.loadOtpPage);
user_route.get('/profile', userAuth.isLogin, userBlocked.isBlocked, userController.loadProfile);
user_route.get('/product', userController.loadProduct);
user_route.get('/category', userController.loadCategory);
user_route.get('/cart', userAuth.isLogin, userBlocked.isBlocked, userController.loadCart);
user_route.get('/Wishlist', userAuth.isLogin, userBlocked.isBlocked, userController.loadWishlist);
user_route.get('/faq', userController.loadFaq);
user_route.get('/about', userController.loadAbout);
user_route.get('/checkout', userAuth.isLogin, userBlocked.isBlocked, userController.loadCheckout);
user_route.get('/contact', userController.loadContact);
user_route.get('/404', userController.loadErrorPage);
user_route.get('/logout', userController.userLogout);
user_route.get('/addAddress', userAuth.isLogin, userBlocked.isBlocked, userController.loadAddAddress);
user_route.get('/test', userController.loadTestPage);

user_route.get('/resendOTP', userController.resendOtp);

/*********      Google Auth Routes      **********/ 

// Google Auth Route
user_route.get('/auth/google' , passport.authenticate('google', { scope: ['email', 'profile'] }));

// Goole Auth callback
user_route.get('/auth/google/callback',
    passport.authenticate('google', {
        successRedirect: '/googleSuccess',
        failureRedirect: '/googleFailure'
    })
);

// Success and Failure Routes
user_route.get('/googleSuccess', userController.successGoogleLogin);
user_route.get('/googleFailure', userController.FailureGoogleLogin);


/*********      Facebook Auth Routes      **********/ 

// Google Auth Route
user_route.get('/auth/facebook' , passport.authenticate('facebook', { scope: ['public_profile', 'email'] }));

// Goole Auth callback
user_route.get('/auth/facebook/callback',
    passport.authenticate('facebook', {
        successRedirect: '/facebookSuccess',
        failureRedirect: '/facebookFailure'
    })
);

// Success and Failure Routes
user_route.get('/facebookSuccess', userController.successFacebookLogin);
user_route.get('/facebookFailure', userController.failureFacebookLogin);


/*********      Post Requests      **********/ 
user_route.post('/register', userController.insertUser);
user_route.post('/login', userController.userLogin);
user_route.post('/otp', userController.validateOTP);
user_route.post('/addAddress', userController.insertAddress);


module.exports = user_route;