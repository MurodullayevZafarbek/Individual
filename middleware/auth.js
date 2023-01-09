const JWT = require("jsonwebtoken");
const asyncHandler = require("./async");
const ErrorResponse = require("./errorResponse");
const User = require("../model/user");

// Protect routes

exports.checkToken = asyncHandler(async(req, res, next) => {
    let token;
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
        return next(
            new ErrorResponse("No authorize to access this route", 401)
        );
    }
    try {
        //  verify token
        const decoded = JWT.verify(token, process.env.JWT_KEY);
        // console.log(decoded);
        req.user = await User.findById(decoded.id);
        next();
    } catch (err) {
        return next(
            new ErrorResponse("No authorize to access this route", 401)
        );
    }
});
exports.checkRole = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(
                new ErrorResponse(
                    `User role ${req.user.role} is not authorized to access this route`,
                    403
                )
            );
        }
        next();
    };
};
