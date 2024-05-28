const User = require('../models/userModel');
const Product = require('../models/productModel');
const Category = require('../models/categoryModel');
const Address = require('../models/addressModel');
const Wishlist = require('../models/wishlistModel');
const Cart = require('../models/cartModel');
const Order = require('../models/orderModel');


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

/*****************      To load the Add Product page     *********************/

const loadAddProduct = async (req, res) => {
    try {

        const categoryData = await Category.find({});
        res.render('addProductGeneral', {activeProductMessage: 'active', categories: categoryData});

    } catch (error) {
        console.log(error.message);
    };
};

/*****************      To load the Product List page     *********************/

const loadProductList = async (req, res) => {
    try {

        const categoryData = await Category.find({});
        const productData = await Product.find({});
        if (productData) {
            res.render('productList', {activeProductMessage: 'active', product: productData, categories: categoryData});
        } else {
            res.render('addProductGeneral', {message: 'An error occured'});
        };
        
    } catch (error) {
        console.log(error.message);
    };
};

/*****************      To Show or Hide the Product     *********************/

const activeOrInactive2 = async (req, res, next) => {
    try {
        const {productId}=req.body;
        const product = await Product.findById(productId);

        if (!product) {
            return next();
        };

        // Toggle the is_hide field
        product.is_hide = product.is_hide === 1 ? 0 : 1;
        await product.save();

        res.status(200).json({ message: 'Success' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }; 
};

/*****************      To Insert a Product     *********************/

const insertProduct = async (req, res) => {
    try {

        const productImages = [];

        for (let i = 0; i < 4; i++) {
            if (req.files[i]) {
                productImages.push(req.files[i].filename);
            }
        }

        const categoryData = await Category.find({is_hide : 0});
        const productAlready = await Product.findOne({
            name: req.body.productName
        });
        if (productAlready) {
            res.render('addProductGeneral',{message: 'Product with name already exists', categories: categoryData})
        } else if (req.body.productName.trim() == '') {
            res.render('addProductGeneral',{message: 'Enter A Valid Product Name', categories: categoryData})
        } else if (req.body.productDescription.trim() == '') {
            res.render('addProductGeneral',{message: 'Please make an Description for Product', categories: categoryData})
        } else if (req.body.productPrice == '') {
            res.render('addProductGeneral',{message: 'Add a Price to the Product', categories: categoryData})
        } else if (req.body.productStock == '') {
            res.render('addProductGeneral',{message: 'Add a Product Stock', categories: categoryData})
        } else if (req.body.productStock <= 0) {
            res.render('addProductGeneral',{message: 'Enter a Valid Stock', categories: categoryData});
        } else if (req.body.productPrice <= 0) {
            res.render('addProductGeneral',{message: 'Enter a Valid Price', categories: categoryData});
        } else {
            const product = new Product({
                name: req.body.productName,
                description: req.body.productDescription,
                category: req.body.productCategory,
                price: req.body.productPrice,
                stock: req.body.productStock,
                product_image: productImages
            });
    
            const productData = await product.save();
            
            if (productData) {
                res.redirect('/admin/productlist');
            } else {
                res.render('signup', {signupMessage: 'User Not Added'});
            };
        };
        
    } catch (error) {
        console.log(error.message);
    };
};

/*****************      To load the Edit Product page     *********************/

const loadEditProduct = async (req, res) => {
    try {

        const id = req.query.id;

        const categoryData = await Category.find({});
        const productData = await Product.findById({_id: id});

        if (productData) {
            res.render('editProduct', {product: productData, categories: categoryData});
        } else {
            res.redirect('/admin/productlist')
        }
        
        
    } catch (error) {
        console.log(error.message);
    };
};

/*****************      To Update the Product     *********************/

const updateProduct = async (req, res) => {
    try {
        const productId = req.body.id;
        const product = await Product.findById(productId);
        const categoryData = await Category.find({});

        // product: productData, categories: categoryData
  
        // Check if product exists
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }else if (req.body.productName.trim() == '') {
            res.render('editProduct',{message: 'Enter A Valid Product Name', product: product, categories: categoryData});
        } else if (req.body.productDescription.trim() == '') {
            res.render('editProduct',{message: 'Please make an Description for Product', product: product, categories: categoryData});
        } else if (req.body.productPrice == '') {
            res.render('editProduct',{message: 'Add a Price to the Product', product: product, categories: categoryData});
        } else if (req.body.productStock == '') {
            res.render('editProduct',{message: 'Add a Product Stock', product: product, categories: categoryData});
        } else if (req.body.productStock <= 0) {
            res.render('editProduct',{message: 'Enter a Valid Stock', product: product, categories: categoryData});
        } else if (req.body.productPrice <= 0) {
            res.render('editProduct',{message: 'Enter a Valid Price', product: product, categories: categoryData});
        } else {

            let productImages = product.product_image; // Initialize with existing images

            // Handle newly uploaded images
            if (req.files && req.files.length > 0) {
                const newImages = req.files.map(file => file.filename);
                productImages = [...productImages, ...newImages]; // Concatenate existing and new images
            }

            // Ensure not more than 4 images are saved
            if (productImages.length > 4) {
                productImages = productImages.slice(0, 4);
            }
    
            const updatedData = {
                name: req.body.productName,
                description: req.body.productDescription,
                category: req.body.productCategory,
                price: req.body.productPrice,
                stock: req.body.productStock,
                product_image: productImages.length > 0 ? productImages : product.product_image
            };
        
            const updatedProduct = await Product.findByIdAndUpdate(productId, updatedData, { new: true });
        
            res.redirect('/admin/productlist');

        };
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
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

/*****************      To load the Product page     *********************/

const loadProduct = async (req, res) => {
    try {
        
        const id = req.query.id;
        const imagePosition = req.query.photoNumber;
        const productData = await Product.findOne({_id: id});
        const relatedProductData = await Product.find({_id: {$ne: id} ,category: productData.category});
        const cartDataForCount = await Cart.findOne({user: req.session.user_id}).populate('products');

        if (cartDataForCount == null) {
            res.render('product', {pageTitle: 'product | PhoneZee', loginOrCart: req.session, product: productData, relatedProducts: relatedProductData, imagePos: imagePosition, cartItemsForCartCount: cartDataForCount });
        } else {
            res.render('product', {pageTitle: 'product | PhoneZee', loginOrCart: req.session, product: productData, relatedProducts: relatedProductData, imagePos: imagePosition, cartItemsForCartCount: cartDataForCount.products });
        };

    } catch (error) {
        console.log(error.message);
    };
};

module.exports = {
    loadAddProduct,
    loadProductList,
    activeOrInactive2,
    insertProduct,
    loadEditProduct,
    updateProduct,
    loadProduct
};