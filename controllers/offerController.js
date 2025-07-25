const Admin = require('../models/adminModel');
const User = require('../models/userModel');
const Product = require('../models/productModel');
const Category = require('../models/categoryModel');
const Address = require('../models/addressModel');
const Wishlist = require('../models/wishlistModel');
const Cart = require('../models/cartModel');
const Order = require('../models/orderModel');
const Coupon = require('../models/couponModel');
const Offer = require('../models/offerModel');
const statusCode = require('../constants/statusCode');
const responseMessage = require('../constants/responseMessage');


/*****************      To load the product offer list page     *********************/

const loadProductOfferList = async (req, res) => {
    try {
        
        const page = parseInt(req.query.page) || 1; // Get the page number from the query parameters
        const limit = parseInt(req.query.limit) || 5; // Get the limit from the query parameters
        
        // Calculate the skip value based on the page number and limit
        const skip = (page - 1) * limit;
        
        const offerData = await Offer.find({offer_On: 'product'}).populate('item_Id').skip(skip).limit(limit);

        // Count total number of products
        const totalProducts = await Offer.countDocuments({offer_On: 'product'});

        // Calculate total pages
        const totalPages = Math.ceil(totalProducts / limit);

        // Construct pagination object
        const pagination = {
            currentPage: page,
            totalPages: totalPages,
            hasPreviousPage: page > 1,
            hasNextPage: page < totalPages,
            previous: page > 1 ? { page: page - 1 } : null,
            next: page < totalPages ? { page: page + 1 } : null
        };

        res.render('offerProductList', { activeOfferMessage: 'active', offerProducts: offerData, pagination });
        
    } catch (error) {
        console.log(error.message);
    };
};

/*****************      To load the category offer list page     *********************/

const loadCategoryOfferList = async (req, res) => {
    try {

        const page = parseInt(req.query.page) || 1; // Get the page number from the query parameters
        const limit = parseInt(req.query.limit) || 5; // Get the limit from the query parameters
        
        // Calculate the skip value based on the page number and limit
        const skip = (page - 1) * limit;
        
        const offerData = await Offer.find({offer_On: 'category'}).populate('item_Id').skip(skip).limit(limit);

        // Count total number of products
        const totalProducts = await Offer.countDocuments({ offer_On: 'category' });

        // Calculate total pages
        const totalPages = Math.ceil(totalProducts / limit);

        // Construct pagination object
        const pagination = {
            currentPage: page,
            totalPages: totalPages,
            hasPreviousPage: page > 1,
            hasNextPage: page < totalPages,
            previous: page > 1 ? { page: page - 1 } : null,
            next: page < totalPages ? { page: page + 1 } : null
        };

        
        res.render('offerCategoryList', { activeOfferMessage: 'active', offerCategories: offerData, pagination });
        
    } catch (error) {
        console.log(error.message);
    };
};

/*****************      To load the add offer page     *********************/

const loadAddOffer = async (req, res) => {
    try {

        const addItem = req.query.by;

        if (addItem == 'product') {

            const productData = await Product.find({});

            res.render('addOffer', { activeOfferMessage: 'active', comingFor: 'AddProduct', items: productData });

        } else if (addItem == 'category') {

            const categoryData = await Category.find({});

            res.render('addOffer', { activeOfferMessage: 'active', comingFor: 'AddCategory', items: categoryData });

        };
        
    } catch (error) {
        console.log(error.message);
    };
};

/*****************      To insert a Offer     *********************/

const createOffer = async (req, res) => {
    try {

        const { item, itemName, percentageOffer } = req.body;

        if (item == 'product') {

            const productData = await Product.find();

            const product = await Product.findOne({name: itemName});

            const offerExist = await Offer.findOne({item_Id: product._id});

            if (offerExist) {
                res.render('addOffer', { activeOfferMessage: 'active', comingFor: 'AddProduct' , items: productData, addOfferMessage: 'Offer already exist for this Product.' });
            } else if (!product) {
                res.render('addOffer', { activeOfferMessage: 'active', comingFor: 'AddProduct' , items: productData, addOfferMessage: 'Product not found.' });
            } else if (percentageOffer <= 0 || percentageOffer >= 100) {
                res.render('addOffer', { activeOfferMessage: 'active', comingFor: 'AddProduct' , items: productData, addOfferMessage: 'invalid percentage.' });
            } else if (percentageOffer == '') {
                res.render('addOffer', { activeOfferMessage: 'active', comingFor: 'AddProduct' , items: productData, addOfferMessage: 'Please enter a offer percentage.' });
            } else {

                const offer = new Offer({
                    offer_On: item,
                    item_Id: product._id,
                    offer_percentage: percentageOffer
                });

                product.offer = 1;
                product.salePrice = Math.ceil(product.price - (product.price * (percentageOffer / 100)))

                await product.save();

                const offerData = await offer.save();

                if (offerData) {

                    res.redirect('/admin/productofferlist');

                } else {
                    res.render('addOffer', { activeOfferMessage: 'active', omingFor: 'AddProduct' , items: productData, addOfferMessage: 'Error! Offer not added.' });
                };

            };

        } else if (item == 'category') {

            const categoryData = await Category.find();

            const category = await Category.findOne({name: itemName});

            const offerExist = await Offer.findOne({item_Id: category._id});

            if (offerExist) {
                res.render('addOffer', { activeOfferMessage: 'active', comingFor: 'AddProduct' , items: productData, addOfferMessage: 'Offer already exist for this Product.' });
            } else if (!category) {
                res.render('addOffer', { activeOfferMessage: 'active', comingFor: 'AddCategory' , items: categoryData, addOfferMessage: 'Category not found.' });
            } else if (percentageOffer <= 0 || percentageOffer >= 100) {
                res.render('addOffer', { activeOfferMessage: 'active', comingFor: 'AddCategory' , items: categoryData, addOfferMessage: 'invalid percentage.' });
            } else if (percentageOffer == '') {
                res.render('addOffer', { activeOfferMessage: 'active', comingFor: 'AddCategory' , items: categoryData, addOfferMessage: 'Please enter a offer percentage.' });
            } else {

                const offer = new Offer({
                    offer_On: item,
                    item_Id: category._id,
                    offer_percentage: percentageOffer
                });

                category.offer = 1;

                await category.save();

                const offerData = await offer.save();

                if (offerData) {

                    res.redirect('/admin/categoryofferlist');

                } else {
                    res.render('addOffer', { activeOfferMessage: 'active', omingFor: 'AddCategory' , items: productData, addOfferMessage: 'Error! Offer not added.' });
                };

            };

        };
        
    } catch (error) {
        console.log(error.message);
    };
};

/*****************      To Load the Offer Edit page     *********************/

const loadEditOffer = async (req, res) => {
    try {

        const { editItem, offerId } = req.query;

        if (editItem == 'product') {

            const offerData = await Offer.findOne({_id: offerId}).populate('item_Id');

            const productData = await Product.find({});

            res.render('editOffer', { activeOfferMessage: 'active', comingFor: 'editProduct', offerData, items: productData });

        } else if (editItem == 'category') {

            const offerData = await Offer.findOne({_id: offerId}).populate('item_Id');

            const categoryData = await Category.find({});

            res.render('editOffer', { activeOfferMessage: 'active', comingFor: 'editCategory', offerData, items: categoryData });

        };
        
    } catch (error) {
        console.log(error.message);
    };
};

/*****************      To Update a Offer     *********************/

const updateOffer = async (req, res) => {
    try {

        const { editItem, offerId } = req.query;

        const { item, itemName, percentageOffer, oldItemName } = req.body;

        if (item == 'product') {

            const offerData = await Offer.findOne({_id: offerId}).populate('item_Id');

            const productData = await Product.find();

            const product = await Product.findOne({name: itemName});

            const oldProduct = await Product.findOne({name: oldItemName});

            const offerExist = await Offer.findOne({item_Id: product._id});

            if (offerExist && offerExist.offer_percentage == percentageOffer) {
                res.render('editOffer', { activeOfferMessage: 'active', comingFor: 'editProduct' , offerData, items: productData, editOfferMessage: 'Offer already exist for this Category.' });
            } else if (!product) {
                res.render('editOffer', { activeOfferMessage: 'active', comingFor: 'editProduct' , offerData, items: productData, editOfferMessage: 'Product not found.' });
            } else if (percentageOffer <= 0 || percentageOffer >= 100) {
                res.render('editOffer', { activeOfferMessage: 'active', comingFor: 'editProduct' , offerData, items: productData, editOfferMessage: 'invalid percentage.' });
            } else if (percentageOffer == '') {
                res.render('editOffer', { activeOfferMessage: 'active', comingFor: 'editProduct' , offerData, items: productData, editOfferMessage: 'Please enter a offer percentage.' });
            } else {

                offerData.item_Id = product._id;
                offerData.offer_percentage = percentageOffer;

                const offerDataSaved = await offerData.save();

                if ( oldProduct.name == itemName ) {
                    oldProduct.offer = 1; 
                } else {
                    oldProduct.offer = 0;
                    oldProduct.salePrice = 0;
                    product.offer = 1;
                };

                product.salePrice = Math.ceil(product.price - (product.price * (percentageOffer / 100)));

                await oldProduct.save();
                await product.save();

                if (offerDataSaved) {

                    res.redirect('/admin/productofferlist');

                } else {
                    res.render('editOffer', { activeOfferMessage: 'active', comingFor: 'editProduct' ,  offerData, items: productData, editOfferMessage: 'Error! Offer not updated.' });
                };

            };

        } else if (item == 'category') {

            const offerData = await Offer.findOne({_id: offerId}).populate('item_Id');

            const categoryData = await Category.find();

            const category = await Category.findOne({name: itemName});

            const oldCategory = await Category.findOne({name: oldItemName});

            const offerExist = await Offer.findOne({item_Id: category._id});

            if (offerExist && offerExist.offer_percentage == percentageOffer) {
                res.render('editOffer', { activeOfferMessage: 'active', comingFor: 'editCategory' , offerData, items: categoryData, editOfferMessage: 'Offer already exist for this Product.' });
            } else if (!category) {
                res.render('editOffer', { activeOfferMessage: 'active', comingFor: 'editCategory' , offerData, items: categoryData, editOfferMessage: 'Category not found.' });
            } else if (percentageOffer <= 0 || percentageOffer >= 100) {
                res.render('editOffer', { activeOfferMessage: 'active', comingFor: 'editCategory' , offerData, items: categoryData, editOfferMessage: 'invalid percentage.' });
            } else if (percentageOffer == '') {
                res.render('editOffer', { activeOfferMessage: 'active', comingFor: 'editCategory' , offerData, items: categoryData, editOfferMessage: 'Please enter a offer percentage.' });
            } else {

                offerData.item_Id = category._id;
                offerData.offer_percentage = percentageOffer;

                if ( oldCategory.name == itemName ) {
                    oldCategory.offer = 1
                } else {
                    oldCategory.offer = 0
                    category.offer = 1
                };

                await oldCategory.save();
                await category.save();

                const offerDataSaved = await offerData.save();

                if (offerDataSaved) {

                    res.redirect('/admin/categoryofferlist');

                } else {
                    res.render('editOffer', { activeOfferMessage: 'active', comingFor: 'editCategory' , offerData, items: categoryData, editOfferMessage: 'Error! Offer not added.' });
                };

            };

        };
        
    } catch (error) {
        console.log(error.message);
    };
};

/*****************      To Switch or change the status of product offer     *********************/

const switchProductOfferStatus = async (req, res, next) => {
    try {
        const { offerId, message } = req.body;
        const offer = await Offer.findById(offerId);

        const product = await Product.findById( offer.item_Id );

        if (message == 'offerDelete') {
            return next();
        };

        // Toggle the is_hide field

        offer.is_hide = offer.is_hide === 1 ? 0 : 1;
        if (offer.is_hide == 1) {
            product.offer = 0;
            product.salePrice = 0;
        } else {
            product.offer = 1;
            product.salePrice = Math.ceil(product.price - (product.price * (offer.offer_percentage / 100))) ;
        }

        await product.save();
        await offer.save();

        res.status(statusCode.OK).json({ message: responseMessage.SUCCESS });
    } catch (err) {
        console.error(err.message);
        res.status(statusCode.INTERNAL_SERVER_ERROR).json({ message: responseMessage.INTERNAL_SERVER_ERROR });
    }; 
};

/*****************      To Switch or change the status of category offer     *********************/

const switchCategoryOfferStatus = async (req, res, next) => {
    try {
        const { offerId, message } = req.body;
        const offer = await Offer.findById(offerId);

        if (message == 'offerDelete') {
            return next();
        };

        // Toggle the is_hide field

        offer.is_hide = offer.is_hide === 1 ? 0 : 1;
        await offer.save();

        res.status(statusCode.OK).json({ message: responseMessage.SUCCESS });
    } catch (err) {
        console.error(err.message);
        res.status(statusCode.INTERNAL_SERVER_ERROR).json({ message: responseMessage.INTERNAL_SERVER_ERROR });
    }; 
};

/*****************      To Delete a product offer     *********************/

const deleteProductOffer = async (req, res) => {
    try {
        
        const { offerId, message } = req.body;

        const offerDeletionData = await Offer.deleteOne({ _id: offerId });

        

        if (offerDeletionData) {
            res.status(statusCode.OK).json({ message: responseMessage.SUCCESS });
        } else {
            res.status(statusCode.INTERNAL_SERVER_ERROR).json({ message: responseMessage.FAILED });
        }
        
    } catch (error) {
        console.log(error.message);
    };
};

/*****************      To Delete a category offer     *********************/

const deleteCategoryOffer = async (req, res) => {
    try {
        
        const { offerId, message } = req.body;

        const offerDeletionData = await Offer.deleteOne({ _id: offerId });

        if (offerDeletionData) {
            res.status(statusCode.OK).json({ message: responseMessage.SUCCESS });
        } else {
            res.status(statusCode.INTERNAL_SERVER_ERROR).json({ message: responseMessage.FAILED });
        }
        
    } catch (error) {
        console.log(error.message);
    };
};


module.exports = {
    loadProductOfferList,
    loadCategoryOfferList,
    loadAddOffer,
    loadEditOffer,
    createOffer,
    updateOffer,
    switchProductOfferStatus,
    switchCategoryOfferStatus,
    deleteProductOffer,
    deleteCategoryOffer
};