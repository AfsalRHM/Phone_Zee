const User = require('../models/userModel');
const Product = require('../models/productModel');
const Category = require('../models/categoryModel');
const Address = require('../models/addressModel');
const Wishlist = require('../models/wishlistModel');
const Cart = require('../models/cartModel');
const Order = require('../models/orderModel');


/******      To load Category list Page      ******/

const loadCategoryList = async (req, res) => {
    try {

        const categoryData = await Category.find({});
        res.render('categoryList', {activeCategoryMessage: 'active',categories: categoryData});
        
    } catch (error) {
        console.log(error.message);
    };
};

/******      To Create a Category      ******/

const createCategory = async (req, res) => {
    try {

        const category = req.body.categoryName;

        const categoryExist = await Category.find({ name : { $regex:'.*' + category + '.*', $options: 'i' } });
        const categoryData = await Category.find({});

        if (categoryExist.length !== 0) {
            res.render('categoryList', {message: 'Category already Exists', categories: categoryData})
        } else {
            const category = new Category ({
                name: req.body.categoryName,
                description: req.body.categoryDescription
            });
    
            const categoryData = await category.save();
    
            if (categoryData) {
                res.redirect('/admin/categoryList');
            } else {
                res.render('categoryList', {message: 'Category Not Added'});
            };
        };
        
    } catch (error) {
        console.log(error.message);
    };
};

/******      To load Edit Category Page      ******/

const loadEditCategory = async (req, res) => {
    try {

        const id = req.query.id;

        const categoryData = await Category.findById({_id: id});

        if (categoryData) {
            res.render('editCategory', {category: categoryData});
        } else {
            res.redirect('/admin/userlist')
        }
        
        
    } catch (error) {
        console.log(error.message);
    };
};

/******      To Update a Category      ******/

const updateCategory = async (req, res) => {
    try {

        const id = req.body.id;

        const categoryData = await Category.findById({_id: id});

        const categoryDataCheck = await Category.find({name: { $regex:'.*' + req.body.categoryName + '.*', $options: 'i' }});

        if (categoryDataCheck.length !== 0) {

            res.render('editCategory', {errorMessage: 'The Category name already exists', category: categoryData })

        } else {
            const categoryData = await Category.findByIdAndUpdate({_id: req.body.id}, {
                $set: {
                    name: req.body.categoryName,
                    description: req.body.categoryDescription
                }
            });
    
            res.redirect('/admin/categorylist')
        }

    } catch (error) {
        console.log(error.message);
    };
};

module.exports = {
    loadCategoryList,
    createCategory,
    loadEditCategory,
    updateCategory
};