const User = require('../models/userModel');
const Product = require('../models/productModel');
const Category = require('../models/categoryModel');
const Address = require('../models/addressModel');
const Wishlist = require('../models/wishlistModel');
const Cart = require('../models/cartModel');
const Order = require('../models/orderModel');
const Offer = require('../models/offerModel');
const statusCode = require('../constants/statusCode');
const responseMessage = require('../constants/responseMessage');


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

        const page = parseInt(req.query.page) || 1; // Get the page number from the query parameters
        const limit = parseInt(req.query.limit) || 5; // Get the limit from the query parameters

        // Calculate the skip value based on the page number and limit
        const skip = (page - 1) * limit;

        // Fetch all categories
        const categoryData = await Category.find({});

        // Fetch products with pagination using skip and limit
        const productData = await Product.find({}).skip(skip).limit(limit);

        // Count total number of products
        const totalProducts = await Product.countDocuments();

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

        if (productData) {
            res.render('productList', {activeProductMessage: 'active', product: productData, categories: categoryData, pagination: pagination});
        } else {
            res.render('addProductGeneral', {message: 'An error occurred'});
        }
        
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
        const updatedProduct = await product.save();

        res.status(statusCode.OK).json({ message: responseMessage.SUCCESS, productId: updatedProduct._id, newStatus: updatedProduct.is_hide ? "In Active" : "Active" });
    } catch (err) {
        console.error(err.message);
        res.status(statusCode.INTERNAL_SERVER_ERROR).json({ message: responseMessage.INTERNAL_SERVER_ERROR });
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
        } else if (productImages.length < 4) {
            res.render('addProductGeneral',{message: 'Add 4 Images', categories: categoryData})
        } else if (req.body.productRam == '') {
            res.render('addProductGeneral',{message: 'Add the Ram of the device', categories: categoryData})
        } else if (req.body.productStorage == '') {
            res.render('addProductGeneral',{message: 'Add the Ram capacity of the device', categories: categoryData})
        } else if (req.body.productStock <= 0) {
            res.render('addProductGeneral',{message: 'Enter a Valid Stock', categories: categoryData});
        } else if (req.body.productPrice <= 0) {
            res.render('addProductGeneral',{message: 'Enter a Valid Price', categories: categoryData});
        } else if (req.body.productRam <= 0) {
            res.render('addProductGeneral',{message: 'Enter a Valid Ram', categories: categoryData});
        } else if (req.body.productStorage <= 0) {
            res.render('addProductGeneral',{message: 'Enter a Valid Storage', categories: categoryData});
        } else if (req.body.productCategory == 'select category') {
            res.render('addProductGeneral',{message: 'Please select a category', categories: categoryData});
        } else {
            const product = new Product({
                name: req.body.productName,
                description: req.body.productDescription,
                category: req.body.productCategory,
                price: req.body.productPrice,
                stock: req.body.productStock,
                ram: req.body.productRam,
                storage: req.body.productStorage,
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

/*****************      To Delete Image of a Product     *********************/

const deleteImage = async (req, res) => {
    try {

        const { image } = req.body;
        const productId = req.params.id;

        await Product.findByIdAndUpdate(productId, {
            $pull: { product_image: image }
        });

        res.status(statusCode.OK).json({success: true, message: "Image Deleted"})
    } catch (error) {
        console.log(error.message);
    }
}

/*****************      To Update the Product     *********************/

const updateProduct = async (req, res) => {
    try {
        const productId = req.body.id;
        const product = await Product.findById(productId);
        const categoryData = await Category.find({});

        // product: productData, categories: categoryData
  
        // Check if product exists
        if (!product) {
            return res.status(statusCode.NOT_FOUND).json({ message: 'Product not found' });
        }else if (req.body.productName.trim() == '') {
            res.render('editProduct',{message: 'Enter A Valid Product Name', product: product, categories: categoryData});
        } else if (req.body.productDescription.trim() == '') {
            res.render('editProduct',{message: 'Please make an Description for Product', product: product, categories: categoryData});
        } else if (req.body.productPrice == '') {
            res.render('editProduct',{message: 'Add a Price to the Product', product: product, categories: categoryData});
        } else if (req.body.productRam == '') {
            res.render('editProduct',{message: 'Add the Ram of the device',product: product, categories: categoryData})
        } else if (req.body.productStorage == '') {
            res.render('editProduct',{message: 'Add the Ram capacity of the device',product: product, categories: categoryData})
        } else if (req.body.productStock == '') {
            res.render('editProduct',{message: 'Add a Product Stock', product: product, categories: categoryData});
        }
        //  else if (req.body.productStock <= 0) {
        //     res.render('editProduct',{message: 'Enter a Valid Stock', product: product, categories: categoryData});
        // } 
        else if (req.body.productPrice <= 0) {
            res.render('editProduct',{message: 'Enter a Valid Price', product: product, categories: categoryData});
        } else if (req.body.productRam <= 0) {
            res.render('editProduct',{message: 'Enter a Valid Ram',product: product, categories: categoryData});
        } else if (req.body.productStorage <= 0) {
            res.render('editProduct',{message: 'Enter a Valid Storage',product: product, categories: categoryData});
        }else {
            
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
            
            if (productImages.length < 4) {
                res.render('editProduct',{message: 'Add 4 Images',product: product, categories: categoryData});
                return;
            }
    
            const updatedData = {
                name: req.body.productName,
                description: req.body.productDescription,
                category: req.body.productCategory,
                price: req.body.productPrice,
                stock: req.body.productStock,
                ram: req.body.productRam,
                storage: req.body.productStorage,
                product_image: productImages.length > 0 ? productImages : product.product_image
            };
        
            const updatedProduct = await Product.findByIdAndUpdate(productId, updatedData, { new: true });
        
            res.redirect('/admin/productlist');

        };
    } catch (error) {
        console.error(error);
        res.status(statusCode.INTERNAL_SERVER_ERROR).json({ message: responseMessage.INTERNAL_SERVER_ERROR });
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
        const offerData = await Offer.findOne({item_Id: id, is_hide: 0});

        if (cartDataForCount == null) {
            res.render('product', {pageTitle: 'product | PhoneZee', loginOrCart: req.session, product: productData, relatedProducts: relatedProductData, imagePos: imagePosition, cartItemsForCartCount: cartDataForCount, offerData });
        } else {
            res.render('product', {pageTitle: 'product | PhoneZee', loginOrCart: req.session, product: productData, relatedProducts: relatedProductData, imagePos: imagePosition, cartItemsForCartCount: cartDataForCount.products, offerData });
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
    deleteImage,
    loadProduct
};