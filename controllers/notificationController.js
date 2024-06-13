const User = require('../models/userModel');
const Product = require('../models/productModel');
const Category = require('../models/categoryModel');
const Address = require('../models/addressModel');
const Wishlist = require('../models/wishlistModel');
const Cart = require('../models/cartModel');
const Order = require('../models/orderModel');
const Coupon = require('../models/couponModel');
const Wallet = require('../models/walletModel');
const Notification = require('../models/notificationModel');


const { parseISO, format } = require('date-fns');



/*****************      To load the Notification list     *********************/

const loadNotificationList = async(req, res) => {
    try {

        const notificationDate = [];

        const notificationData  = await Notification.find({matter: 'returnOrderRequest'}).populate('orderId').populate('from');

        for (let i = 0; i < notificationData.length; i++) {

            const date = notificationData[i].created_at;

            notificationDate[i] = format(date, "MMM dd, yyyy");

        };

        res.render('notificationPage', { notificationData, notificationDate });
        
    } catch (error) {
        console.log(error.message);
    };
};

/*****************      To accept the notifications     *********************/

const acceptNotification = async(req, res) => {
    try {

        const { notificationId } = req.body;

        const notificationData = await Notification.findOne({_id: notificationId});

        const orderData = await Order.findOne({_id: notificationData.orderId});

        const userData = await User.findOne({_id: orderData.user});

        orderData.returnStatus = 'accepted';
        orderData.order_status = 'returnOrder';

        if (orderData.payment_type == 'payment-razorpay' || orderData.payment_type == 'payment-wallet') {

            const wallet = new Wallet({
                user: orderData.user,
                type_of_transaction: 'Deposit',
                amount: orderData.order_total
            });

            userData.wallet_balance += wallet.amount;

            await userData.save();

            await wallet.save();

        };

        notificationData.matter = 'returnOrderAccepted';

        await orderData.save();

        await notificationData.save();

        res.status(200).json({ message: 'return order Accepted' })
        
    } catch (error) {
        console.log(error.message);
    };
};

/*****************      To reject the notifications     *********************/

const denyNotification = async(req, res) => {
    try {

        const { notificationId } = req.body;

        const notificationData = await Notification.findOne({_id: notificationId});

        const orderData = await Order.findOne({_id: notificationData.orderId});

        orderData.returnStatus = 'rejected';

        notificationData.matter = 'returnOrderRejected';

        await orderData.save();

        await notificationData.save();

        res.status(200).json({ message: 'return order Accepted' })
        
    } catch (error) {
        console.log(error.message);
    };
};


module.exports = {
    loadNotificationList,
    acceptNotification,
    denyNotification
};