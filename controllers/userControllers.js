const User = require('../models/userModel');
const Product = require('../models/productModel');
const Category = require('../models/categoryModel');
const Address = require('../models/addressModel');
const Wishlist = require('../models/wishlistModel');
const Cart = require('../models/cartModel');
const Order = require('../models/orderModel');
const Offer = require('../models/offerModel');

const bcrypt = require('bcrypt')
const nodemailer = require('nodemailer');
const Otp = require('../models/otpModel');

const otpController = require('../controllers/otpController');

/*****************      To Secure the password Using bcrypt     *********************/

const securePassword = async(password) => {
    try {

        const passwordHash = await bcrypt.hash(password, 10);
        return passwordHash;

        
    } catch (error) {
        console.log(error.message);
    };
};

// const otpValue =  generateOTP();



/*****************      To load the Home page     *********************/

const loadHome = async (req, res) => {
    try {

        const categoryData = await Category.find({is_hide: 0});
        const cartData = await Cart.find({user: req.session.user_id});
        const cartDataForCount = await Cart.findOne({user: req.session.user_id}).populate('products');


        if (cartDataForCount == null) {
            res.render('Home', {pageTitle: 'PhoneZee | Your Shopping Destination', loginOrCart: req.session, categories: categoryData, cartItemsForCartCount: cartDataForCount});
        } else {
            res.render('Home', {pageTitle: 'PhoneZee | Your Shopping Destination', loginOrCart: req.session, categories: categoryData, cartItemsForCartCount: cartDataForCount.products});
        };

    } catch (error) {
        console.log(error.message)
    };
};

/*****************      To load the Login page     *********************/

const loadLoginPage = async (req, res) => {
    try {
        
        res.render('login', {pageTitle: 'login | PhoneZee', loginOrCart: req.session})

    } catch (error) {
        console.log(error.message);
    };
};

/*****************      To load the Signup page     *********************/

const loadSignUpPage = async (req, res) => {
    try {
        
        res.render('signup', {activeMessage: 'active', pageTitle: 'signin | PhoneZee', loginOrCart: req.session})

    } catch (error) {
        console.log(error.message);
    };
};

/*****************      To load after Success on Goole Login     *********************/

const successGoogleLogin = async (req, res) => {
    try {

        if (req.user) {

            const user = new User({
                name: req.user.displayName,
                email: req.user.email
            });

            const userAlready = await User.findOne({
                email: req.user.email
            });

            if (userAlready) {
                const userData = await User.findOne({email: req.user.email});

                if (userData) {
                    req.session.user_id = userData._id;
                    res.redirect('/');
                } else {
                    res.render('login', {validationMessage: 'User Not Added', loginOrCart: req.session});
                };
            } else {

                const userData = await user.save();

                if (userData) {
                    req.session.user_id = userData._id;
                    req.session.user_email = req.user.email;
                    res.redirect('/');
                } else {
                    res.render('login', {validationMessage: 'User Not Added', loginOrCart: req.session});
                };
            };
            
           
        } else {
            res.redirect('/googleFailure');
        };
        
    } catch (error) {
        console.log(error.message);
    };
};

/*****************      To load after Failure on Goole Login     *********************/

const FailureGoogleLogin = async (req, res) => {
    try {

        res.render('signup', {message: 'Google Login Failed', loginOrCart: req.session});
        
    } catch (error) {
        console.log(error.message);
    };
};


// /*****************      To load after Success on Goole Login     *********************/

// const successFacebookLogin = async (req, res) => {
//     try {

//         console.log(req.user);
//         // if (req.user) {
//         //     console.log(req.user);
//         //     const user = new User({
//         //         name: req.user.displayName,
//         //         email: req.user.email
//         //     });

//         //     const userAlready = await User.findOne({
//         //         email: req.user.email
//         //     });

//         //     if (userAlready) {
//         //         const userData = await User.findOne({email: req.user.email});

//         //         if (userData) {
//         //             req.session.user_id = userData._id;
//         //             res.redirect('/');
//         //         } else {
//         //             res.render('login', {validationMessage: 'User Not Added', loginOrCart: req.session});
//         //         };
//         //     } else {

//         //         const userData = await user.save();

//         //         if (userData) {
//         //             req.session.user_id = userData._id;
//         //             res.redirect('/');
//         //         } else {
//         //             res.render('login', {validationMessage: 'User Not Added', loginOrCart: req.session});
//         //         };
//         //     };
            
           
//         // } else {
//         //     res.redirect('/facebookFailure');
//         // };
        
//     } catch (error) {
//         console.log(error.message);
//     };
// };

// /*****************      To load after Failure on Goole Login     *********************/

// const failureFacebookLogin = async (req, res) => {
//     try {

//         res.render('signup', {message: 'Facebook Login Failed', loginOrCart: req.session});
        
//     } catch (error) {
//         console.log(error.message);
//     };
// };

/*****************      To load the Category page     *********************/

const loadCategory = async (req, res) => {
    try {
        
        const productData = await Product.find({is_hide: 0});
        const categoryData = await Category.find({is_hide: 0});
        const cartDataForCount = await Cart.findOne({user: req.session.user_id}).populate('products');

        if (cartDataForCount == null) {
            res.render('category', {activeShopMessage: 'active', pageTitle: 'products | PhoneZee', product: productData, categories: categoryData, loginOrCart: req.session, cartItemsForCartCount: cartDataForCount, sortMethod: 'undefined' });
        } else {
            res.render('category', {activeShopMessage: 'active', pageTitle: 'products | PhoneZee', product: productData, categories: categoryData, loginOrCart: req.session, cartItemsForCartCount: cartDataForCount.products, sortMethod: 'undefined' });
        };

    } catch (error) {
        console.log(error.message);
    };
};

/*****************      To load the FAQ page     *********************/

const loadFaq = async (req, res) => {
    try {

        const cartDataForCount = await Cart.findOne({user: req.session.user_id}).populate('products');
        
        if (cartDataForCount == null) {
            res.render('faq', {activeMoreMessage: 'active', pageTitle: 'FAQs | PhoneZee', loginOrCart: req.session, cartItemsForCartCount: cartDataForCount });
        } else {
            res.render('faq', {activeMoreMessage: 'active', pageTitle: 'FAQs | PhoneZee', loginOrCart: req.session, cartItemsForCartCount: cartDataForCount.products });
        };
        // res.render('faq', {activeMoreMessage: 'active', pageTitle: 'FAQs | PhoneZee', loginOrCart: req.session, cartItemsForCartCount: cartDataForCount.products });

    } catch (error) {
        console.log(error.message);
    };
};

/*****************      To load the Checkout page     *********************/

const loadCheckout = async (req, res) => {
    try {

        const addressData = await Address.find({user: req.session.user_id});

        const cartData = await Cart.findOne({user: req.session.user_id}).populate('products.product');

        const cartDataForCount = await Cart.findOne({user: req.session.user_id}).populate('products');
        
        res.render('checkout', {pageTitle: 'checkout | PhoneZee', loginOrCart: req.session, address: addressData, cartItems: cartData, cartItemsForCartCount: cartDataForCount.products });

    } catch (error) {
        console.log(error.message);
    };
};

/*****************      To load the About page     *********************/

const loadAbout = async (req, res) => {
    try {
        
        const cartDataForCount = await Cart.findOne({user: req.session.user_id}).populate('products');

        if (cartDataForCount == null) {
            res.render('about', {pageTitle: 'about | PhoneZee', loginOrCart: req.session, cartItemsForCartCount: cartDataForCount });
        } else {
            res.render('about', {pageTitle: 'about | PhoneZee', loginOrCart: req.session, cartItemsForCartCount: cartDataForCount.products });
        };

    } catch (error) {
        console.log(error.message);
    };
};

/*****************      To load the Contact page     *********************/

const loadContact = async (req, res) => {
    try {

        const cartDataForCount = await Cart.findOne({user: req.session.user_id}).populate('products');
        
        if (cartDataForCount == null) {
            res.render('contact', {pageTitle: 'contact | PhoneZee', loginOrCart: req.session, cartItemsForCartCount: cartDataForCount });
        } else {
            res.render('contact', {pageTitle: 'contact | PhoneZee', loginOrCart: req.session, cartItemsForCartCount: cartDataForCount.products });
        };

    } catch (error) {
        console.log(error.message);
    };
};

/*****************      To load the Error page     *********************/

const loadErrorPage = async (req, res) => {
    try {

        const cartDataForCount = await Cart.findOne({user: req.session.user_id}).populate('products');
        
        if (cartDataForCount == null) {
            res.render('404', {pageTitle: 'Error | PhoneZee', loginOrCart: req.session, cartItemsForCartCount: cartDataForCount });
        } else {
            res.render('404', {pageTitle: 'Error | PhoneZee', loginOrCart: req.session, cartItemsForCartCount: cartDataForCount.products });
        };

    } catch (error) {
        console.log(error.message);
    };
};

/*****************      To load the Profile page     *********************/

const loadProfile = async (req, res) => {
    try {
        
        const addressData = await Address.find({user: req.session.user_id});
        const userData = await User.findOne({_id: req.session.user_id});
        const orderData = await Order.find({ user: req.session.user_id }).populate('products.product').populate('address');

        const cartDataForCount = await Cart.findOne({user: req.session.user_id}).populate('products');

        if (cartDataForCount == null) {
            res.render('profile', {pageTitle: 'profile | PhoneZee', loginOrCart: req.session, user: userData, address: addressData, Orders: orderData, cartItemsForCartCount: cartDataForCount });
        } else {
            res.render('profile', {pageTitle: 'profile | PhoneZee', loginOrCart: req.session, user: userData, address: addressData, Orders: orderData, cartItemsForCartCount: cartDataForCount.products });
        };

    } catch (error) {
        res.render('404', { loginOrCart: req.session });
        console.log(error.message);
    };
};

/*****************      To Add the user data to database     *********************/

const insertUser = async (req, res) => {
    try {

        const user = new User({
            name: req.body.userName,
            email: req.body.userEmail,
            number: req.body.userMobile,
            password: req.body.userPassword,
        });

        if (req.body.userName.trim() === '') {
            res.render('signup', { message: 'Please enter your name.' , userLiveData: user, loginOrCart: req.session});
        } else if (req.body.userEmail.trim() === '') {
            res.render('signup', { message: 'Please enter your email address.' , userLiveData: user, loginOrCart: req.session});
        } else if (req.body.userMobile.trim() === '') {
            res.render('signup', { message: 'Please enter your mobile number.' , userLiveData: user, loginOrCart: req.session});
        } else if (req.body.userPassword.trim() === '') {
            res.render('signup', { message: 'Please enter your password.' , userLiveData: user, loginOrCart: req.session});
        } else if (req.body.confirmPassword.trim() === '') {
            res.render('signup', { message: 'Please enter your password.' , userLiveData: user, loginOrCart: req.session});
        } else if (req.body.userEmail.includes(' ')) {
            res.render('signup', { message: 'Inavlid Email Address. No spaces Allowed' , userLiveData: user, loginOrCart: req.session});
        } else if (!/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/.test(req.body.userEmail)) {
            res.render('signup', { message: 'Invalid Email Address. Only lowercase letters are allowed.' , userLiveData: user, loginOrCart: req.session});
        } else if (req.body.userMobile.length != 10) {
            res.render('signup', { message: 'Inavlid Mobile Number. ' , userLiveData: user, loginOrCart: req.session});
        } else if (req.body.userPassword.includes(' ')) {
            res.render('signup', { message: 'Password should not contain spaces.' , userLiveData: user, loginOrCart: req.session});
        } else if (req.body.userPassword.length < 8) {
            res.render('signup', { message: 'Password must be at least 8 characters long.' , userLiveData: user, loginOrCart: req.session});
        } else if (!/[A-Z]/.test(req.body.userPassword)) {
            res.render('signup', { message: 'Password must contain at least one uppercase letter.' , userLiveData: user, loginOrCart: req.session});
        } else if (!/[a-z]/.test(req.body.userPassword)) {
            res.render('signup', { message: 'Password must contain at least one uppercase letter.' , userLiveData: user, loginOrCart: req.session});
        } else if (!/\d/.test(req.body.userPassword)) {
            res.render('signup', { message: 'Password must contain at least one number.' , userLiveData: user, loginOrCart: req.session});
        } else if (!/[@$!%*?&]/.test(req.body.userPassword)) {
            res.render('signup', { message: 'Password must contain at least one special character (@, $, !, %, *, &, ?)' , userLiveData: user, loginOrCart: req.session});          
        } else {
            const userAlready = await User.findOne({
                email: req.body.userEmail
            });
    
            if (userAlready) {
    
                res.render('signup',{message: 'user with email already exixts', userLiveData: user, loginOrCart: req.session})
    
            } else {
                if (req.body.userPassword !== req.body.confirmPassword) {
                    res.render('signup', {message: 'Incorrect Password', userLiveData: user, loginOrCart: req.session});
                } else {                    

                    // Sending the VerifyMail
                    let ans = await otpController.VerifyMail(req.body.userEmail, req.body.userName).catch(console.error);

                    req.session.user_email = req.body.userEmail;
                    req.session.user_number = req.body.userMobile;

                    const lastFourDigits = req.session.user_number.toString().slice(-4);
                    res.render('otp', {userEmail: req.body.userEmail, userName: req.body.userName, userMobile: lastFourDigits});

                    if (ans) {

                        res.render('signup', {signupMessage: 'A Problem Occured While Sending Email'});

                    } else {

                        user.password = await securePassword(req.body.userPassword);
                        const userData = await user.save();

                        if (userData) {

                        } else {
                            res.render('signup', {signupMessage: 'User Not Added'});
                        };
                    };
                };
            };
        };

    } catch (error) {
        res.render('404', {loginOrCart: req.session});
        console.log(error.message);
    };
};

/*****************      To verify the user login Data    *********************/

const userLogin = async (req, res) => {
    try {

        const email = req.body.userEmail;
        const password = req.body.userPassword;

        const userData = await User.findOne({
            email: email
        });

        const passwordMatch = await bcrypt.compare(password, userData.password);

        if (passwordMatch) {

            if (userData.is_verified === 0) {
                res.render('login', {validationMessage: 'Your mail is not verified', pageTitle: 'login | PhoneZee', loginOrCart: req.session});
            } else if (userData.is_blocked != 0) {
                res.render('login', {validationMessage: 'You Are Banned From This Site', pageTitle: 'login | PhoneZee', loginOrCart: req.session});
            } else {
                req.session.user_id = userData._id;
                res.redirect('/');
            }

        } else {
            res.render('login', {validationMessage: 'Incorrect Username or Password', pageTitle: 'login | PhoneZee', loginOrCart: req.session});
        }

    } catch (error) {
        res.render('404', {loginOrCart: req.session});
        console.log(error.message);
    };
};

/*****************      To Logout the user     *********************/

const userLogout = async (req, res) => {
    try {

        req.session.destroy();
        res.redirect('/');

    } catch (error) {
        console.log(error.message);
    };
};

/*****************      To load the testing page     *********************/

const loadTestPage = async (req, res) => {
    try {

        const cartDataForCount = await Cart.findOne({user: req.session.user_id}).populate('products');

        if (cartDataForCount == null) {
            res.render('example', {pageTitle: 'PhoneZee | Your Shopping Destination', loginOrCart: req.session, cartItemsForCartCount: cartDataForCount  });
        } else {
            res.render('example', {pageTitle: 'PhoneZee | Your Shopping Destination', loginOrCart: req.session, cartItemsForCartCount: cartDataForCount.products  });
        };

    } catch (error) {
        console.log(error.message);
    };
};

module.exports = {
    loadHome,
    loadLoginPage,
    loadSignUpPage,
    successGoogleLogin,
    FailureGoogleLogin,
    // successFacebookLogin,
    // failureFacebookLogin,
    loadCategory,
    loadFaq,
    loadCheckout,
    loadAbout,
    loadContact,
    loadErrorPage,
    loadProfile,
    userLogin,
    insertUser,
    loadTestPage,
    userLogout,

};