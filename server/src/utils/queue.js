const { Queue } = require('bullmq');
const IORedis = require('ioredis');
const logger = require('./logger');

const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

let connection = null;
let notificationQueue = null;

try {
    connection = new IORedis(REDIS_URL, {
        maxRetriesPerRequest: null,
        enableReadyCheck: false,
        lazyConnect: true // Won't connect until used
    });

    connection.on('error', (err) => {
        // Suppress logs for ECONNREFUSED after the initial one
    });

    // Mock Queue if needed
    notificationQueue = {
        add: async () => {
            logger.warn('Mock Queue used: Bildirim eklendi (fake).');
            return { id: 'mock-job' };
        }
    };
} catch (error) {
    logger.error(`Queue Başlatılamadı: ${error.message}`);
}

const addNotificationToQueue = async (data) => {
    if (!notificationQueue) {
        logger.warn(`Redis aktif değil, bildirim loglara yazılıyor: ${JSON.stringify(data)}`);
        return;
    }

    try {
        const jobName = data.type === 'email' ? 'sendEmail' : 'inAppNotification';
        await notificationQueue.add(jobName, data, {
            attempts: 3,
            backoff: {
                type: 'exponential',
                delay: 1000
            },
            removeOnComplete: true
        });
        logger.info(`İş kuyruğa eklendi: ${data.type}`);
    } catch (error) {
        logger.error(`Kuyruğa ekleme hatası: ${error.message}`);
    }
};

module.exports = { notificationQueue, addNotificationToQueue, connection };
