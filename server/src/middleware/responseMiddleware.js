/**
 * Global Response Formatter (Interceptor)
 * Express.js üzerindeki tüm endpoint JSON çıkışlarını tek kalıba sokar.
 */
const responseInterceptor = (req, res, next) => {
    const originalJson = res.json;

    res.json = function (data) {
        // Zaten formatlanmış (Örn: appointmentController'da yazıldıysa) pas geç.
        if (data && data.success !== undefined) {
            return originalJson.call(this, data);
        }

        const isSuccess = res.statusCode >= 200 && res.statusCode < 300;
        let message = isSuccess ? 'İşlem Başarılı' : 'Sistem Hatası / İşlem Başarısız';
        let responseData = data;

        // Custom error handler formated errors:
        if (!isSuccess && data && data.error) {
            message = data.error;
            responseData = null;
        }

        const formattedResponse = {
            success: isSuccess,
            message: message,
            data: responseData
        };

        return originalJson.call(this, formattedResponse);
    };

    next();
};

module.exports = responseInterceptor;
