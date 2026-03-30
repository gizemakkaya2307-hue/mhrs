const cron = require('node-cron');
const { PrismaClient } = require('@prisma/client');
const { addNotificationToQueue } = require('./queue');
const logger = require('./logger');

const prisma = new PrismaClient();

// Her sabah saat 09:00'da 24 saat sonraki randevuları hatırlat
cron.schedule('0 9 * * *', async () => {
    logger.info('Cron Job: 24 Saat Hatırlatıcıları taranıyor...');

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const startOfTomorrow = new Date(tomorrow.setHours(0, 0, 0, 0));
    const endOfTomorrow = new Date(tomorrow.setHours(23, 59, 59, 999));

    try {
        const appointments = await prisma.appointment.findMany({
            where: {
                date: {
                    gte: startOfTomorrow,
                    lte: endOfTomorrow
                },
                status: 'CONFIRMED'
            },
            include: {
                user: true,
                doctor: true
            }
        });

        for (const app of appointments) {
            await addNotificationToQueue({
                type: 'email',
                to: app.user.email,
                subject: 'Randevu Hatırlatması',
                body: `Sayın ${app.user.name}, yarın saat ${app.date.toLocaleTimeString()} için Dr. ${app.doctor.name} ile randevunuz bulunmaktadır.`
            });
        }

        logger.info(`Cron Job: ${appointments.length} hatırlatıcı kuyruğa eklendi.`);
    } catch (error) {
        logger.error(`Cron Job Hatası (Reminder): ${error.message}`);
    }
});

// Her saat başı gerçekleşmiş randevuları COMPLETED yap
cron.schedule('0 * * * *', async () => {
    logger.info('Cron Job: Geçmiş randevular güncelleniyor...');

    try {
        const now = new Date();
        const updated = await prisma.appointment.updateMany({
            where: {
                date: {
                    lt: now
                },
                status: 'PENDING'
            },
            data: {
                status: 'COMPLETED'
            }
        });

        if (updated.count > 0) {
            logger.info(`Cron Job: ${updated.count} randevu COMPLETED olarak güncellendi.`);
        }
    } catch (error) {
        logger.error(`Cron Job Hatası (Auto-Complete): ${error.message}`);
    }
});

logger.info('Node-Cron Jobs aktif edildi.');
