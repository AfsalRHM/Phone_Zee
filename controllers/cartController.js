const User = require('../models/userModel');
const Product = require('../models/productModel');
const Category = require('../models/categoryModel');
const Address = require('../models/addressModel');
const Wishlist = require('../models/wishlistModel');
const Cart = require('../models/cartModel');
const Order = require('../models/orderModel');


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

        console.log(cartData)

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
            res.status(200).json({ message: 'Product out of stock' });
        } else {

            if (!existingCart) {

                if (product.stock < qty) {
                    res.status(200).json({ message: 'Not Enough Product' });
                } else {
    
                    if (!qty) {
    
                        const cart = new Cart({
                            user: req.session.user_id,
                            products: [{product: productId, quantity: 1, product_total: product.price}],
                            total_price: product.price
                        });
    
                        await cart.save();
            
                        res.status(200).json({ message: 'Success' });
    
                    } else {
    
                        const cart = new Cart({
                            user: req.session.user_id,
                            products: [{product: productId, quantity: qty, product_total: qty * product.price}],
                            total_price: qty * product.price
                        });
                
                        await cart.save();
                
                        res.status(200).json({ message: 'Success' });
    
                    };
    
                };
    
            } else {
    
                const existingProductOnCart = await Cart.findOne({user: req.session.user_id, 'products.product': productId});
    
                if (!existingProductOnCart) {
    
                    if (product.stock < qty) {
                        res.status(200).json({ message: 'Not Enough Product' });
                    } else {
        
                        if (!qty) {
    
                            const productTotal = product.price * 1;
    
                            existingCart.products.push({ product: productId, quantity: 1, product_total: productTotal });
    
                            existingCart.total_price += productTotal;
    
                            await existingCart.save();
                
                            res.status(200).json({ message: 'Success' });
        
                        } else {
                    
                            const productTotal = product.price * qty;
    
                            existingCart.products.push({ product: productId, quantity: qty, product_total: productTotal });
    
                            existingCart.total_price += productTotal;
        
                            await existingCart.save();
                
                            res.status(200).json({ message: 'Success' });
        
                        };
                    };
    
                } else {
                    res.status(200).json({ message: 'Already Exists' });
                }
                
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

            res.status(200).json({ message: 'Success' });

        }

    } catch (error) {
        console.log(error.message);
    };
};

/*****************      To update the Cart when the User changes the quantity     *********************/

const updateCart =  async (req, res) => {
    try {

        const { cartItemId, newQuantity } = req.body;
        
        const cartData = await Cart.findOne({user: req.session.user_id}).populate('products.product');

        const productToUpdate = cartData.products.find(product => product.product._id.equals(cartItemId));

        const TotalPrice = productToUpdate.product.price * newQuantity; 

        productToUpdate.quantity = newQuantity;
        productToUpdate.product_total = TotalPrice;

        const cartTotal = cartData.products.reduce((total, product) => total + product.product_total, 0);

        cartData.total_price = cartTotal;

        await cartData.save();
        
        res.status(200).json({ message: 'Success', totalPrice: TotalPrice, cartTotal:  cartTotal });

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