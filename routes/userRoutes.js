const express = require('express');
const user_route = express();
const flash = require('connect-flash');

const session = require('express-session');

const passport = require('passport');
require('../passport');

// Configure session
user_route.use(session({
    secret: 'seceretKey',
}));

// Flash middleware
user_route.use(flash());

// Make flash messages available in all templates
user_route.use((req, res, next) => {
    res.locals.successMessage = req.flash('successMessage');
    res.locals.errorMessage = req.flash('errorMessage');
    next();
});

// configure password vaidation
user_route.use(passport.initialize());
user_route.use(passport.session());

user_route.set('view engine', 'ejs');
user_route.set('views', './views/userPages');

const bodyParser = require('body-parser');

user_route.use(bodyParser.json());
user_route.use(bodyParser.urlencoded({extended: true}));

// Requering the Controllers
const userController = require('../controllers/userControllers');
const addressContoller = require('../controllers/addressController');
const cartController = require('../controllers/cartController');
const orderController = require('../controllers/orderController');
const otpController = require('../controllers/otpController');
const productController = require('../controllers/productController');
const wishlistController = require('../controllers/wishlistController');
const ratingController = require('../controllers/ratingController');
const filterController = require('../controllers/filterController');
const couponController = require('../controllers/couponController');

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
user_route.get('/otp', userAuth.isLogout, otpController.loadOtpPage);
user_route.get('/profile', userAuth.isLogin, userBlocked.isBlocked, userController.loadProfile);
user_route.get('/product', productController.loadProduct);
user_route.get('/shop', userController.loadCategory);
user_route.get('/cart', userAuth.isLogin, userBlocked.isBlocked, cartController.loadCart);
user_route.get('/Wishlist', userAuth.isLogin, userBlocked.isBlocked, wishlistController.loadWishlist);
user_route.get('/faq', userController.loadFaq);
user_route.get('/about', userController.loadAbout);
user_route.get('/checkout', userAuth.isLogin, userBlocked.isBlocked, userController.loadCheckout);
user_route.get('/contact', userController.loadContact);
user_route.get('/404', userController.loadErrorPage);
user_route.get('/logout', userController.userLogout);
user_route.get('/addAddress', userAuth.isLogin, userBlocked.isBlocked, addressContoller.loadAddAddress);
user_route.get('/editAddress', userAuth.isLogin, userBlocked.isBlocked, addressContoller.loadEditAddress);
user_route.get('/test', userController.loadTestPage);

user_route.get('/resendOTP', otpController.resendOtp);
user_route.get('/search', filterController.searchFeature);
user_route.get('/sortMethod', filterController.sortFunction);
user_route.get('/orderSuccess', userAuth.isLogin, orderController.loadOrderSuccess);
user_route.get('/forgotPassword', userAuth.isLogout, otpController.loadForgotPassword);
user_route.get('/resetPassword', userAuth.isLogout, otpController.loadResetPassword);


/*********      Google Auth Routes      **********/ 

// Google Auth Route
user_route.get('/auth/google' , passport.authenticate('google', { scope: ['email', 'profile'] }));

// Google Auth callback
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

// Facebook Auth Route
// user_route.get('/auth/facebook' , passport.authenticate('facebook', { scope: ['public_profile', 'email'] }));

// // Facebook Auth callback
// user_route.get('/auth/facebook/callback',
//     passport.authenticate('facebook', {
//         successRedirect: '/facebookSuccess',
//         failureRedirect: '/facebookFailure'
//     })
// );

// // Success and Failure Routes
// user_route.get('/facebookSuccess', userController.successFacebookLogin);
// user_route.get('/facebookFailure', userController.failureFacebookLogin);


/*********      Post Requests      **********/ 
user_route.post('/register', userController.insertUser);
user_route.post('/login', userController.userLogin);
user_route.post('/otp', otpController.validateOTP);
user_route.post('/addAddress', userAuth.isLogin, addressContoller.insertAddress);
user_route.post('/addToWishlist', userAuth.isLogin, wishlistController.addToWishlist);
user_route.post('/Wishlist', userAuth.isLogin, wishlistController.deleteProductFromWishlist);
user_route.post('/editAddress', userAuth.isLogin, addressContoller.updateAddress);
user_route.post('/profile', userAuth.isLogin, addressContoller.deleteAddress, orderController.deleteOrder);
user_route.post('/addToCart', userAuth.isLogin, cartController.addToCart);
user_route.post('/cart', userAuth.isLogin, cartController.deleteProductFromCart, cartController.updateCart);
user_route.post('/checkout', userAuth.isLogin, couponController.applyCoupon, couponController.removeCoupon, orderController.placeOrder);
user_route.post('/forgotPassword', otpController.sendOtpForResetPassword);
user_route.post('/resetPassword', otpController.resetPassword);
// user_route.post('/category', userController.sortItems);


module.exports = user_route;