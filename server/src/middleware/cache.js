const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 300, checkperiod: 120 }); // Liste 5 dk yaşar, 2 dk logları temizlenir

/**
 * Performans için listeleme verilerini In-Memory saklar (Listeleri 5dk önbellekler)
 * Eski Redis çökmeleri yerine güvenli RAM Caching teknolojisiyle donatıldı.
 */
const cacheMiddleware = (req, res, next) => {
    if (req.method !== 'GET') {
        return next();
    }

    const key = req.originalUrl || req.url;
    const cachedResponse = cache.get(key);

    if (cachedResponse) {
        // WebSocket üzerinden dinleyicilere hız (HIT) logu basabilir
        req.app.get('io')?.emit('log', `[Cache-HIT] En hızlı bellek yanıtı sağlandı: ${key}`);
        return res.json(cachedResponse);
    } else {
        const originalJson = res.json;
        res.json = function (body) {
            // Hatalı JSON'ı cachelemekten kaçınmak için (Global Formatter kontrolü sayesinde body.success kuralı)
            if (res.statusCode >= 200 && res.statusCode < 300 && (!body || body.success !== false)) {
                cache.set(key, body);
            }
            originalJson.call(this, body);
        };
        next();
    }
};

module.exports = cacheMiddleware;
