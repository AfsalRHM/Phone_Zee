const responseMessage = require('../constants/responseMessage');
const statusCode = require('../constants/statusCode');
const User = require('../models/userModel');

const isBlocked = async (req, res, next) => {
    try {
        const userId = req.session.user_id;

        const userData = await User.findOne({ _id: userId });

        if (userData && userData.is_blocked === 1) {
            req.session.destroy();
            return res.render('login', { validationMessage: 'You are Blocked From This Site', loginOrCart: 'undefined'});
        } else {
            next();
        }

    } catch (error) {
        console.log(error.message);
        res.status(statusCode.INTERNAL_SERVER_ERROR).json({message: responseMessage.INTERNAL_SERVER_ERROR});
    }
};

module.exports = {
    isBlocked,
};
