const responseMessage = require("../constants/responseMessage");
const statusCode = require("../constants/statusCode");

const isLogin = async (req, res, next) => {
    try {
        if (req.session.user_id) {
            next(); 
        } else {
            res.redirect('/login'); 
        }
    } catch (error) {
        console.log(error.message);
    }
};

const isLogout = async (req, res, next) => {
    try {
        if (req.session.user_id) {
            res.redirect("/"); 
        } else {
            next(); 
        }
    } catch (error) {
        console.log(error.message);
        res.status(statusCode.INTERNAL_SERVER_ERROR).json({message: responseMessage.INTERNAL_SERVER_ERROR});
    }
}

module.exports = {
    isLogin,
    isLogout
};
