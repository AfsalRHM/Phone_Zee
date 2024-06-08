const User = require('../models/userModel');
const Product = require('../models/productModel');
const Category = require('../models/categoryModel');
const Address = require('../models/addressModel');
const Wishlist = require('../models/wishlistModel');
const Cart = require('../models/cartModel');
const Order = require('../models/orderModel');
const Coupon = require('../models/couponModel');
const Wallet = require('../models/walletModel');


const crypto = require('crypto');
const Razorpay = require('razorpay');

const { parseISO, format } = require('date-fns');

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
        
        const page = parseInt(req.query.page) || 1; // Get the page number from the query parameters
        const limit = parseInt(req.query.limit) || 10; // Get the limit from the query parameters

        // Calculate the skip value based on the page number and limit
        const skip = (page - 1) * limit;

        // Fetch orders with pagination using skip and limit
        const orderData = await Order.find({})
                                      .populate('user')
                                      .populate('address')
                                      .populate('products.product')
                                      .skip(skip)
                                      .limit(limit);

        // Count total number of orders
        const totalOrders = await Order.countDocuments();

        // Calculate total pages
        const totalPages = Math.ceil(totalOrders / limit);

        // Construct pagination object
        const pagination = {
            currentPage: page,
            totalPages: totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1
        };

        res.render('ordersList', {activeOrderMessage: 'active', orders: orderData, pagination: pagination});

    } catch (error) {
        console.log(error.message);
    };
};

/*****************      To load the Order Details Page    *********************/

const loadOrderDetail = async (req, res) => {
    try {
        
        const orderId = req.query.orderId;

        const orderData = await Order.findById(orderId).populate('user').populate('address').populate('products.product');

        const date = orderData.created_at;

        // Parse and format the date using date-fns
        // const convertedDate = parseISO(date);
        
        const formatconvertedDate = format(date, "EEE, MMM dd, yyyy, h:mma");

        const pageOrderIdFull = orderData._id.toString();

        const pageOrderId = pageOrderIdFull.substring(0, 8);

        res.render('orderDetails', {activeOrderMessage: 'active', orderData: orderData, formatconvertedDate, pageOrderId});

    } catch (error) {
        console.log(error.message);
    };
};

/*****************      To Update the Order     *********************/

const updateOrderStatus = async (req, res) => {
    try {

        const { orderDataId, updatingStatus } = req.body
        const orderData = await Order.findOne({_id: orderDataId});

        if (!orderData) {
            return res.status(404).json({ message: 'Failed' });
        }

        // Toggle the is_blocked field
        // user.is_blocked = user.is_blocked === 0 ? 1 : 0;
        if (updatingStatus == 'confirmed') {
            orderData.order_status = 'Confirmed';
        } else if (updatingStatus == 'shipped') {
            orderData.order_status = 'Shipped';
        } else if (updatingStatus == 'delivered') {
            orderData.order_status = 'Delivered';   
        } else if (updatingStatus == 'pending') {
            orderData.order_status = 'Pending';
        };

        await orderData.save();

        res.status(200).json({ message: 'Success' });
        
    } catch (error) {
        console.log(error.message);
    };
};

/*****************      To Delete the Order     *********************/

const cancelOrderAdmin = async (req, res) => {
    try {

        const { OrderId } = req.body;

        const orderData = await Order.findOne({_id: OrderId});

        if ( orderData ) {

            orderData.order_status = 'cancelOrder';

            await orderData.save();

            res.status(200).json({ message: 'Success' });

        } else {
            res.status(500).json({ message: 'Order Not Found' });
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
                payment_status: paymentMethod == 'payment-cod' ? 'COD' : 'pending' ,
                order_status: 'Pending',    
                shipping_plan: 'Free-shipping',
                products: cartData.products,
                order_total: cartData.total_price - cartData.discount_amount,
                discount_price: cartData.discount_amount
            });
    
            if ( order.payment_type == 'payment-cod' ) {
    
                if (cartData.coupon_id !== 'nothing') {
                    userData.coupon_claimed.push({couponId: cartData.coupon_id});
                };
    
                await userData.save();
        
                await Cart.findByIdAndUpdate(cartData._id, { $pull: { products: { _id: { $in: cartData.products.map(p => p._id) } } }, $set: { total_price: 0, discount_amount: 0, coupon_claimed: 0, coupon_id: 'nothing' } });
        
                const OrderData = await order.save();

                if (OrderData) {
                    res.status(200).json({ message: 'Success', orderId: OrderData._id });
                } else {
                    res.status(500).json({ message: 'Failed' });
                };

            } else if ( order.payment_type == 'payment-razorpay' ) {

                try {

                    order.payment_status = 'pending';

                    const OrderData = await order.save();

                    const razorpayOrder = await razorpayInstance.orders.create({
                        amount: OrderData.order_total * 100, // Amount in smallest currency unit (e.g., paisa for INR)
                        currency: 'INR',
                        receipt: `receipt_${OrderData._id}`
                    });

                    await Cart.findByIdAndUpdate(cartData._id, { $pull: { products: { _id: { $in: cartData.products.map(p => p._id) } } }, $set: { total_price: 0, discount_amount: 0, coupon_claimed: 0, coupon_id: 'nothing' } });

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

            } else if ( order.payment_type == 'payment-wallet' ) {

                const walletBalance = userData.wallet_balance;

                if (order.order_total > walletBalance) {
                    res.status(200).json({ message: 'Not enough balance on wallet' });
                } else {

                    const wallet = new Wallet ({
                        user: req.session.user_id,
                        type_of_transaction: 'Withdrawal',
                        amount: order.order_total
                    });
    
                    userData.wallet_balance -= wallet.amount;

                    await userData.save();

                    await wallet.save();

                    order.payment_status = 'Paid';

                    const OrderData = await order.save();

                    if (OrderData) {
                        res.status(200).json({ message: 'Success', orderId: OrderData._id });
                    } else {
                        res.status(500).json({ message: 'Failed' });
                    };

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

        // Find the order in the database
        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Create a HMAC using the orderId and razorpayPaymentId
        const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_CLIENT_SECRET);
        hmac.update(`${razorpayOrderId}|${razorpayPaymentId}`);
        const generatedSignature = hmac.digest('hex');

        // Verify the payment signature
        if (generatedSignature === razorpaySignature) {
            // Payment is successful and verified
            order.payment_status = 'Paid';
            await order.save();

            res.status(200).json({ message: 'Success', orderId: order._id });
        } else {
            res.status(400).json({ message: 'Invalid signature' });
        }
    } catch (error) {
        console.error('Error confirming payment:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};





/*****************      To Delete a Order     *********************/

const cancelOrder = async (req, res) => {
    try {

        const { OrderId } = req.body;

        const userData = await User.findOne({_id: req.session.user_id});

        const orderData = await Order.findOne({_id: OrderId}).populate('products.product');

        if ( orderData ) {

            orderData.order_status = 'cancelOrder';

            console.log(orderData);

            orderData.products.forEach(async (item) => {

                await Product.findByIdAndUpdate(item.product._id, { $inc: { stock: item.quantity } });

            });

            if (orderData.payment_type == 'payment-razorpay' || orderData.payment_type == 'payment-wallet') {

                const wallet = new Wallet ({
                    user: req.session.user_id,
                    type_of_transaction: 'Deposit',
                    amount: orderData.order_total
                });

                userData.wallet_balance += wallet.amount;

                await wallet.save();
                await userData.save();

                res.status(200).json({ message: 'Success' });

            };

            await orderData.save();

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

/*****************      To Place the Order     *********************/

const loadOrderTrack = async (req, res) => {
    try {

        const { orderId } = req.query;
        
        const orderData = await Order.findOne({_id: orderId}).populate('user').populate('address').populate('products.product');

        console.log(orderData);

        const date = orderData.created_at;
        
        const formatconvertedDate = format(date, "MMM dd, yyyy");

        const pageOrderIdFull = orderData._id.toString();

        const pageOrderId = pageOrderIdFull.substring(0, 8);

        const cartDataForCount = await Cart.findOne({user: req.session.user_id}).populate('products');
        
        if (cartDataForCount == null) {
            res.render('orderTracking', { pageTitle: 'Order Tracking | PhoneZee', orderData, loginOrCart: req.session, cartItemsForCartCount: cartDataForCount, formatconvertedDate, pageOrderId });
        } else {
            res.render('orderTracking', { pageTitle: 'Order Tracking | PhoneZee', orderData, loginOrCart: req.session, cartItemsForCartCount: cartDataForCount.products, formatconvertedDate, pageOrderId });
        };

    } catch (error) {
        console.log(error.message);
    };
};

module.exports = {
    loadOrderList,
    loadOrderDetail,
    updateOrderStatus,
    cancelOrderAdmin,
    placeOrder,
    cancelOrder,
    loadOrderSuccess,
    confirmPayment,
    loadOrderTrack

};