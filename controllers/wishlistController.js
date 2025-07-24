const User = require('../models/userModel');
const Product = require('../models/productModel');
const Category = require('../models/categoryModel');
const Address = require('../models/addressModel');
const Wishlist = require('../models/wishlistModel');
const Cart = require('../models/cartModel');
const Order = require('../models/orderModel');
const statusCode = require('../constants/statusCode');
const responseMessage = require('../constants/responseMessage');


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
        
        if (cartDataForCount == null) {
            res.render('wishlist', {pageTitle: 'wishlist | PhoneZee', loginOrCart: req.session, wishlistItems: wishlistData, cartItemsForCartCount: cartDataForCount });
        } else {
            res.render('wishlist', {pageTitle: 'wishlist | PhoneZee', loginOrCart: req.session, wishlistItems: wishlistData, cartItemsForCartCount: cartDataForCount.products });
        };

    } catch (error) {
        console.log(error.message);
    };
};

/*****************      To add product to Wishlist     *********************/

const addToWishlist = async (req, res) => {
    try {
        const { productId } = req.body;

        const product = await Product.findById(productId);

        const cartExist = await Cart.findOne({user: req.session.user_id, 'products.product': productId});

        if (cartExist != null) {
            res.status(statusCode.OK).json({ message: 'Product Exist In Cart' });
        } else if (cartExist == null) {
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
        
                res.status(statusCode.OK).json({ message: responseMessage.SUCCESS });
    
            } else {
                res.status(statusCode.OK).json({ message: 'Already Exists' });
            }
        };

    } catch (err) {
        console.error(err.message);
        res.status(statusCode.INTERNAL_SERVER_ERROR).json({ message: responseMessage.INTERNAL_SERVER_ERROR });
    };
};

/*****************      To Delete a Product from wislist     *********************/

const deleteProductFromWishlist = async (req, res) => {
    try {

        const { wislistItemId } = req.body;

        await Wishlist.deleteOne({_id: wislistItemId}); 

        res.status(statusCode.OK).json({ message: responseMessage.SUCCESS });

    } catch (error) {
        console.log(error.message);
    };
};

module.exports = {
    loadWishlist,
    addToWishlist,
    deleteProductFromWishlist
};