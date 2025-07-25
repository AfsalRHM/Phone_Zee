const User = require('../models/userModel');
const Product = require('../models/productModel');
const Category = require('../models/categoryModel');
const Address = require('../models/addressModel');
const Wishlist = require('../models/wishlistModel');
const Cart = require('../models/cartModel');
const Order = require('../models/orderModel');
const statusCode = require('../constants/statusCode');
const responseMessage = require('../constants/responseMessage');


/*****************      To load the Cart page     *********************/

const loadCart = async (req, res) => {
    try {

        let cartTotalPrice = 0;

        let cartData;

        const cart = await Cart.find({user: req.session.user_id});

        cartData = await Cart.findOne({user: req.session.user_id}).populate('products.product');

        const cartDataForCount = await Cart.findOne({user: req.session.user_id}).populate('products');
        
        if (cartData && cartData.products) {
            for (let i = 0; i < cartData.products.length; i++) {
                cartTotalPrice += cartData.products[i].product.price * cartData.products[i].quantity;
            };
        };

        if (cartDataForCount == null) {
            res.render('cart', {pageTitle: 'My cart | PhoneZee', loginOrCart: req.session, cartItems: cartData, cartTotalPrice: cartTotalPrice, cartItemsForCartCount: cartDataForCount })
        } else {
            res.render('cart', {pageTitle: 'My cart | PhoneZee', loginOrCart: req.session, cartItems: cartData, cartTotalPrice: cartTotalPrice, cartItemsForCartCount: cartDataForCount.products })
        };

    } catch (error) {
        console.log(error.message);
    };
};

/*****************      To Add Product to Cart     *********************/

const addToCart = async (req, res) => {
    try {

        const {productId, qty} = req.body;
        
        const product = await Product.findById(productId);

        const existingCart = await Cart.findOne({user: req.session.user_id});

        if (!product) {
            return next();
        };

        if (product.stock == 0) {
            res.status(statusCode.OK).json({ message: 'Product out of stock' });
        } else {

            if (!existingCart) {

                if (product.stock < qty) {
                    res.status(statusCode.OK).json({ message: 'Not Enough Product' });
                } else {
    
                    if (!qty) {

                        if (product.offer !== 0) {

                            const cart = new Cart({
                                user: req.session.user_id,
                                products: [{product: productId, quantity: 1, product_total: product.salePrice}],
                                total_price: product.salePrice
                            });

                            await cart.save();
            
                            res.status(statusCode.OK).json({ message: responseMessage.SUCCESS });

                        } else {

                            const cart = new Cart({
                                user: req.session.user_id,
                                products: [{product: productId, quantity: 1, product_total: product.price}],
                                total_price: product.price
                            });

                            await cart.save();
            
                            res.status(statusCode.OK).json({ message: responseMessage.SUCCESS });

                        };
    
                    } else {

                        if (product.offer !== 0) {

                            const cart = new Cart({
                                user: req.session.user_id,
                                products: [{product: productId, quantity: qty, product_total: qty * product.salePrice}],
                                total_price: qty * product.salePrice
                            });
                    
                            await cart.save();
                    
                            res.status(statusCode.OK).json({ message: responseMessage.SUCCESS });

                        } else {

                            const cart = new Cart({
                                user: req.session.user_id,
                                products: [{product: productId, quantity: qty, product_total: qty * product.price}],
                                total_price: qty * product.price
                            });
                    
                            await cart.save();
                    
                            res.status(statusCode.OK).json({ message: responseMessage.SUCCESS });

                        };
    
                    };
    
                };
    
            } else {
    
                const existingProductOnCart = await Cart.findOne({user: req.session.user_id, 'products.product': productId});
    
                if (!existingProductOnCart) {
    
                    if (product.stock < qty) {
                        res.status(statusCode.OK).json({ message: 'Not Enough Product' });
                    } else {
        
                        if (!qty) {

                            if (product.offer !== 0) {

                                const productTotal = product.salePrice * 1;
    
                                existingCart.products.push({ product: productId, quantity: 1, product_total: productTotal });
        
                                existingCart.total_price += productTotal;
        
                                await existingCart.save();
                    
                                res.status(statusCode.OK).json({ message: responseMessage.SUCCESS });
    
                            } else {
    
                                const productTotal = product.price * 1;
    
                                existingCart.products.push({ product: productId, quantity: 1, product_total: productTotal });
        
                                existingCart.total_price += productTotal;
        
                                await existingCart.save();
                    
                                res.status(statusCode.OK).json({ message: responseMessage.SUCCESS });
    
                            };
        
                        } else {

                            if (product.offer !== 0) {

                                const productTotal = product.salePrice * qty;
    
                                existingCart.products.push({ product: productId, quantity: qty, product_total: productTotal });
        
                                existingCart.total_price += productTotal;
            
                                await existingCart.save();
                    
                                res.status(statusCode.OK).json({ message: responseMessage.SUCCESS });
    
                            } else {
    
                                const productTotal = product.price * qty;
    
                                existingCart.products.push({ product: productId, quantity: qty, product_total: productTotal });
        
                                existingCart.total_price += productTotal;
            
                                await existingCart.save();
                    
                                res.status(statusCode.OK).json({ message: responseMessage.SUCCESS });
    
                            };
        
                        };
                    };
    
                } else {
                    res.status(statusCode.OK).json({ message: 'Already Exists' });
                };
                
            };

        }

    } catch (error) {
        console.log(error.message);
    };
};

/*****************      To Delete Product from the cart     *********************/

const deleteProductFromCart = async (req, res, next) => {
    try {

        const { cartItemId, check } = req.body;

        const cartData = await Cart.findOne({user: req.session.user_id}).populate('products');

        const product = await Product.findOne({_id: cartItemId});

        if (check != 'deleteProduct') {
            next()
        } else {

            const productToRemove = cartData.products.find(product => product.product._id.equals(cartItemId));

            const updatedTotalPrice = cartData.total_price - productToRemove.product_total;

            await cartData.updateOne({ $pull: { products: { product: cartItemId } }, total_price: updatedTotalPrice});

            res.status(statusCode.OK).json({ message: responseMessage.SUCCESS });

        }

    } catch (error) {
        console.log(error.message);
    };
};

/*****************      To update the Cart when the User changes the quantity     *********************/

const updateCart =  async (req, res) => {
    try {

        let TotalPrice = 0;

        const { cartItemId, newQuantity } = req.body;
        
        const cartData = await Cart.findOne({user: req.session.user_id}).populate('products.product');

        const productToUpdate = cartData.products.find(product => product.product._id.equals(cartItemId));

        if (productToUpdate.product.offer == 1) {

            TotalPrice = productToUpdate.product.salePrice * newQuantity; 

            if (newQuantity > productToUpdate.product.stock ) {
                res.status(statusCode.OK).json({ message: 'out of stock'});
            } else {

                productToUpdate.quantity = newQuantity;
                productToUpdate.product_total = TotalPrice;
    
                const cartTotal = cartData.products.reduce((total, product) => total + product.product_total, 0);
    
                cartData.total_price = cartTotal;
    
                await cartData.save();
                
                res.status(statusCode.OK).json({ message: responseMessage.SUCCESS, totalPrice: TotalPrice, cartTotal:  cartTotal });

            };

        } else if (productToUpdate.product.offer == 0) {

            TotalPrice = productToUpdate.product.price * newQuantity; 

            if (newQuantity > productToUpdate.product.stock ) {
                res.status(statusCode.OK).json({ message: 'out of stock' , quantity: productToUpdate.quantity});
            } else {

                productToUpdate.quantity = newQuantity;
                productToUpdate.product_total = TotalPrice;

                const cartTotal = cartData.products.reduce((total, product) => total + product.product_total, 0);

                cartData.total_price = cartTotal;

                await cartData.save();
                
                res.status(statusCode.OK).json({ message: responseMessage.SUCCESS, totalPrice: TotalPrice, cartTotal:  cartTotal });

            }

        };

    } catch (error) {
        console.log(error.message);
    };
};

module.exports = {
    loadCart,
    addToCart,
    deleteProductFromCart,
    updateCart
};