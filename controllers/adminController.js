const Admin = require('../models/adminModel');
const User = require('../models/userModel');
const Category = require('../models/categoryModel');
const Product = require('../models/productModel');
const bcrypt = require('bcrypt');

const loadAdminHome = async (req, res) => {
    try {
        
        const productData = await Product.find({is_hide: 0});
        const categoryData = await Category.find({is_hide: 0});
        res.render('adminDashboard', {activeDashboardMessage: 'active', product: productData, categories: categoryData })

    } catch (error) {
        console.log(error.message);
    };
};

const loadAddProduct = async (req, res) => {
    try {

        const categoryData = await Category.find({});
        res.render('addProductGeneral', {activeAddproductMessage: 'active', categories: categoryData});

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
}

const loadUserList = async (req, res) => {
    try {

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
        });
        res.render('userList', {activeUserMessage: 'active', users: usersData});
        
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

// const updateProduct = async (req, res) => {
//     try {
       
//         const productImages = [];

//         for (let i = 1; i <= 4; i++) {
//             if (req.files[`image_${i}`] && req.files[`image_${i}`][0]) {
//                 productImages.push(req.files[`image_${i}`][0].filename);
//             }
//         }

//         const ProductData = await Product.findByIdAndUpdate({_id: req.body.id}, {
//             $set: {
//                 name: req.body.productName,
//                 description: req.body.productDescription,
//                 category: req.body.productCategory,
//                 price: req.body.productPrice,
//                 product_image: req.file ? req.file.filename : ProductData.product_image
//             }
//         });

//         res.redirect('/admin/productlist');

//     } catch (error) {
//         console.log(error.message);
//     };
// };

// const updateProduct = async (req, res) => {
//     try {
//         const productId = req.body.id;
//         const product = await Product.findById(productId);

//         console.log('4 here');

//         let productImages = [];
//         for (let i = 0; i <= 4; i++) {
//             if (req.files[i]) {
//                 productImages.push(req.files[i].filename);
//             }
//         }

//         console.log('3 here');

//         // Update product data
//         const updatedData = {
//             name: req.body.productName,
//             description: req.body.productDescription,
//             category: req.body.productCategory,
//             price: req.body.productPrice,
//             // If additional images exist, use them; otherwise, use existing images
//             product_image: productImages.length > 0 ? productImages : product.product_image
//         };

//         console.log('1 here');

//         // Update the product image array if additional images exist
//         if (productImages.length > 0) {
//             updatedData.$push = { product_image: { $each: productImages } };
//         }

//         console.log('2 here');


//         const updatedProduct = await Product.findByIdAndUpdate(productId, updatedData, { new: true });
//         res.redirect('/admin/productlist');
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Internal server error' });
//     }
// };

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

        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
    


const loadCategoryList = async (req, res) => {
    try {

        const categoryData = await Category.find({});
        res.render('categoryList', {activeCategoryMessage: 'active',categories: categoryData});
        
    } catch (error) {
        console.log(error.message);
    };
};

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
    loadAddProduct,
    loadProductList,
    blockAndActive2,
    loadEditProduct,
    updateProduct,
    loadUserList,
    loadCategoryList,
    loadTesting,
    loadAdminLogin,
    adminVerifyLogin,
    createCategory,
    loadEditCategory,
    updateCategory,
    activeOrInactive,
    loadAddProductPrice,
    loadAddProductImages,
    loadAddProductRelatedProducts,
    insertProduct,
    activeOrInactive2,
    adminLogout

};