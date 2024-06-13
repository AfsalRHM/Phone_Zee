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

        const sortValue = 'undefined';

        const overallProducts = await Product.find({is_hide: 0});

        const page = parseInt(req.query.page) || 1; 
        const limit = parseInt(req.query.limit) || 8; 

        const skip = (page - 1) * limit;

        let searchtext = '';
        const searchText = req.query.q;

        const cartDataForCount = await Cart.findOne({ user: req.session.user_id }).populate('products');

        if (searchText) {
            searchtext = searchText;
        };

        const productData = await Product.find({
            is_hide: 0,
            $or: [
                { name: { $regex: '.*' + searchtext + '.*', $options: 'i' } },
                { category: { $regex: '.*' + searchtext + '.*', $options: 'i' } },
            ]
        }).skip(skip).limit(limit); // Limit and skip for pagination

        const categoryData = await Product.distinct( 'category' );

        const productForLength = await Product.find({
            is_hide: 0,
            $or: [
                { name: { $regex: '.*' + searchtext + '.*', $options: 'i' } },
                { category: { $regex: '.*' + searchtext + '.*', $options: 'i' } },
            ]
        }); // Total number of products for pagination

        const categoryDataProductsCount = [];

        for (let i = 0; i < overallProducts.length; i++) {
            let count = 0;
            for (let j = 0; j < categoryData.length; j++) {
                if (categoryData[j] == overallProducts[i].category) {
                    count++;
                };
            };
            categoryDataProductsCount.push(count);
        };

        res.render('category', {
            activeShopMessage: 'active',
            pageTitle: 'products | PhoneZee',
            product: productData,
            categories: categoryData,
            loginOrCart: req.session,
            cartItemsForCartCount: cartDataForCount ? cartDataForCount.products : [],
            sortMethod: 'undefined',
            sortValue,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(productForLength.length / limit),
                hasNextPage: skip + limit < productData.length,
                hasPreviousPage: page > 1,
                nextPage: page + 1,
                previousPage: page - 1
            },
            searchText,
            categoryDataProductsCount
        });

    } catch (error) {
        console.log(error.message);
    };
};

/*****************      To Search the product or category     *********************/

const sortFunction = async (req, res, next) => {
    try {

        const overallProducts = await Product.find({is_hide: 0});

        const { q } = req.query;

        if ( q ) {
            next();
        } else {

            const page = parseInt(req.query.page) || 1; 
            const limit = parseInt(req.query.limit) || 8; 

            const skip = (page - 1) * limit;

            const sortValue = req.query.sortby;

            const categoryData = await Product.distinct( 'category' );

            let productForLength = await Product.find({ is_hide: 0 });

            const cartDataForCount = await Cart.findOne({user: req.session.user_id}).populate('products');

            let sortMethod = '';

            let sortedData;
            if (sortValue === 'lowToHigh') {
                productForLength = await Product.find().sort({ price: 1 });
                sortedData = await Product.find().sort({ price: 1 }).skip(skip).limit(limit);
                sortMethod = 'Price : Low - High';
            } else if (sortValue === 'highToLow') {
                productForLength = await Product.find().sort({ price: -1 });
                sortedData = await Product.find().sort({ price: -1 }).skip(skip).limit(limit);
                sortMethod = 'Price : High - Low';
            } else if (sortValue === 'aATozZ') {
                productForLength = await Product.find().sort({ name: 1 });
                sortedData = await Product.find({}).sort({ name: 1 }).skip(skip).limit(limit);
                sortMethod = 'Name : Aa - Zz';
            } else if (sortValue === 'zZToaA') {
                productForLength = await Product.find().sort({ name: -1 });
                sortedData = await Product.find({}).sort({ name: -1 }).skip(skip).limit(limit);
                sortMethod = 'Name : Zz - Aa';
            } else if (sortValue === 'date') {
                sortedData = await Product.find({}).skip(skip).limit(limit);
                sortMethod = 'Dated';
            };

            const categoryDataProductsCount = [];

            for (let i = 0; i < overallProducts.length; i++) {
                let count = 0;
                for (let j = 0; j < categoryData.length; j++) {
                    if (categoryData[j] == overallProducts[i].category) {
                        count++;
                    };
                };
                categoryDataProductsCount.push(count);
            };

            if (cartDataForCount == null) {
                res.render('category', {activeShopMessage: 'active', pageTitle: 'products | PhoneZee', product: sortedData, categories: categoryData, loginOrCart: req.session, cartItemsForCartCount: cartDataForCount, sortMethod, sortValue, categoryDataProductsCount,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(productForLength.length / limit),
                    hasNextPage: skip + limit < sortedData.length,
                    hasPreviousPage: page > 1,
                    nextPage: page + 1,
                    previousPage: page - 1
                } });
            } else {
                res.render('category', {activeShopMessage: 'active', pageTitle: 'products | PhoneZee', product: sortedData, categories: categoryData, loginOrCart: req.session, cartItemsForCartCount: cartDataForCount.products, sortMethod, sortValue, categoryDataProductsCount,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(productForLength.length / limit),
                    hasNextPage: skip + limit < sortedData.length,
                    hasPreviousPage: page > 1,
                    nextPage: page + 1,
                    previousPage: page - 1
                } });
            };


        };

    } catch (error) {
        console.log(error.message);
    };
};

module.exports = {
    searchFeature,
    sortFunction
};