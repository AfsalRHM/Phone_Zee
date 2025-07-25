const express = require('express');
const admin_route = express();

const multer = require('multer');

const path = require('path');

const session = require('express-session');

admin_route.use(session({
    secret: 'seceretKey',
}));

admin_route.set('view engine', 'ejs');
admin_route.set('views', './views/adminPages');

const bodyParser = require('body-parser');

admin_route.use(bodyParser.json());
admin_route.use(bodyParser.urlencoded({extended: true}));

// Using Multer
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, path.join(__dirname, '../public/assets/images/productImages'));
    },
    filename: function(req, file, cb) {
        const name = Date.now() + '-' + file.originalname;
        cb(null, name);
    }
});

const upload = multer({storage: storage});

// Requering paginaton middleware
const paginate = require('../middlewares/pagination');

// Models for implementing pagination
const User = require('../models/userModel');
const Order = require('../models/orderModel');
const Product = require('../models/productModel');
const Coupon = require('../models/couponModel');

const Notifications = require('../models/notificationModel');

admin_route.use(async (req, res, next) => {
    try {
        const adminNotificationsCount = await Notifications.find({ matter: 'returnOrderRequest' }).countDocuments();
        res.locals.adminNotifications = adminNotificationsCount;
        next();
    } catch (error) {
        console.log(error.message);
    };
});

// Requering the Controllers
const adminController = require('../controllers/adminController');
const categoryController = require('../controllers/categoryController');
const orderController = require('../controllers/orderController');
const productController = require('../controllers/productController');
const couponController =  require('../controllers/couponController');
const offerController = require('../controllers/offerController');
const statisticsController = require('../controllers/statisticsController');
const notificationController = require('../controllers/notificationController');

// Requerung the Admin Auth
const adminAuth = require('../middlewares/adminAuth');

// Starting The Admin Routes
// Get Requests
admin_route.get('/', adminAuth.isLogin, adminController.loadAdminHome);
admin_route.get('/addproduct', adminAuth.isLogin, productController.loadAddProduct);
admin_route.get('/addproductPrice', adminAuth.isLogin, adminController.loadAddProductPrice);
admin_route.get('/addproductImages', adminAuth.isLogin, adminController.loadAddProductImages);
admin_route.get('/addproductRelatedproducts', adminAuth.isLogin, adminController.loadAddProductRelatedProducts);
admin_route.get('/productlist', adminAuth.isLogin, paginate(Product), productController.loadProductList);
admin_route.get('/orderlist', adminAuth.isLogin, paginate(Order), orderController.loadOrderList);
admin_route.get('/orderdetail', adminAuth.isLogin, orderController.loadOrderDetail)
admin_route.get('/userlist', adminAuth.isLogin, paginate(User), adminController.loadUserList);
admin_route.get('/categorylist', adminAuth.isLogin, categoryController.loadCategoryList);
admin_route.get('/login', adminAuth.isLogout, adminController.loadAdminLogin);
admin_route.get('/editcategory', adminAuth.isLogin, categoryController.loadEditCategory);
admin_route.get('/editproduct', adminAuth.isLogin, productController.loadEditProduct);
admin_route.get('/couponlist', adminAuth.isLogin, paginate(Coupon), couponController.loadCouponList);
admin_route.get('/addcoupon', adminAuth.isLogin, couponController.loadAddCoupon);
admin_route.get('/editcoupon', adminAuth.isLogin, couponController.loadEditCoupon);
admin_route.get('/productofferlist', adminAuth.isLogin, offerController.loadProductOfferList);
admin_route.get('/categoryofferlist', adminAuth.isLogin, offerController.loadCategoryOfferList);
admin_route.get('/addoffer', adminAuth.isLogin, offerController.loadAddOffer);
admin_route.get('/editoffer', adminAuth.isLogin, offerController.loadEditOffer);
admin_route.get('/salestatistics', adminAuth.isLogin, statisticsController.loadStatistics);
admin_route.get('/notifications', adminAuth.isLogin, notificationController.loadNotificationList);
admin_route.get('/adminLogout', adminAuth.isLogin, adminController.adminLogout);

admin_route.get('/sales-data', statisticsController.adminDataChart);

admin_route.get('/test', adminController.loadTesting);

// Post Requests
admin_route.post('/login', adminController.adminVerifyLogin);
admin_route.post('/userlist', adminAuth.isLogin, adminController.blockAndActive2);
admin_route.post('/categorylist', adminAuth.isLogin, adminController.activeOrInactive, categoryController.createCategory);
admin_route.post('/editcategory', adminAuth.isLogin, categoryController.updateCategory);
admin_route.post('/addproduct', adminAuth.isLogin, upload.array('image_1', 4), productController.insertProduct);
admin_route.post('/productlist', adminAuth.isLogin, productController.activeOrInactive2);
admin_route.post('/editproduct', adminAuth.isLogin, upload.array('image_1', 4), productController.updateProduct);
admin_route.post("/product/:id/delete-image", adminAuth.isLogin, productController.deleteImage)
admin_route.post('/orderdetail', adminAuth.isLogin, orderController.updateOrderStatus);
admin_route.post('/cancelOrderAdmin', adminAuth.isLogin, orderController.cancelOrderAdmin);
admin_route.post('/orderlist', adminAuth.isLogin, orderController.cancelOrder);
admin_route.post('/couponlist', adminAuth.isLogin, couponController.couponStatusChange, couponController.deleteCoupon);
admin_route.post('/addCoupon', adminAuth.isLogin, paginate(Coupon), couponController.insertCoupon);
admin_route.post('/editcoupon', adminAuth.isLogin, couponController.updateCoupon);
admin_route.post('/addoffer', adminAuth.isLogin, offerController.createOffer);
admin_route.post('/editoffer', adminAuth.isLogin, offerController.updateOffer);
admin_route.post('/productofferlist', adminAuth.isLogin, offerController.switchProductOfferStatus, offerController.deleteProductOffer);
admin_route.post('/categoryofferlist', adminAuth.isLogin, offerController.switchCategoryOfferStatus,  offerController.deleteCategoryOffer);
admin_route.post('/salestatistics', adminAuth.isLogin, statisticsController.filterReports);
admin_route.post('/sales-report/download', adminAuth.isLogin, statisticsController.downloadSalesReport);
admin_route.post('/sales-report/download-csv', adminAuth.isLogin, statisticsController.downloadSalesCSV);
admin_route.post('/acceptnotification', adminAuth.isLogin, notificationController.acceptNotification);
admin_route.post('/denynotification', adminAuth.isLogin, notificationController.denyNotification);


module.exports = admin_route;