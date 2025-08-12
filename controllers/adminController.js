const Admin = require("../models/adminModel");
const User = require("../models/userModel");
const Product = require("../models/productModel");
const Category = require("../models/categoryModel");
const Order = require("../models/orderModel");

const bcrypt = require("bcryptjs");

const { format } = require("date-fns");
const statusCode = require("../constants/statusCode");
const responseMessage = require("../constants/responseMessage");

/*****************      To load the AdminDashboard     *********************/
const loadAdminHome = async (req, res) => {
  try {
    let fullRevenue = 0;

    let orderDate = [];
    let orderIds = [];

    const productData = await Product.find({ is_hide: 0 });
    const categoryData = await Category.find({ is_hide: 0 });
    const OrderData = await Order.find({
      order_status: { $nin: ["cancelOrder", "returnOrder"] },
      order_status: "Delivered",
    });

    const toShowLatest6Orders = await Order.find()
      .limit(6)
      .populate("user")
      .populate("products")
      .sort({ updatedAt: -1 });

    for (let i = 0; i < toShowLatest6Orders.length; i++) {
      const pageOrderIdFull = toShowLatest6Orders[i]._id.toString();
      const pageOrderId = pageOrderIdFull.substring(0, 8);
      orderIds.push(pageOrderId);

      const date = toShowLatest6Orders[i].createdAt;
      const formatconvertedDate = format(date, "dd MMM, yyyy");
      orderDate.push(formatconvertedDate);
    }

    for (let i = 0; i < OrderData.length; i++) {
      fullRevenue += OrderData[i].order_total;
    }

    res.render("adminDashboard", {
      activeDashboardMessage: "active",
      product: productData,
      categories: categoryData,
      orders: OrderData,
      fullRevenue,
      latestOrders: toShowLatest6Orders,
      orderDate,
      orderIds,
    });
  } catch (error) {
    console.log(error.message);
  }
};

/*****************      To load the page to add products     *********************/
const loadAddProductPrice = async (req, res) => {
  try {
    res.render("addProductPricing", { activeAddproductMessage: "active" });
  } catch (error) {
    console.log(error.message);
  }
};

/*****************      To load the page to add Images     *********************/
const loadAddProductImages = async (req, res) => {
  try {
    res.render("addProductImages", { activeAddproductMessage: "active" });
  } catch (error) {
    console.log(error.message);
  }
};

/*****************      To load the page to add products related products    *********************/
const loadAddProductRelatedProducts = async (req, res) => {
  try {
    const productData = await Product.find({});
    res.render("addProductRelatedProducts", {
      activeAddproductMessage: "active",
      products: productData,
    });
  } catch (error) {
    console.log(error.message);
  }
};

/*****************      To load the User list     *********************/
const loadUserList = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Get the page number from the query parameters
    const limit = parseInt(req.query.limit) || 5; // Get the limit from the query parameters

    let search = "";

    if (req.query.search) {
      search = req.query.search;
    }

    const usersData = await User.find({
      is_admin: 0,
      $or: [
        { name: { $regex: ".*" + search + ".*", $options: "i" } },
        { email: { $regex: ".*" + search + ".*", $options: "i" } },
      ],
    })
      .skip((page - 1) * limit)
      .limit(limit); // Apply pagination

    const totalPages = Math.ceil((await User.countDocuments().exec()) / limit); // Calculate total pages

    const pagination = {
      currentPage: page,
      totalPages: totalPages,
      previous: page > 1 ? { page: page - 1 } : null,
      next: page < totalPages ? { page: page + 1 } : null,
    };

    res.render("userList", {
      activeUserMessage: "active",
      users: usersData,
      pagination: pagination,
    });
  } catch (error) {
    console.log(error.message);
  }
};

/*****************      To block and unblock user     *********************/
const blockAndActive2 = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId);

    if (!user) {
      return res
        .status(statusCode.NOT_FOUND)
        .json({ message: responseMessage.FAILED });
    }

    user.is_blocked = Number(!user.is_blocked);
    const updatedUser = await user.save();

    res.status(statusCode.OK).json({
      message: responseMessage.SUCCESS,
      userId: updatedUser._id,
      newStatus: updatedUser.is_blocked ? "Blocked" : "Active",
    });
  } catch (err) {
    console.error(err.message);
    res
      .status(statusCode.INTERNAL_SERVER_ERROR)
      .json({ message: responseMessage.INTERNAL_SERVER_ERROR });
  }
};

/*****************      To list and unlist category     *********************/
const activeOrInactive = async (req, res, next) => {
  try {
    const { categoryId } = req.body;
    const category = await Category.findById(categoryId);

    if (!category) {
      return next();
    }

    category.is_hide = category.is_hide === 1 ? 0 : 1;
    const updatedCategory= await category.save();

    res.status(statusCode.OK).json({ message: responseMessage.SUCCESS, categoryId: updatedCategory._id, newStatus: updatedCategory.is_hide ? "In Active" : "Active" });
  } catch (err) {
    console.error(err.message);
    res
      .status(statusCode.INTERNAL_SERVER_ERROR)
      .json({ message: responseMessage.INTERNAL_SERVER_ERROR });
  }
};

/*****************      To load the admin login page     *********************/
const loadAdminLogin = async (req, res) => {
  try {
    res.render("adminLogin");
  } catch (error) {
    console.log(error.message);
  }
};

/*****************      To load the Testing page     *********************/
const loadTesting = async (req, res) => {
  try {
    res.render("testing");
  } catch (error) {
    console.log(error.message);
  }
};

/*****************      To Verify the admin     *********************/
const adminVerifyLogin = async (req, res) => {
  try {
    const email = req.body.adminEmail;
    const password = req.body.adminPassword;

    const adminData = await Admin.findOne({
      email: email,
    });

    const passwordMatch = bcrypt.compareSync(password, adminData.password);

    if (passwordMatch) {
      req.session.admin_id = adminData._id;
      res.redirect("/admin");
    } else {
      res.render("adminLogin", {
        validationMessage: "Incorrect Username or Password",
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};

/*****************      To Logout the Admin     *********************/
const adminLogout = async (req, res) => {
  try {
    req.session.destroy();
    res.redirect("/admin");
  } catch (error) {
    console.log(error.message);
  }
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
