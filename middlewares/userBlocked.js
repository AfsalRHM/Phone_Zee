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
        res.status(500).send('Internal Server Error');
    }
};

module.exports = {
    isBlocked,
};
