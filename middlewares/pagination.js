const responseMessage = require("../constants/responseMessage");
const statusCode = require("../constants/statusCode");

const paginate = (model) => {
    return async (req, res, next) => {
        try {
            const page = parseInt(req.query.page) || 1; // Get the page number from the query parameters
            const limit = parseInt(req.query.limit) || 5; // Get the limit from the query parameters

            const startIndex = (page - 1) * limit;
            const endIndex = page * limit;

            const results = {};

            results.totalPages = Math.ceil(await model.countDocuments().exec() / limit); // Calculate total pages

            if (endIndex < (await model.countDocuments().exec())) {
                results.next = {
                    page: page + 1,
                    limit: limit
                };
            }

            if (startIndex > 0) {
                results.previous = {
                    page: page - 1,
                    limit: limit
                };
            }

            results.results = await model.find().skip(startIndex).limit(limit).lean().exec(); // Fetch paginated results
            res.paginatedResults = results;
            next();
        } catch (error) {
            console.log(error.message);
            res.status(statusCode.INTERNAL_SERVER_ERROR).json({message: responseMessage.INTERNAL_SERVER_ERROR});
        }
    };
};

module.exports = paginate;