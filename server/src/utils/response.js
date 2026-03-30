const sendSuccess = (res, message, data = null, statusCode = 200) => {
    return res.status(statusCode).json({
        success: true,
        message,
        data
    });
};

const sendError = (res, message, errors = [], statusCode = 500) => {
    return res.status(statusCode).json({
        success: false,
        message,
        errors
    });
};

const createHttpError = (statusCode, message, errors = []) => {
    const err = new Error(message);
    err.statusCode = statusCode;
    err.errors = errors;
    return err;
};

module.exports = { sendSuccess, sendError, createHttpError };
