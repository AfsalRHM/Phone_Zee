const Admin = require('../models/adminModel');
const User = require('../models/userModel');
const Product = require('../models/productModel');
const Category = require('../models/categoryModel');
const Address = require('../models/addressModel');
const Wishlist = require('../models/wishlistModel');
const Cart = require('../models/cartModel');
const Order = require('../models/orderModel');
const Coupon = require('../models/couponModel');
const statusCode = require('../constants/statusCode');
const responseMessage = require('../constants/responseMessage');

/*********************     
 * 
 * 
 * 
 * 
 *   Admin Side Controlllers
 * 
 * 
 * 
 * 
 *********************/

/*****************      To load the Coupon list Page    *********************/

const loadCouponList = async(req, res) => {
    try {

        const couponData = await Coupon.find();

        res.render('couponList', {activeCouponMessage: 'active', couponData});
        
    } catch (error) {
        console.log(error.message);;
    };
};

/*****************      To load the Add Coupon Page    *********************/

const loadAddCoupon = async(req, res) => {
    try {

        res.render('addCoupon', {activeCouponMessage: 'active'});
        
    } catch (error) {
        console.log(error.message);;
    };
};

/*****************      To Add a Coupon     *********************/

const insertCoupon = async(req, res) => {
    try {

        console.log(req.body, "this is the body-----------------")
        const { couponName, couponCode, minimumPrice, discountPrice, startDate, endDate, couponQuantity } = req.body;

        const coupon = new Coupon ({
            name: couponName,
            coupon_code: couponCode,
            minimum_price: minimumPrice,
            discount_price: discountPrice,
            start_date: startDate,
            end_date: endDate,
            coupon_quantity: couponQuantity,
            remaining_quantity: couponQuantity
        });

        if (couponName.trim() === '') {
            res.render('addCoupon', { activeCouponMessage: 'active', addCouponErrorMessage: 'Please Enter a Coupon Name.', couponData: coupon });
        } else if (couponCode.trim() === '') {
            res.render('addCoupon', { activeCouponMessage: 'active', addCouponErrorMessage: 'Please Enter a Coupon Code.', couponData: coupon });
        } else if (!minimumPrice || isNaN(minimumPrice) || minimumPrice <= 0) {
            res.render('addCoupon', { activeCouponMessage: 'active', addCouponErrorMessage: 'Please Enter a valid Minimum Price.', couponData: coupon });
        } else if (!discountPrice || isNaN(discountPrice) || discountPrice <= 0) {
            res.render('addCoupon', { activeCouponMessage: 'active', addCouponErrorMessage: 'Please Enter a valid Discount Price.', couponData: coupon });
        } else if (!startDate || isNaN(Date.parse(startDate))) {
            res.render('addCoupon', { activeCouponMessage: 'active', addCouponErrorMessage: 'Please Enter a valid Start Date.', couponData: coupon });
        } else if (!endDate || isNaN(Date.parse(endDate))) {
            res.render('addCoupon', { activeCouponMessage: 'active', addCouponErrorMessage: 'Please Enter a valid End Date.', couponData: coupon });
        } else if (!couponQuantity || isNaN(couponQuantity) || couponQuantity <= 0) {
            res.render('addCoupon', { activeCouponMessage: 'active', addCouponErrorMessage: 'Please Enter a valid Coupon Quantity.', couponData: coupon });
        } else if (couponCode.trim().length <= 8) {
            res.render('addCoupon', { activeCouponMessage: 'active', addCouponErrorMessage: 'Coupon Code must include more that 8 characters.', couponData: coupon });
        } else if (couponCode.trim().length >= 13) {
            res.render('addCoupon', { activeCouponMessage: 'active', addCouponErrorMessage: 'Coupon Code can"t include more that 12 characters', couponData: coupon });
        } else if ( Date.parse(endDate) <= Date.parse(startDate) ) {
            res.render('addCoupon', { activeCouponMessage: 'active', addCouponErrorMessage: 'Please Enter a correct Start and End Date.', couponData: coupon });
        } else if (minimumPrice <= discountPrice) {
            res.render('addCoupon', { activeCouponMessage: 'active', addCouponErrorMessage: 'Please Enter a correct Minimum and Discount Price.', couponData: coupon });
        } else {

            const couponNameExists = await Coupon.findOne({name: { $regex:'.*' + coupon.name + '.*', $options: 'i' } });

            const couponCodeExists = await Coupon.findOne({coupon_code: { $regex:'.*' + coupon.coupon_code + '.*', $options: 'i' } });

            if (couponNameExists) {
                res.render('addCoupon', { activeCouponMessage: 'active', addCouponErrorMessage: 'Coupon With same Name already Exists.', couponData: coupon });
            } else if (couponCodeExists) {
                res.render('addCoupon', { activeCouponMessage: 'active', addCouponErrorMessage: 'Coupon With same Coupon Code already Exists.', couponData: coupon });
            } else {

                const couponSaved = await coupon.save();

                let couponData = await Coupon.find().lean();;
                
                couponData = couponData.map(coupon => ({
                    ...coupon,
                    start_date: new Date(coupon.start_date),
                    end_date: new Date(coupon.end_date)
                }));

                if (couponSaved) {
    
                    res.render('couponList', {activeCouponMessage: 'active', couponListSuccessMessage: 'Coupon Added Successfully.', couponData});
    
                } else {
                    res.render('addCoupon', { activeCouponMessage: 'active', addCouponErrorMessage: 'Error While Adding the Coupon.', couponData: coupon  });
                };

            };

        };
        
    } catch (error) {
        console.log(error.message);
    };
};

/*****************      To load the Edit Coupon Page    *********************/

const loadEditCoupon = async(req, res) => {
    try {

        const { couponId } = req.query;

        const couponData = await Coupon.findOne({_id: couponId});

        res.render('editCoupon', {activeCouponMessage: 'active', couponData});
        
    } catch (error) {
        console.log(error.message);;
    };
};

/*****************      To Update the Coupon    *********************/

const updateCoupon = async(req, res) => {
    try {

        const { couponName, couponCode, minimumPrice, discountPrice, startDate, endDate, couponQuantity, couponId } = req.body;

        const coupon = await Coupon.findOne({_id: couponId});

        if (couponName.trim() === '') {
            res.render('editCoupon', { activeCouponMessage: 'active', editCouponErrorMessage: 'Please Enter a Coupon Name.', couponData: coupon });
        } else if (couponCode.trim() === '') {
            res.render('editCoupon', { activeCouponMessage: 'active', editCouponErrorMessage: 'Please Enter a Coupon Code.', couponData: coupon });
        } else if (!minimumPrice || isNaN(minimumPrice) || minimumPrice <= 0) {
            res.render('editCoupon', { activeCouponMessage: 'active', editCouponErrorMessage: 'Please Enter a valid Minimum Price.', couponData: coupon });
        } else if (!discountPrice || isNaN(discountPrice) || discountPrice <= 0) {
            res.render('editCoupon', { activeCouponMessage: 'active', editCouponErrorMessage: 'Please Enter a valid Discount Price.', couponData: coupon });
        } else if (!startDate || isNaN(Date.parse(startDate))) {
            res.render('editCoupon', { activeCouponMessage: 'active', editCouponErrorMessage: 'Please Enter a valid Start Date.', couponData: coupon });
        } else if (!endDate || isNaN(Date.parse(endDate))) {
            res.render('editCoupon', { activeCouponMessage: 'active', editCouponErrorMessage: 'Please Enter a valid End Date.', couponData: coupon });
        } else if (!couponQuantity || isNaN(couponQuantity) || couponQuantity <= 0) {
            res.render('editCoupon', { activeCouponMessage: 'active', editCouponErrorMessage: 'Please Enter a valid Coupon Quantity.', couponData: coupon });
        } else if (couponCode.trim().length <= 8) {
            res.render('editCoupon', { activeCouponMessage: 'active', editCouponErrorMessage: 'Coupon Code must include more that 8 characters.', couponData: coupon });
        } else if (couponCode.trim().length >= 13) {
            res.render('editCoupon', { activeCouponMessage: 'active', editCouponErrorMessage: 'Coupon Code can"t include more that 12 characters', couponData: coupon });
        } else if ( Date.parse(endDate) <= Date.parse(startDate) ) {
            res.render('editCoupon', { activeCouponMessage: 'active', editCouponErrorMessage: 'Please Enter a correct Start and End Date.', couponData: coupon });
        } else if (minimumPrice <= discountPrice) {
            res.render('editCoupon', { activeCouponMessage: 'active', editCouponErrorMessage: 'Please Enter a correct Minimum and Discount Price.', couponData: coupon });
        } else {

            await Coupon.deleteOne({_id: couponId});

            const couponNameExists = await Coupon.findOne({name: { $regex:'.*' + couponName + '.*', $options: 'i' } });

            const couponCodeExists = await Coupon.findOne({coupon_code: { $regex:'.*' + couponCode + '.*', $options: 'i' } });

            if (couponNameExists) {
                res.render('editCoupon', { activeCouponMessage: 'active', editCouponErrorMessage: 'Coupon With same Name already Exists.', couponData: coupon });
            } else if (couponCodeExists) {
                res.render('editCoupon', { activeCouponMessage: 'active', editCouponErrorMessage: 'Coupon With same Coupon Code already Exists.', couponData: coupon });
            } else {

                coupon.name = couponName; 
                coupon.coupon_code = couponCode; 
                coupon.minimum_price = minimumPrice; 
                coupon.discount_price = discountPrice; 
                coupon.start_date = startDate; 
                coupon.end_date = endDate;
                coupon.coupon_quantity == couponQuantity ? coupon.remaining_quantity = coupon.remaining_quantity : coupon.remaining_quantity = couponQuantity;
                coupon.coupon_quantity = couponQuantity;

                const newCoupon = new Coupon({
                    name: coupon.name,
                    coupon_code: coupon.coupon_code,
                    minimum_price: coupon.minimum_price,
                    discount_price: coupon.discount_price,
                    start_date: coupon.start_date,
                    end_date: coupon.end_date,
                    coupon_quantity: coupon.coupon_quantity,
                    remaining_quantity: coupon.remaining_quantity,
                    is_hide: coupon.is_hide
                });

                const couponSaved = await newCoupon.save();

                const couponData = await Coupon.find();


                if (couponSaved) {
    
                    res.redirect('/admin/couponList');
    
                } else {
                    res.render('editCoupon', { activeCouponMessage: 'active', addCouponErrorMessage: 'Error While Editing the Coupon.', couponData: coupon });
                };

                // res.render('editCoupon', {activeCouponMessage: 'active', couponData});

            };

        };
        
    } catch (error) {
        console.log(error.message);;
    };
};

/*****************      To Change the status of Coupon    *********************/

const couponStatusChange = async (req, res, next) => {
    try {
        const { couponId, message }=req.body;
        const coupon = await Coupon.findById(couponId);

        if (message == 'couponDelete') {
            return next();
        };

        // Toggle the is_hide field

        coupon.is_hide = coupon.is_hide === 1 ? 0 : 1;
        await coupon.save();

        res.status(statusCode.OK).json({ message: responseMessage.SUCCESS });
    } catch (err) {
        console.error(err.message);
        res.status(statusCode.INTERNAL_SERVER_ERROR).json({ message: responseMessage.INTERNAL_SERVER_ERROR });
    }; 
};

/*****************      To Delete the Coupon    *********************/

const deleteCoupon = async (req, res) => {
    try {
        
        const { couponId } = req.body;

        const couponDeletionData = await Coupon.deleteOne({ _id: couponId });

        if (couponDeletionData) {
            res.status(statusCode.OK).json({ message: responseMessage.SUCCESS });
        } else {
            res.status(statusCode.INTERNAL_SERVER_ERROR).json({ message: responseMessage.FAILED });
        }
        
    } catch (error) {
        console.log(error.message);
    };
};


/*********************     
 * 
 * 
 * 
 * 
 *   User Side Controlllers
 * 
 * 
 * 
 * 
 *********************/

/*****************      To Apply the Coupon on Checkout Page    *********************/

const applyCoupon = async (req, res, next) => {
    try {
        const { couponCode, validMessage } = req.body;

        if (validMessage !== 'couponReqeust') {
            return next(); // Ensure that the function exits after calling next()
        }

        // Check if couponCode is provided
        if (couponCode === 'No Code') {
            return res.status(statusCode.BAD_REQUEST).json({ message: 'Coupon code is required' });
        }

        // Find the coupon by code
        const coupon = await Coupon.findOne({ coupon_code: couponCode });

        const cartData = await Cart.findOne({ user: req.session.user_id });

        const userData = await User.findOne({_id: req.session.user_id});
        
        const currentDate = Date.now();

        if (!coupon) {
            return res.status(statusCode.OK).json({ message: 'Wrong Coupon Code' });
        } else if (coupon.remaining_quantity <= 0) {
            return res.status(statusCode.OK).json({ message: 'Coupon quantity depleted' });
        } else if (coupon.end_Date <= currentDate) {
            return res.status(statusCode.OK).json({ message: 'Coupon expired' });
        } else if (cartData.total_price <= coupon.minimum_price) {
            return res.status(statusCode.OK).json({ message: 'Minimum purchase amount not met', minimumPurchaseAmount: coupon.minimum_price });
        } else {

            const couponClaimed = userData.coupon_claimed.some(couponM => couponM.couponId === coupon._id.toString());

            if (couponClaimed) {
                return res.status(statusCode.OK).json({ message: 'Coupon Claimed' });
            }  

            cartData.coupon_id = coupon._id;
            cartData.discount_amount = coupon.discount_price;
            cartData.coupon_claimed = 1;

            coupon.remaining_quantity -= 1;

            await coupon.save();
            const savedCart = await cartData.save();

            const discountAmountToTotal = savedCart.discount_amount;
            const totalAmountWithDiscount = savedCart.total_price - discountAmountToTotal;

            return res.status(statusCode.OK).json({ message: responseMessage.SUCCESS, discountAmountToTotal, totalAmountWithDiscount });
        }
        
    } catch (error) {
        console.log(error.message);
        return res.status(statusCode.INTERNAL_SERVER_ERROR).json({ message: responseMessage.INTERNAL_SERVER_ERROR });
    }
};

/*****************      To Remove the Coupon on Checkout Page    *********************/

const removeCoupon = async (req, res, next) => {
    try {
        const { validMessage } = req.body;

        if (validMessage !== 'couponRemovalMessage') {
            return next(); // Ensure that the function exits after calling next()
        }

        const cartData = await Cart.findOne({ user: req.session.user_id });

        if (!cartData) {
            return res.status(statusCode.NOT_FOUND).json({ message: 'Cart not found' }); // Handle case where cart is not found
        }

        const couponData = await Coupon.findById(cartData.coupon_id);

        if (!couponData) {
            return res.status(statusCode.NOT_FOUND).json({ message: 'Coupon not found' }); // Handle case where coupon is not found
        }

        cartData.discount_amount -= couponData.discount_price;
        cartData.coupon_claimed = 0;
        cartData.coupon_id = 'nothing';

        couponData.remaining_quantity += 1;

        await couponData.save();
        const savedCart = await cartData.save();

        const totalAmountWithDiscountValue = savedCart.total_price ;

        return res.status(statusCode.OK).json({ message: responseMessage.SUCCESS, totalAmountWithDiscountValue });

    } catch (error) {
        console.log(error.message);
        return res.status(statusCode.INTERNAL_SERVER_ERROR).json({ message: responseMessage.INTERNAL_SERVER_ERROR });
    }
};



module.exports = {
    // Admin Side
    loadCouponList,
    loadAddCoupon,
    insertCoupon,
    loadEditCoupon,
    updateCoupon,
    couponStatusChange,
    deleteCoupon,
    // User Side
    applyCoupon,
    removeCoupon,

};