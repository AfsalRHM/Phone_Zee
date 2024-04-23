const isLogin = async (req, res, next) => {
    try {
        if (req.session.admin_id) {
            next(); 
        } else {
            res.redirect('/admin/login'); 
        }
    } catch (error) {
        console.log(error.message);
    }
};

const isLogout = async (req, res, next) => {
    try {
        if (!req.session.admin_id) {
            next();
        } else {
            res.redirect('/admin');
        }
    } catch (error) {
        console.log(error.message);
    }
};

module.exports = {
    isLogin,
    isLogout
};