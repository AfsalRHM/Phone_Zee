const User = require('../models/userModel');
const Product = require('../models/productModel');
const Category = require('../models/categoryModel');
const Address = require('../models/addressModel');
const Wishlist = require('../models/wishlistModel');
const Cart = require('../models/cartModel');
const Order = require('../models/orderModel');
const Coupon = require('../models/couponModel');


const Razorpay = require('razorpay');

const razorpayInstance = new Razorpay({ 
  
    key_id: process.env.RAZORPAY_CLIENT_ID, 
    key_secret: process.env.RAZORPAY_CLIENT_SECRET 

}); 

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

/*****************      To load the Order list Page    *********************/

const loadOrderList = async (req, res) => {
    try {
        
        const orderData = await Order.find({}).populate('user').populate('address').populate('products.product');
        res.render('ordersList', {activeOrderMessage: 'active', orders: orderData});

    } catch (error) {
        console.log(error.message);
    };
};

/*****************      To load the Order Details Page    *********************/

const loadOrderDetail = async (req, res) => {
    try {
        
        const orderId = req.query.orderId;

        const orderData = await Order.findById(orderId).populate('user').populate('address').populate('products.product');

        res.render('orderDetails', {activeOrderMessage: 'active', orderData: orderData});

    } catch (error) {
        console.log(error.message);
    };
};

/*****************      To Update the Order     *********************/

const updateOrderStatus = async (req, res) => {
    try {

        const { orderId, updatingStatus } = req.body
        const orderData = await Order.findOne(orderId);

        if (!orderData) {
            return res.status(404).json({ message: 'Failed' });
        }

        // Toggle the is_blocked field
        // user.is_blocked = user.is_blocked === 0 ? 1 : 0;
        if (updatingStatus == 'paymentDelay') {
            orderData.order_status = 'paymentDelay';
        } else if (updatingStatus == 'confirmed') {
            orderData.order_status = 'confirmed';
        } else if (updatingStatus == 'shipped') {
            orderData.order_status = 'shipped';
        } else if (updatingStatus == 'delivered') {
            orderData.order_status = 'delivered';
        } else if (updatingStatus == 'cancelOrder') {
            orderData.order_status = 'cancelOrder';
        }

        await orderData.save();

        res.status(200).json({ message: 'Success' });
        
    } catch (error) {
        console.log(error.message);
    };
};

/*****************      To Delete the Order     *********************/

const deleteOrderAdmin = async (req, res) => {
    try {

        const { orderId } = req.body;

        const orderDeletionData = await Order.deleteOne({ _id: orderId });

        if (orderDeletionData) {
            res.status(200).json({ message: 'Success' });
        } else {
            res.status(500).json({ message: 'Failed' });
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

/*****************      To Place the Order     *********************/

const placeOrder = async (req, res) => {
    try {

        const cartData = await Cart.findOne({user: req.session.user_id});

        const userData = await User.findOne({_id: req.session.user_id});

        const orderExists = await Order.findOne({user: req.session.user_id, products: cartData.products.product});

        const length = cartData.products.length;

        for (let i = 0; i < length; i++) {
            const productId = cartData.products[i].product._id;
            const quantity = cartData.products[i].quantity;
        
            try {
                let product = await Product.findByIdAndUpdate(
                    { _id: productId },
                    { $inc: { stock: -quantity } }
                );
            } catch (error) {
                console.error("Error updating product:", error);
            }
        }

        if (!orderExists) {
            const { addressId, paymentMethod } = req.body;

            const addressData = await Address.find({user: req.session.user_id});

            const order = new Order ({
                user: req.session.user_id,
                address: addressData[userData.address]._id,
                payment_type: paymentMethod,
                payment_status: paymentMethod == 'payment-cod' ? 'pending' : 'COD' ,
                order_status: 'Pending',    
                shipping_plan: 'Free-shipping',
                products: cartData.products,
                order_total: cartData.total_price - cartData.discount_amount,
                discount_price: cartData.discount_amount
            });
    
            const OrderData = await order.save();

            if ( OrderData.payment_type == 'payment-cod' ) {
    
                userData.coupon_claimed.push({couponId: cartData.coupon_id});
    
                await userData.save();
        
                await Cart.findByIdAndUpdate(cartData._id, { $pull: { products: { _id: { $in: cartData.products.map(p => p._id) } } }, $set: { total_price: 0, discount_amount: 0, coupon_claimed: 0, coupon_id: 'nothing' } });
        
                if (OrderData) {
                    res.status(200).json({ message: 'Success', orderId: OrderData._id });
                } else {
                    res.status(500).json({ message: 'Failed' });
                };

            } else if ( OrderData.payment_type == 'payment-razorpay' ) {

                try {

                    const razorpayOrder = await razorpayInstance.orders.create({
                        amount: OrderData.order_total * 100, // Amount in smallest currency unit (e.g., paisa for INR)
                        currency: 'INR',
                        receipt: `receipt_${OrderData._id}`
                    });

                    return res.status(200).json({
                        message: 'Razorpay order created',
                        razorpayOrderId: razorpayOrder.id,
                        userName: userData.name,
                        orderId: OrderData._id,
                        amount: OrderData.order_total,
                        currency: 'INR',
                        key: process.env.RAZORPAY_KEY_ID
                    });

                } catch (err) {
                    console.error('Error creating Razorpay order:', err);
                    return res.status(500).send(err);
                };

            } else {
                res.status(200).json({ message: 'Payment Method not Available' });
            };

        } else {
            res.status(200).json({ message: 'Order Already Exists' });
        };
        
    } catch (error) {
        console.log(error.message);
    };
};

const confirmPayment = async (req, res) => {
    try {
        const { orderId, razorpayPaymentId, razorpayOrderId, razorpaySignature } = req.body;

        // Verify payment signature here (not shown for simplicity)

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Update order status to 'Paid'
        order.payment_status = 'Paid';
        await order.save();

        res.status(200).json({ message: 'Success', orderId: order._id });
    } catch (error) {
        console.error('Error confirming payment:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};






/*****************      To Delete a Order     *********************/

const deleteOrder = async (req, res) => {
    try {

        const { OrderId } = req.body;

        const orderData = await Order.findOne({_id: OrderId});

        if ( orderData ) {

            await Order.deleteOne({_id: OrderId});
            res.status(200).json({ message: 'Success' });

        } else {
            res.status(500).json({ message: 'Order Not Found' });
        }

    } catch (error) {
        console.log(error.message);
    };
};

const loadOrderSuccess = async (req, res) => {
    try {

        let totalQuantity = 0;

        const orderId = req.query.id;

        const orderData = await Order.findOne({_id: orderId});

        for (let i = 0; i < orderData.products.length; i++) {
            totalQuantity += orderData.products[i].quantity;
        };

        const cartDataForCount = await Cart.findOne({user: req.session.user_id}).populate('products');
        
        if (cartDataForCount == null) {
            res.render('orderSuccessPage', { pageTitle: 'Order Success | PhoneZee', loginOrCart: req.session, order: orderData, totalQuantity: totalQuantity, cartItemsForCartCount: cartDataForCount })
        } else {
            res.render('orderSuccessPage', { pageTitle: 'Order Success | PhoneZee', loginOrCart: req.session, order: orderData, totalQuantity: totalQuantity, cartItemsForCartCount: cartDataForCount.products })
        };
        
    } catch (error) {
        console.log(error.message);
    }
};

module.exports = {
    loadOrderList,
    loadOrderDetail,
    updateOrderStatus,
    deleteOrderAdmin,
    placeOrder,
    deleteOrder,
    loadOrderSuccess,
    confirmPayment
};