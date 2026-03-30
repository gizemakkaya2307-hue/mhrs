const logger = require('../utils/logger');

// Mock worker to prevent Redis ECONNREFUSED errors
const worker = {
    on: () => {}
};

logger.info('BullMQ Notification Worker devredışı bırakıldı (Mock).');

module.exports = worker;
