const User = require('../models/userModel');
const Product = require('../models/productModel');
const Category = require('../models/categoryModel');
const Address = require('../models/addressModel');
const Wishlist = require('../models/wishlistModel');
const Cart = require('../models/cartModel');
const Order = require('../models/orderModel');
const Offer = require('../models/offerModel');
const Coupon = require('../models/couponModel');
const Wallet = require('../models/walletModel');

const bcrypt = require('bcrypt')
const nodemailer = require('nodemailer');
const Otp = require('../models/otpModel');

const { parseISO, format } = require('date-fns');

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

        const topSellingProducts = await Product.find({is_hide: 0}).sort({count: -1}).limit(6);
        const topSellingCategories = await Category.find({is_hide: 0}).sort({count: -1}).limit(6);

        const categoriesToFrontend = [];
        const categoryImages = [];
        const topSellingCategoriesImage = [];

        for (let i = 0; i < categoryData.length; i++) {
            let proData = await Product.findOne({ category: categoryData[i].name });
            if (proData != null) {
                categoriesToFrontend.push(categoryData[i]);
                categoryImages.push(proData.product_image[0]);
            };
        };

        for (let i = 0; i < topSellingCategories.length; i++) {
            let proData = await Product.findOne({ category: topSellingCategories[i].name });
            if (proData != null) {
                topSellingCategoriesImage.push(proData.product_image[0]);
            } 
        };

        const newArrivals = await Product.find().sort({created_at: -1}).limit(6);

        const dealOfTheDay = await Product.findOne({offer: 1}).sort({created_at: -1}).limit(1)

        if (cartDataForCount == null) {
            res.render('Home', {pageTitle: 'PhoneZee | Your Shopping Destination', loginOrCart: req.session, categories: categoriesToFrontend, cartItemsForCartCount: cartDataForCount, categoryImages, newArrivals, dealOfTheDay, topSellingProducts, topSellingCategories, topSellingCategoriesImage});
        } else {
            res.render('Home', {pageTitle: 'PhoneZee | Your Shopping Destination', loginOrCart: req.session, categories: categoriesToFrontend, cartItemsForCartCount: cartDataForCount.products, categoryImages, newArrivals, dealOfTheDay, topSellingProducts, topSellingCategories, topSellingCategoriesImage});
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

const loadCategory = async (req, res, next) => {
    try {

        let productData = '';

        const sortValue = 'undefined';

        let priceRangeProducts = await Product.find({is_hide: 0});

        const searchText = 'undefined';

        const { sortby, q, cat, off, price_range } = req.query;

        if (price_range) { // Check if price_range is defined
            // Split price_range into min and max prices
            const priceRange = price_range.split('to');
            const minPrice = parseInt(priceRange[0]);
            const maxPrice = parseInt(priceRange[1]);

            // Find products within the specified price range
            priceRangeProducts = await Product.find({ is_hide: 0, price: { $gte: minPrice, $lte: maxPrice } });
            console.log('priceRangeProducts - ', priceRangeProducts);
        };
        
        // const priceRangeProducts = await Product.find({price})

        if ( sortby || q ) {
            next();
        } else {

            const page = parseInt(req.query.page) || 1; 
            const limit = parseInt(req.query.limit) || 8; 
    
            const skip = (page - 1) * limit;
    
            const productForLength = await Product.find({ is_hide: 0 });

            if ( !cat && !off ) {

                productData = priceRangeProducts.slice(skip, skip + limit);

            } else {

                if ( !cat ) {

                    productData = priceRangeProducts.filter(product => product.offer === 1).slice(skip, skip + limit);

                } else {

                    productData = priceRangeProducts.filter(product => product.category === cat).slice(skip, skip + limit);

                };

            };

            const categoryData = await Product.distinct('category');

            const categoryDataProductsCount = [];

            for (let i = 0; i < productForLength.length; i++) {
                let count = 0;
                for (let j = 0; j < categoryData.length; j++) {
                    if (categoryData[j] == productForLength[i].category) {
                        count++;
                    };
                };
                categoryDataProductsCount.push(count);
            };
    
            const cartDataForCount = await Cart.findOne({ user: req.session.user_id }).populate('products');
    
            let cartItemsForCartCount = null;
            if (cartDataForCount) {
                cartItemsForCartCount = cartDataForCount.products;
            };
    
            res.render('category', {
                activeShopMessage: 'active',
                pageTitle: 'products | PhoneZee',
                product: productData,
                categories: categoryData,
                loginOrCart: req.session,
                cartItemsForCartCount: cartItemsForCartCount,
                sortMethod: 'undefined',
                categoryDataProductsCount,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(productForLength.length / limit),
                    hasNextPage: skip + limit < productData.length,
                    hasPreviousPage: page > 1,
                    nextPage: page + 1,
                    previousPage: page - 1
                },
                sortValue,
                searchText,
                categoryDataProductsCount
            });
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

        const userData = await User.findOne({_id: req.session.user_id});

        const addressData = await Address.find({user: req.session.user_id});

        const cartData = await Cart.findOne({user: req.session.user_id}).populate('products.product');

        const cartDataForCount = await Cart.findOne({user: req.session.user_id}).populate('products');
        
        res.render('checkout', {pageTitle: 'checkout | PhoneZee', loginOrCart: req.session, address: addressData, cartItems: cartData, cartItemsForCartCount: cartDataForCount.products, user: userData });

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

        const orderDate = [];
        const walletDate = [];
        const couponExpiryDate = [];
        
        const addressData = await Address.find({user: req.session.user_id});
        const userData = await User.findOne({_id: req.session.user_id});
        const orderData = await Order.find({ user: req.session.user_id }).populate('products.product').populate('address').sort({createdAt: -1});

        const walletData = await Wallet.find({user: req.session.user_id}).sort({created_at: -1});

        for (let i = 0; i < orderData.length; i++) {

            const date = orderData[i].created_at;
        
            const formatconvertedDate = format(date, "MMM dd, yyyy");

            orderDate[i] = formatconvertedDate;
        };

        for (let i = 0; i < walletData.length; i++) {

            const date = walletData[i].created_at;
        
            const formatconvertedDate = format(date, "MMM dd, yyyy");

            walletDate[i] = formatconvertedDate;
        };

        const cartDataForCount = await Cart.findOne({user: req.session.user_id}).populate('products');

        const currentDate = new Date();

        const couponData = await Coupon.find({ is_hide: 0, start_date: { $lte: currentDate }, end_Date: { $gte: currentDate } }).sort({ created_at: 1 })

        for (let i = 0; i < couponData.length; i++) {

            const date = couponData[i].end_Date;
        
            const formatconvertedDate = format(date, "MMM dd, yyyy");

            couponExpiryDate[i] = formatconvertedDate;
        };

        let couponStatusArray = [];

        couponData.forEach((element, index) => {

            let flag = 0;

            for ( let i = 0; i < userData.coupon_claimed.length; i++ ) {

                if ( element._id.toString() == userData.coupon_claimed[i].couponId ) {

                    flag = 1;
                    
                };

            };

            flag === 1 ? couponStatusArray[index] = 'claimed' : couponStatusArray[index] = 'unclaimed';

            flag = 0;

        });

        const orderCountByDelivered = await Order.find({ user: req.session.user_id, order_status: { $ne: 'cancelOrder' } }).countDocuments();

        if (cartDataForCount == null) {
            res.render('profile', {pageTitle: 'profile | PhoneZee', loginOrCart: req.session, user: userData, address: addressData, Orders: orderData, walletData, orderDate, walletDate, cartItemsForCartCount: cartDataForCount, coupons: couponData, couponExpiryDate, couponStatusArray, orderCountByDelivered });
        } else {
            res.render('profile', {pageTitle: 'profile | PhoneZee', loginOrCart: req.session, user: userData, address: addressData, Orders: orderData, walletData, orderDate, walletDate, cartItemsForCartCount: cartDataForCount.products, coupons: couponData, couponExpiryDate, couponStatusArray, orderCountByDelivered });
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

/*****************      To Update the user Profile     *********************/

const updateProfile = async (req, res) => {
    try {

        const { userName, userMail, userNumber, currentPassword, newPassword, newConfirmPassword } = req.body;

        if (userName.trim() === '') {
            req.flash('errorMessage', 'Please enter your name.');
            res.redirect('/profile');
        } else if (userNumber.length == 0) {
            req.flash('errorMessage', 'Please enter your mobile number.');
            res.redirect('/profile');
        } else if (userNumber.length != 10) {
            req.flash('errorMessage', 'Inavlid Mobile Number.');
            res.redirect('/profile');
        } else {

            const userData = await User.findOne({_id: req.session.user_id});

            userName == userData.name ? userData.name : userData.name = userName ;
            userNumber == userData.number ? userData.number : userData.number = userNumber;
    
            if ( currentPassword ) {
                const passwordMatch = bcrypt.compare(currentPassword, userData.password);
    
                if (!passwordMatch) {
                    req.flash('errorMessage', 'Enter the correct Password.');
                    res.redirect('/profile');
                } else {
    
                    if (newPassword === '') {
                        req.flash('errorMessage', 'Please enter your password.');
                        res.redirect('/profile');
                    } else if (newConfirmPassword === '') {
                        req.flash('errorMessage', 'Please enter your password.');
                        res.redirect('/profile');
                    }else if (newPassword.includes(' ')) {
                        req.flash('errorMessage', 'Password should not contain spaces.');
                        res.redirect('/profile');
                    } else if (newPassword.length < 8) {
                        req.flash('errorMessage', 'Password must be at least 8 characters long.');
                        res.redirect('/profile');
                    } else if (!/[A-Z]/.test(newPassword)) {
                        req.flash('errorMessage', 'Password must contain at least one uppercase letter.');
                        res.redirect('/profile');
                    } else if (!/[a-z]/.test(newPassword)) {
                        req.flash('errorMessage', 'Password must contain at least one uppercase letter.');
                        res.redirect('/profile');
                    } else if (!/\d/.test(newPassword)) {
                        req.flash('errorMessage', 'Password must contain at least one number.');
                        res.redirect('/profile');
                    } else if (!/[@$!%*?&]/.test(newPassword)) {
                        req.flash('errorMessage', 'Password must contain at least one special character (@, $, !, %, *, &, ?)');
                        res.redirect('/profile');          
                    } else {

                        if (newConfirmPassword == newPassword) {

                            userData.password = await securePassword(newPassword);

                            await userData.save();

                            req.flash('successMessage', "Profile edited successfully.");
                            res.redirect('profile');

                        } else {
                            req.flash('errorMessage', "Confirm password didn't Match.");
                            res.redirect('/profile'); 
                        };

                    };
    
                };
            } else {
                await userData.save();

                req.flash('successMessage', "Profile edited successfully.");
                res.redirect('profile');
            };
    
        };

    } catch (error) {
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
    updateProfile,
    loadTestPage,
    userLogout,

};