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

// Requering the Controllers
const adminController = require('../controllers/adminController');
const categoryController = require('../controllers/categoryController');
const orderController = require('../controllers/orderController');
const productController = require('../controllers/productController');

// Requerung the Admin Auth
const adminAuth = require('../middlewares/adminAuth');

// Starting The Admin Routes
// Get Requests
admin_route.get('/', adminAuth.isLogin, adminController.loadAdminHome);
admin_route.get('/addproduct', adminAuth.isLogin, productController.loadAddProduct);
admin_route.get('/addproductPrice', adminAuth.isLogin, adminController.loadAddProductPrice);
admin_route.get('/addproductImages', adminAuth.isLogin, adminController.loadAddProductImages);
admin_route.get('/addproductRelatedproducts', adminAuth.isLogin, adminController.loadAddProductRelatedProducts);
admin_route.get('/productlist', adminAuth.isLogin, productController.loadProductList);
admin_route.get('/orderlist', adminAuth.isLogin, orderController.loadOrderList);
admin_route.get('/orderdetail', adminAuth.isLogin, orderController.loadOrderDetail)
admin_route.get('/userlist', adminAuth.isLogin, adminController.loadUserList);
admin_route.get('/categorylist', adminAuth.isLogin, categoryController.loadCategoryList);
admin_route.get('/login', adminAuth.isLogout, adminController.loadAdminLogin);
admin_route.get('/editcategory', adminAuth.isLogin, categoryController.loadEditCategory);
admin_route.get('/editproduct', adminAuth.isLogin, productController.loadEditProduct);
admin_route.get('/adminLogout', adminAuth.isLogin, adminController.adminLogout)

admin_route.get('/test', adminController.loadTesting);

// Post Requests
admin_route.post('/login', adminController.adminVerifyLogin);
admin_route.post('/userlist', adminController.blockAndActive2);
admin_route.post('/categorylist', adminController.activeOrInactive, categoryController.createCategory);
admin_route.post('/editcategory', categoryController.updateCategory);
admin_route.post('/addproduct', upload.array('image_1', 4), productController.insertProduct);
admin_route.post('/productlist', productController.activeOrInactive2);
admin_route.post('/editproduct', upload.array('image_1', 4), productController.updateProduct);
admin_route.post('/orderdetail', orderController.updateOrderStatus);
admin_route.post('/orderlist', orderController.deleteOrder);


// All Routes
admin_route.get('*', (req, res) => {
    res.redirect('/admin');
});

module.exports = admin_route;