const User = require('../models/userModel');
const Product = require('../models/productModel');
const Category = require('../models/categoryModel');
const Address = require('../models/addressModel');
const Wishlist = require('../models/wishlistModel');
const Cart = require('../models/cartModel');
const Order = require('../models/orderModel');


/*****************      To load the Add Address page     *********************/

const loadAddAddress = async (req, res) => {
    try {

        const addressData = await Address.find({user: req.session.user_id});
        const userData = await User.findOne({_id: req.session.user_id});
        const cartDataForCount = await Cart.findOne({user: req.session.user_id}).populate('products');

        if (addressData.length < 5) {

            if (cartDataForCount == null) {
                res.render('addAddress', {pageTitle: 'PhoneZee | Add new Address', loginOrCart: req.session, cartItemsForCartCount: cartDataForCount });
            } else {
                res.render('addAddress', {pageTitle: 'PhoneZee | Add new Address', loginOrCart: req.session, cartItemsForCartCount: cartDataForCount.products });
            };

        } else {
            if (cartDataForCount == null) {
                res.render('profile#tab-address', {addressPageMessage: 'Maximum Address Added', loginOrCart: req.session, user: userData, address: addressData, cartItemsForCartCount: cartDataForCount });
            } else {
                res.render('profile#tab-address', {addressPageMessage: 'Maximum Address Added', loginOrCart: req.session, user: userData, address: addressData, cartItemsForCartCount: cartDataForCount.products });
            };
        };

    } catch (error) {
        console.log(error.message);
    };
};

/*****************      To Insert the Address     *********************/

const insertAddress = async (req, res) => {
    try {

        const cartDataForCount = await Cart.findOne({user: req.session.user_id}).populate('products');

        const queryData = req.query.from;

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
            res.render('addAddress', {pageTitle: 'PhoneZee | Add new Address', loginOrCart: req.session, errorMessage: 'Please Enter You Name', cartItemsForCartCount: cartDataForCount.products  });
        } else if (req.body.mobileNumber.length != 10 ) {
            return res.render('addAddress', {pageTitle: 'PhoneZee | Add new Address', loginOrCart: req.session, errorMessage: 'Please Enter a Valid Mobile Number', cartItemsForCartCount: cartDataForCount.products  });
        } else if (req.body.pincode.length != 6 ) {
            return res.render('addAddress', {pageTitle: 'PhoneZee | Add new Address', loginOrCart: req.session, errorMessage: 'Please Enter a Valid Pincode', cartItemsForCartCount: cartDataForCount.products  });
        } else if (!address.locality.trim() ) {
            return res.render('addAddress', {pageTitle: 'PhoneZee | Add new Address', loginOrCart: req.session, errorMessage: 'Please Enter Locality', cartItemsForCartCount: cartDataForCount.products  });
        } else if (!address.city.trim() ) {
            return res.render('addAddress', {pageTitle: 'PhoneZee | Add new Address', loginOrCart: req.session, errorMessage: 'Please Enter City', cartItemsForCartCount: cartDataForCount.products  });
        } else if (!address.state.trim() ) {
            return res.render('addAddress', {pageTitle: 'PhoneZee | Add new Address', loginOrCart: req.session, errorMessage: 'Please Enter State', cartItemsForCartCount: cartDataForCount.products  });
        } else {

            await address.save();

            if (!queryData) {
                res.redirect('/profile');
            } else if (queryData == 'CP') {
                res.redirect('/checkout');
            };

        };

    } catch (error) {
        console.log(error.message);
    };
};

/*****************      To Load Edit Address Page      *********************/

const loadEditAddress =  async (req, res) => {
    try {

        const addressId = req.query.id;

        const addressData = await Address.findById({_id: addressId});

        const cartDataForCount = await Cart.findOne({user: req.session.user_id}).populate('products');

        res.render('editAddress', {pageTitle: 'PhoneZee | Edit Your Address', loginOrCart: req.session, address: addressData, cartItemsForCartCount: cartDataForCount.products });

    } catch (error) {
        console.log(error.message);
    };
};

/*****************      To Update Address       *********************/

const updateAddress =  async (req, res) => {
    try {

        const cartDataForCount = await Cart.findOne({user: req.session.user_id}).populate('products');

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
            res.render('editAddress', {pageTitle: 'PhoneZee | Edit Your Address', loginOrCart: req.session, errorMessage: 'Please Enter You Name', address: addressData, cartItemsForCartCount: cartDataForCount.products });
        } else if (req.body.mobileNumber.length != 10 ) {
            res.render('editAddress', {pageTitle: 'PhoneZee | Edit Your Address', loginOrCart: req.session, errorMessage: 'Please Enter a Valid Mobile Number', address: addressData, cartItemsForCartCount: cartDataForCount.products });
        } else if (req.body.pincode.length != 6 ) {
            res.render('editAddress', {pageTitle: 'PhoneZee | Edit Your Address', loginOrCart: req.session, errorMessage: 'Please Enter a Valid Pincode', address: addressData, cartItemsForCartCount: cartDataForCount.products });
        } else if (!address.locality.trim() ) {
            res.render('editAddress', {pageTitle: 'PhoneZee | Edit Your Address', loginOrCart: req.session, errorMessage: 'Please Enter Locality', address: addressData, cartItemsForCartCount: cartDataForCount.products });
        } else if (!address.city.trim() ) {
            res.render('editAddress', {pageTitle: 'PhoneZee | Edit Your Address', loginOrCart: req.session, errorMessage: 'Please Enter City', address: addressData, cartItemsForCartCount: cartDataForCount.products });
        } else if (!address.state.trim() ) {
            res.render('editAddress', {pageTitle: 'PhoneZee | Edit Your Address', loginOrCart: req.session, errorMessage: 'Please Enter State', address: addressData, cartItemsForCartCount: cartDataForCount.products });
        } else {

            const addressAdded = await Address.findByIdAndUpdate(addressId, address, { new: true });

            if (addressAdded) {

                if (req.query.from == 'CP') {
                    res.redirect('/checkout');
                } else {
                    res.redirect('/profile');
                }

            } else {
                res.render('editAddress', {pageTitle: 'PhoneZee | Edit Your Address', loginOrCart: req.session, errorMessage: 'Address Not Updated', address: addressData, cartItemsForCartCount: cartDataForCount.products });
            }


        };

    } catch (error) {
        console.log(error.message);
    };
};

/*****************      To delete a address     *********************/

const deleteAddress = async (req, res, next) => {
    try {
        const { addressId }=req.body;
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

/*****************      To Cahnge the address     *********************/

const addressChange =  async (req, res, next) => {
    try {
        // Use findById to get a single document
        const userData = await User.findById(req.session.user_id);

        const { addressId } = req.body;
        const addressData = await Address.find({ user: req.session.user_id });

        let addressFound = false;

        for (let i = 0; i < addressData.length; i++) {
            if (addressData[i]._id.toString() === addressId) { // Ensure IDs are compared correctly
                userData.address = i;
                console.log('Address Match');
                await userData.save();
                addressFound = true;
                break;
            } else {
                console.log('Address not found');
            };
        };

        if (!addressFound) {
            return res.status(404).json({ message: 'Address not found' });
        };

        res.status(200).json({ message: 'Success' });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }; 
};


module.exports = {
    loadAddAddress,
    insertAddress,
    loadEditAddress,
    updateAddress,
    deleteAddress,
    addressChange
};