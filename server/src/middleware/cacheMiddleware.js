const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 300, checkperiod: 120 }); // 5 dk yaşar, 2 dk'da bir temizlik kontrolü

/**
 * Performans için listeleme verilerini In-Memory saklar
 */
const cacheMiddleware = (req, res, next) => {
    // Sadece GET isteklerini cache'le
    if (req.method !== 'GET') {
        return next();
    }

    const key = req.originalUrl || req.url;
    const cachedResponse = cache.get(key);

    if (cachedResponse) {
        req.app.get('io')?.emit('log', `[Cache-HIT] En hızlı yanıt sağlandı: ${key}`);
        return res.json(cachedResponse);
    } else {
        // res.json metoduna müdahale edip veriyi önce cache'e sonra hedefe gönderiyoruz
        const originalJson = res.json;
        res.json = function (body) {
            // Sadece başarılı cevapları cache'e kaydet (Standard response format checker: body.success !== false)
            if (res.statusCode >= 200 && res.statusCode < 300 && (!body || body.success !== false)) {
                cache.set(key, body);
            }
            originalJson.call(this, body);
        };
        next();
    }
};

module.exports = { cacheMiddleware, cache };
