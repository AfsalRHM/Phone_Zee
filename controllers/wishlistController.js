const User = require('../models/userModel');
const Product = require('../models/productModel');
const Category = require('../models/categoryModel');
const Address = require('../models/addressModel');
const Wishlist = require('../models/wishlistModel');
const Cart = require('../models/cartModel');
const Order = require('../models/orderModel');


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

/*****************      To load the Favourite page     *********************/

const loadWishlist = async (req, res) => {
    try {

        const wishlistData = await Wishlist.find({user: req.session.user_id}).populate('product');

        const cartDataForCount = await Cart.findOne({user: req.session.user_id}).populate('products');
        
        res.render('wishlist', {pageTitle: 'wishlist | PhoneZee', loginOrCart: req.session, wishlistItems: wishlistData, cartItemsForCartCount: cartDataForCount.products });

    } catch (error) {
        console.log(error.message);
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

module.exports = {
    loadWishlist,
    addToWishlist,
    deleteProductFromWishlist
};