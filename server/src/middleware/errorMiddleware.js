const errorMiddleware = (err, req, res, next) => {
    console.error(err.stack);

    const statusCode = err.statusCode || 500;
    const message = err.message || 'Sunucu tarafında bir hata oluştu.';

    // Zod veya benzeri doğrulama hataları için özel format
    if (err.name === 'ZodError') {
        return res.status(400).json({
            success: false,
            message: 'Doğrulama hatası',
            errors: err.errors.map(e => ({ path: e.path.join('.'), message: e.message }))
        });
    }

    res.status(statusCode).json({
        success: false,
        message,
        errors: err.errors || (process.env.NODE_ENV === 'production' ? [] : [{ stack: err.stack }])
    });
};

module.exports = errorMiddleware;
