const Admin = require('../models/adminModel');
const User = require('../models/userModel');
const Product = require('../models/productModel');
const Category = require('../models/categoryModel');
const Address = require('../models/addressModel');
const Wishlist = require('../models/wishlistModel');
const Cart = require('../models/cartModel');
const Order = require('../models/orderModel');

const bcrypt = require('bcrypt');

const loadAdminHome = async (req, res) => {
    try {

        // Just for pushing to git
        
        const productData = await Product.find({is_hide: 0});
        const categoryData = await Category.find({is_hide: 0});
        const OrderData = await Order.find({ order_status: { $nin: 'cancelOrder' }  });
        res.render('adminDashboard', {activeDashboardMessage: 'active', product: productData, categories: categoryData, orders: OrderData })

    } catch (error) {
        console.log(error.message);
    };
};

const loadAddProductPrice = async (req, res) => {
    try {
        
        res.render('addProductPricing', {activeAddproductMessage: 'active'});

    } catch (error) {
        console.log(error.message);
    };
};

const loadAddProductImages = async (req, res) => {
    try {
        
        res.render('addProductImages', {activeAddproductMessage: 'active'});

    } catch (error) {
        console.log(error.message);
    };
};

const loadAddProductRelatedProducts = async (req, res) => {
    try {
        
        const productData = await Product.find({});
        res.render('addProductRelatedProducts', {activeAddproductMessage: 'active', products: productData});

    } catch (error) {
        console.log(error.message);
    };
};

const loadUserList = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1; // Get the page number from the query parameters
        const limit = parseInt(req.query.limit) || 5; // Get the limit from the query parameters

        let search = '';

        if (req.query.search){
            search = req.query.search;
        };

        const usersData = await User.find({
            is_admin: 0,
            $or : [
                { name : { $regex:'.*' + search + '.*', $options: 'i' } },
                { email : { $regex:'.*' + search + '.*', $options: 'i' } }
            ] 
        }).skip((page - 1) * limit).limit(limit); // Apply pagination

        const totalPages = Math.ceil(await User.countDocuments().exec() / limit); // Calculate total pages

        const pagination = {
            currentPage: page,
            totalPages: totalPages,
            previous: page > 1 ? { page: page - 1 } : null,
            next: page < totalPages ? { page: page + 1 } : null
        };

        res.render('userList', { activeUserMessage: 'active', users: usersData, pagination: pagination });

    } catch (error) {
        console.log(error.message);
    };
};


const blockAndActive2 = async (req, res) => {
    try {
        const {userId} = req.body
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'Failed' });
        }

        // Toggle the is_blocked field
        // user.is_blocked = user.is_blocked === 0 ? 1 : 0;
        user.is_blocked = Number(!user.is_blocked);
        await user.save();

        res.status(200).json({ message: 'Success' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
};
    
const activeOrInactive = async (req, res, next) => {
    try {
        const {categoryId}=req.body;
        const category = await Category.findById(categoryId);

        if (!category) {
            return next();
        };

        // Toggle the is_hide field

        category.is_hide = category.is_hide === 1 ? 0 : 1;
        await category.save();

        res.status(200).json({ message: 'Success' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }; 
};

const loadAdminLogin = async (req, res) => {
    try {

        res.render('adminLogin');
        
    } catch (error) {
        console.log(error.message);
    };
};

const loadTesting = async (req, res) => {
    try {

        res.render('testing');
        
    } catch (error) {
        console.log(error.message);
    };
};

const adminVerifyLogin = async (req, res) => {
    try {

        const email = req.body.adminEmail;
        const password = req.body.adminPassword;

        const adminData = await Admin.findOne({
            email: email
        });

        if (adminData.password == password) {

            req.session.admin_id = adminData._id;
            res.redirect('/admin');

        } else {
            res.render('adminLogin', {validationMessage: 'Incorrect Username or Password'});
        }
        
    } catch (error) {
        console.log(error.message);
    };
};

/*****************      To Logout the Admin     *********************/

const adminLogout = async (req, res) => {
    try {

        req.session.destroy();
        res.redirect('/admin');

    } catch (error) {
        console.log(error.message);
    };
};



module.exports = {
    loadAdminHome,
    blockAndActive2,
    loadUserList,
    loadTesting,
    loadAdminLogin,
    adminVerifyLogin,
    activeOrInactive,
    loadAddProductPrice,
    loadAddProductImages,
    loadAddProductRelatedProducts,
    adminLogout,

};