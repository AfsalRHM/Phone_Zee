const User = require('../models/userModel');
const Product = require('../models/productModel');
const Category = require('../models/categoryModel');
const Address = require('../models/addressModel');
const Wishlist = require('../models/wishlistModel');
const Cart = require('../models/cartModel');
const Order = require('../models/orderModel');

/*****************      To Search the product or category     *********************/

const searchFeature = async (req, res) => {
    try {

        let searchtext = '';
        const searchText = req.query.q;
        const page = req.query.page || 1; // Default page to 1 if not provided

        const cartDataForCount = await Cart.findOne({ user: req.session.user_id }).populate('products');

        if (searchText) {
            searchtext = searchText;
        }

        const pageSize = 10; // Number of products per page
        const skip = (page - 1) * pageSize; // Calculate number of products to skip based on page number

        const productData = await Product.find({
            is_hide: 0,
            $or: [
                { name: { $regex: '.*' + searchtext + '.*', $options: 'i' } },
                { category: { $regex: '.*' + searchtext + '.*', $options: 'i' } },
            ]
        }).limit(pageSize).skip(skip); // Limit and skip for pagination

        const categoryData = await Category.find({ is_hide: 0 });

        const totalProducts = await Product.countDocuments({ is_hide: 0 }); // Total number of products for pagination
        const totalPages = Math.ceil(totalProducts / pageSize);

        res.render('category', {
            activeShopMessage: 'active',
            pageTitle: 'products | PhoneZee',
            product: productData,
            categories: categoryData,
            loginOrCart: req.session,
            cartItemsForCartCount: cartDataForCount ? cartDataForCount.products : [],
            sortMethod: 'undefined',
            pagination: { currentPage: page, totalPages: totalPages }
        });

    } catch (error) {
        console.log(error.message);
    };
};

/*****************      To Search the product or category     *********************/

const sortFunction = async (req, res) => {
    try {

        const sortValue = req.query.sortby;

        const categoryData = await Category.find({is_hide: 0});

        const cartDataForCount = await Cart.findOne({user: req.session.user_id}).populate('products');

        let sortMethod = '';

        let sortedData;
        if (sortValue === 'lowToHigh') {
            sortedData = await Product.find().sort({ price: 1 });
            sortMethod = 'Price : Low - High';
        } else if (sortValue === 'highToLow') {
            sortedData = await Product.find().sort({ price: -1 });
            sortMethod = 'Price : High - Low';
        } else if (sortValue === 'aATozZ') {
            sortedData = await Product.find({}).sort({ name: 1 });
            sortMethod = 'Name : Aa - Zz';
        } else if (sortValue === 'zZToaA') {
            sortedData = await Product.find({}).sort({ name: -1 });
            sortMethod = 'Name : Zz - Aa';
        } else if (sortValue === 'date') {
            sortedData = await Product.find({});
            sortMethod = 'Dated';
        };


        if (cartDataForCount == null) {
            res.render('category', {activeShopMessage: 'active', pageTitle: 'products | PhoneZee', product: sortedData, categories: categoryData, loginOrCart: req.session, cartItemsForCartCount: cartDataForCount, sortMethod, sortValue })
        } else {
            res.render('category', {activeShopMessage: 'active', pageTitle: 'products | PhoneZee', product: sortedData, categories: categoryData, loginOrCart: req.session, cartItemsForCartCount: cartDataForCount.products, sortMethod, sortValue })
        };

    } catch (error) {
        console.log(error.message);
    };
};

module.exports = {
    searchFeature,
    sortFunction
};