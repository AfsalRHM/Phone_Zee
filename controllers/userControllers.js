const User = require('../models/userModel');
const Product = require('../models/productModel');
const Category = require('../models/categoryModel');
const Address = require('../models/addressModel');
const Wishlist = require('../models/wishlistModel');
const Cart = require('../models/cartModel');

const bcrypt = require('bcrypt')
const nodemailer = require('nodemailer');
const Otp = require('../models/otp');

/*****************      To Secure the password Using bcrypt     *********************/

const securePassword = async(password) => {
    try {

        const passwordHash = await bcrypt.hash(password, 10);
        return passwordHash;

        
    } catch (error) {
        console.log(error.message);
    };
};

/*****************      To send the email     *********************/

// Generate a random 6-digit number
function generateOTP() {
    const otp = Math.floor(100000 + Math.random() * 900000);
    return otp.toString(); 
}

// const otpValue =  generateOTP();

const transporter =  nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // upgrade later with STARTTLS
    auth: {
      user: "afsalrahmanm25@gmail.com",
      pass: "sclv dytn njag ohro",
    },
  });

async function VerifyMail(recieverEmail, recieverName) {

    const otpValue =  generateOTP();

    await Otp.deleteMany({email: recieverEmail});

    const info = await transporter.sendMail({
    from: '"PhoneZee.com " <afsalrahmanm25@gmail.com>', 
    to: recieverEmail, 
    subject: "Phonzee 6-digit OTP", 
    headers: `Hello ${recieverName}` ,
    html: `<b>The 6-digit Otp is : ${otpValue}</b>`, 
    });

    const otp = await new Otp({
        otp: otpValue,
        email: recieverEmail,
        expire_at: new Date(Date.now() + (10 * 1000 * 1))
    });

    const otpData = await otp.save();
    
};

/*****************      To load the Home page     *********************/

const loadHome = async (req, res) => {
    try {

        const categoryData = await Category.find({is_hide: 0});
        res.render('Home', {pageTitle: 'PhoneZee | Your Shopping Destination', loginOrCart: req.session, categories: categoryData});

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


/*****************      To load after Success on Goole Login     *********************/

const successFacebookLogin = async (req, res) => {
    try {

        console.log(req.user);
        // if (req.user) {
        //     console.log(req.user);
        //     const user = new User({
        //         name: req.user.displayName,
        //         email: req.user.email
        //     });

        //     const userAlready = await User.findOne({
        //         email: req.user.email
        //     });

        //     if (userAlready) {
        //         const userData = await User.findOne({email: req.user.email});

        //         if (userData) {
        //             req.session.user_id = userData._id;
        //             res.redirect('/');
        //         } else {
        //             res.render('login', {validationMessage: 'User Not Added', loginOrCart: req.session});
        //         };
        //     } else {

        //         const userData = await user.save();

        //         if (userData) {
        //             req.session.user_id = userData._id;
        //             res.redirect('/');
        //         } else {
        //             res.render('login', {validationMessage: 'User Not Added', loginOrCart: req.session});
        //         };
        //     };
            
           
        // } else {
        //     res.redirect('/facebookFailure');
        // };
        
    } catch (error) {
        console.log(error.message);
    };
};

/*****************      To load after Failure on Goole Login     *********************/

const failureFacebookLogin = async (req, res) => {
    try {

        res.render('signup', {message: 'Facebook Login Failed', loginOrCart: req.session});
        
    } catch (error) {
        console.log(error.message);
    };
};

/*****************      To load the OTP page     *********************/

const loadOtpPage = async (req, res) => {
    try {

        // const otpData = await Otp.find({});
        res.render('otp');
        
    } catch (error) {
        console.log(error.message);
    };
};

/*****************      To load the Category page     *********************/

const loadCategory = async (req, res) => {
    try {
        
        const productData = await Product.find({is_hide: 0});
        const categoryData = await Category.find({is_hide: 0});
        res.render('category', {activeShopMessage: 'active', pageTitle: 'products | PhoneZee', product: productData, categories: categoryData, loginOrCart: req.session});

    } catch (error) {
        console.log(error.message);
    };
};

/*****************      To load the Cart page     *********************/

const loadCart = async (req, res) => {
    try {

        let cartTotalPrice = 0;

        const cartData = await Cart.find({user: req.session.user_id}).populate('product');

        for (let i = 0; i < cartData.length; i++) {
            cartTotalPrice += cartData[i].total_price;
        };

        console.log(cartTotalPrice);
        
        res.render('cart', {pageTitle: 'My cart | PhoneZee', loginOrCart: req.session, cartItems: cartData, cartTotalPrice: cartTotalPrice})

    } catch (error) {
        console.log(error.message);
    };
};

/*****************      To load the FAQ page     *********************/

const loadFaq = async (req, res) => {
    try {
        
        res.render('faq', {activeMoreMessage: 'active', pageTitle: 'FAQs | PhoneZee', loginOrCart: req.session})   

    } catch (error) {
        console.log(error.message);
    };
};

/*****************      To load the Product page     *********************/

const loadProduct = async (req, res) => {
    try {
        
        const id = req.query.id;
        const imagePosition = req.query.photoNumber;
        const productData = await Product.findOne({_id: id});
        const relatedProductData = await Product.find({_id: {$ne: id} ,category: productData.category});

        res.render('product', {pageTitle: 'product | PhoneZee', loginOrCart: req.session, product: productData, relatedProducts: relatedProductData, imagePos: imagePosition});

    } catch (error) {
        console.log(error.message);
    };
};

/*****************      To load the Checkout page     *********************/

const loadCheckout = async (req, res) => {
    try {

        const addressData = await Address.find({user: req.session.user_id});
        
        res.render('checkout', {pageTitle: 'checkout | PhoneZee', loginOrCart: req.session, address: addressData});

    } catch (error) {
        console.log(error.message);
    };
};

/*****************      To load the About page     *********************/

const loadAbout = async (req, res) => {
    try {
        
        res.render('about', {pageTitle: 'about | PhoneZee', loginOrCart: req.session});

    } catch (error) {
        console.log(error.message);
    };
};

/*****************      To load the Contact page     *********************/

const loadContact = async (req, res) => {
    try {
        
        res.render('contact', {pageTitle: 'contact | PhoneZee', loginOrCart: req.session});

    } catch (error) {
        console.log(error.message);
    };
};

/*****************      To load the Error page     *********************/

const loadErrorPage = async (req, res) => {
    try {
        
        res.render('404', {pageTitle: 'Error | PhoneZee', loginOrCart: req.session});

    } catch (error) {
        console.log(error.message);
    };
};

/*****************      To load the Favourite page     *********************/

const loadWishlist = async (req, res) => {
    try {

        const wishlistData = await Wishlist.find({user: req.session.user_id}).populate('product');
        
        res.render('wishlist', {pageTitle: 'wishlist | PhoneZee', loginOrCart: req.session, wishlistItems: wishlistData});

    } catch (error) {
        console.log(error.message);
    };
};

/*****************      To load the Profile page     *********************/

const loadProfile = async (req, res) => {
    try {
        
        const addressData = await Address.find({user: req.session.user_id});
        const userData = await User.findOne({_id: req.session.user_id});

        res.render('profile', {pageTitle: 'profile | PhoneZee', loginOrCart: req.session, user: userData, address: addressData });

    } catch (error) {
        res.render('404');
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
            res.render('signup', { message: 'Inavlid Email Address. ' , userLiveData: user, loginOrCart: req.session});
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
                    let ans = await VerifyMail(req.body.userEmail, req.body.userName).catch(console.error);

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

/*****************      To Validate the otp entered by user     *********************/

const validateOTP = async (req, res) => {
    try {

        const joinedOTP = req.body['otp-digit-1'] + req.body['otp-digit-2'] + req.body['otp-digit-3'] + req.body['otp-digit-4'] + req.body['otp-digit-5'] + req.body['otp-digit-6'];
        const otpData = await Otp.findOne({otp: joinedOTP});
        if (!otpData) {
            
            const lastFourDigits = req.session.user_number.toString().slice(-4);
            return res.render('otp', {message: 'Entered OTP is Incorrect', userEmail: req.session.user_email, userMobile: lastFourDigits})

        } else {
            const Email = await otpData.email;
            const userData = await User.updateOne({email: Email},{
                $set:{
                    is_verified : 1,
                }
            });

            userData.is_verified = 1;
            res.redirect('/login');

        }

    } catch (error) {
        res.render('404', {loginOrCart: req.session});
        console.log(error.message);
    };
};

/*****************      To Resend the OTP     *********************/

const resendOtp = async (req, res) => {
    try {

        const userMail = req.query.mail;
        const userName = req.query.name;
        const userMobileNumber = req.query.number;
        await Otp.deleteOne({email: userMail});

        // Sending the VerifyMail
        let ans = await VerifyMail(userMail, userName).catch(console.error);

        res.render('otp', {UserMobileNumber: userMobileNumber, userEmail: userMail, userName: userName});

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

/*****************      To load the Add Address page     *********************/

const loadAddAddress = async (req, res) => {
    try {

        const addressData = await Address.find({user: req.session.user_id});
        const userData = await User.findOne({_id: req.session.user_id});

        if (addressData.length < 5) {

            res.render('addAddress', {pageTitle: 'PhoneZee | Add new Address', loginOrCart: req.session });

        } else {
            res.render('profile#tab-address', {addressPageMessage: 'Maximum Address Reached', loginOrCart: req.session, user: userData, address: addressData  });
        }

    } catch (error) {
        console.log(error.message);
    };
};

/*****************      To Insert the Address     *********************/

const insertAddress = async (req, res) => {
    try {

        const address = new Address ({
            user: req.session.user_id,
            name: req.body.name,
            mobileNumber: req.body.mobileNumber,
            pincode: req.body.pincode,
            locality: req.body.locality,
            city: req.body.city,
            state: req.body.state,
            landmark: req.body.landmark,
            mobileNumber2: req.body.mobileNumber2            
        });

        if (address.landmark == '') {
            address.landmark = null;
        }

        if (address.mobileNumber2 == '') {
            address.mobileNumber2 = null;
        }

        if (!address.name.trim() ) {
            res.render('addAddress', {pageTitle: 'PhoneZee | Add new Address', loginOrCart: req.session, errorMessage: 'Please Enter You Name' });
        } else if (req.body.mobileNumber.length != 10 ) {
            return res.render('addAddress', {pageTitle: 'PhoneZee | Add new Address', loginOrCart: req.session, errorMessage: 'Please Enter a Valid Mobile Number' });
        } else if (req.body.pincode.length != 6 ) {
            return res.render('addAddress', {pageTitle: 'PhoneZee | Add new Address', loginOrCart: req.session, errorMessage: 'Please Enter a Valid Pincode' });
        } else if (!address.locality.trim() ) {
            return res.render('addAddress', {pageTitle: 'PhoneZee | Add new Address', loginOrCart: req.session, errorMessage: 'Please Enter Locality' });
        } else if (!address.city.trim() ) {
            return res.render('addAddress', {pageTitle: 'PhoneZee | Add new Address', loginOrCart: req.session, errorMessage: 'Please Enter City' });
        } else if (!address.state.trim() ) {
            return res.render('addAddress', {pageTitle: 'PhoneZee | Add new Address', loginOrCart: req.session, errorMessage: 'Please Enter State' });
        } else {

            await address.save();

            res.redirect('/profile')

        };

    } catch (error) {
        console.log(error.message);
    };
};

/*****************      To Load Edit Address Page      *********************/

const loadEditAddress =  async (req, res) => {
    try {

        const addressId = req.query.id;

        const addressData = await Address.findById({_id: addressId})

        res.render('editAddress', {pageTitle: 'PhoneZee | Edit Your Address', loginOrCart: req.session, address: addressData });

    } catch (error) {
        console.log(error.message);
    };
};

/*****************      To Load Edit Address Page      *********************/

const updateAddress =  async (req, res) => {
    try {

        const addressId = req.query.id;

        const addressData = await Address.findById({_id: addressId})

        const address = {
            user: req.session.user_id,
            name: req.body.name,
            mobileNumber: req.body.mobileNumber,
            pincode: req.body.pincode,
            locality: req.body.locality,
            city: req.body.city,
            state: req.body.state,
            landmark: req.body.landmark,
            mobileNumber2: req.body.mobileNumber2,
        };

        if (address.landmark == '') {
            address.landmark = null
        }
        if (address.mobileNumber2 == '') {
            address.mobileNumber2 = null
        }

        if (!address.name.trim() ) {
            res.render('editAddress', {pageTitle: 'PhoneZee | Edit Your Address', loginOrCart: req.session, errorMessage: 'Please Enter You Name', address: addressData });
        } else if (req.body.mobileNumber.length != 10 ) {
            res.render('editAddress', {pageTitle: 'PhoneZee | Edit Your Address', loginOrCart: req.session, errorMessage: 'Please Enter a Valid Mobile Number', address: addressData  });
        } else if (req.body.pincode.length != 6 ) {
            res.render('editAddress', {pageTitle: 'PhoneZee | Edit Your Address', loginOrCart: req.session, errorMessage: 'Please Enter a Valid Pincode', address: addressData  });
        } else if (!address.locality.trim() ) {
            res.render('editAddress', {pageTitle: 'PhoneZee | Edit Your Address', loginOrCart: req.session, errorMessage: 'Please Enter Locality', address: addressData  });
        } else if (!address.city.trim() ) {
            res.render('editAddress', {pageTitle: 'PhoneZee | Edit Your Address', loginOrCart: req.session, errorMessage: 'Please Enter City', address: addressData  });
        } else if (!address.state.trim() ) {
            res.render('editAddress', {pageTitle: 'PhoneZee | Edit Your Address', loginOrCart: req.session, errorMessage: 'Please Enter State', address: addressData  });
        } else {

            const addressAdded = await Address.findByIdAndUpdate(addressId, address, { new: true });

            if (addressAdded) {

                if (req.query.from) {
                    res.redirect('/checkout');
                } else {
                    res.redirect('/profile');
                }

            } else {
                res.render('editAddress', {pageTitle: 'PhoneZee | Edit Your Address', loginOrCart: req.session, errorMessage: 'Please Enter Locality', address: addressData });
            }


        };

    } catch (error) {
        console.log(error.message);
    };
};

/*****************      To add product to Wishlist     *********************/

const deleteAddress = async (req, res, next) => {
    try {
        const {addressId}=req.body;
        const address = await Address.findByIdAndDelete(addressId);

        if (!address) {
            return next();
        };

        res.status(200).json({ message: 'Success' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }; 
};

/*****************      To add product to Wishlist     *********************/

const addToWishlist = async (req, res) => {
    try {
        const {productId}=req.body;
        const product = await Product.findById(productId);

        const existingProduct = await Wishlist.findOne({user: req.session.user_id, product: productId});

        if (!existingProduct) {

            if (!product) {
                return next();
            };
    
            const wishlist = new Wishlist({
                user: req.session.user_id,
                product: productId,
            });
    
            await wishlist.save();
    
            res.status(200).json({ message: 'Success' });

        } else {
            res.status(200).json({ message: 'Already Exists' });
        }

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    };
};

/*****************      To Delete a Product from wislist     *********************/

const deleteProductFromWishlist = async (req, res) => {
    try {

        const { wislistItemId } = req.body;

        await Wishlist.deleteOne({_id: wislistItemId}); 

        res.status(200).json({ message: 'Success' });

    } catch (error) {
        console.log(error.message);
    };
};

/*****************      To Add Product to Cart     *********************/

const addToCart = async (req, res) => {
    try {

        const {productId, qty}=req.body;
        
        const product = await Product.findById(productId);

        const existingProduct = await Cart.findOne({user: req.session.user_id, product: productId});

        if (!existingProduct) {

            if (product.stock < qty) {
                res.status(200).json({ message: 'Not Enough Product' });
            } else {

                if (!product) {
                    return next();
                };

                if (!qty) {

                    const cart = new Cart({
                        user: req.session.user_id,
                        product: productId,
                        quantity: qty,
                        total_price: product.price
                    });

                    await cart.save();
        
                    res.status(200).json({ message: 'Success' });

                } else {

                    const cart = new Cart({
                        user: req.session.user_id,
                        product: productId,
                        quantity: qty,
                        total_price: qty * product.price
                    });
            
                    await cart.save();
            
                    res.status(200).json({ message: 'Success' });

                };

            };

        } else {
            res.status(200).json({ message: 'Already Exists' });
        };

    } catch (error) {
        console.log(error.message);
    };
};

/*****************      To Delete Product from the cart     *********************/

const deleteProductFromCart = async (req, res, next) => {
    try {

        const { cartItemId, check } = req.body;

        if (check != 'deleteProduct') {
            next()
        } else {
            await Cart.deleteOne({_id: cartItemId});

            res.status(200).json({ message: 'Success' });
        }

    } catch (error) {
        console.log(error.message);
    };
};

/*****************      To update the Cart when the User changes the quantity     *********************/

const updateCart =  async (req, res) => {
    try {

        let cartTotal = 0;
        const { cartItemId, newQuantity } = req.body;
        
        const cartData = await Cart.findOne({_id: cartItemId}).populate('product');

        const TotalPrice = cartData.product.price * newQuantity; 

        const cart = await Cart.find({user: req.session.user_id});

        console.log(cart)
        console.log(cartTotal)

        for (let i = 0; i < cart.length; i++) {
            cartTotal += cart[i].total_price
        }

        console.log(cartTotal)

        await Cart.findByIdAndUpdate(cartItemId, { quantity: newQuantity, total_price: TotalPrice}, { new: true });
        
        res.status(200).json({ message: 'Success', totalPrice: TotalPrice, cartTotal:  cartTotal });

    } catch (error) {
        console.log(error.message);
    };
};

/*****************      To load the testing page     *********************/

const loadTestPage = async (req, res) => {
    try {

        res.render('example', {pageTitle: 'PhoneZee | Your Shopping Destination', loginOrCart: req.session  });

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
    successFacebookLogin,
    failureFacebookLogin,
    loadOtpPage,
    loadCategory,
    loadCart,
    loadFaq,
    loadProduct,
    loadCheckout,
    loadAbout,
    loadContact,
    loadErrorPage,
    loadWishlist,
    loadProfile,
    userLogin,
    insertUser,
    loadTestPage,
    validateOTP,
    userLogout,
    resendOtp,
    loadAddAddress,
    insertAddress,
    addToWishlist,
    deleteProductFromWishlist,
    loadEditAddress,
    updateAddress,
    deleteAddress,
    addToCart,
    deleteProductFromCart,
    updateCart,

};