const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const logger = require('../utils/logger');

// Bekleme listesine katıl
const joinWaitlist = async (req, res) => {
    const { doctorId, date } = req.body;

    if (!doctorId || !date) {
        return res.status(400).json({ error: 'Doktor ve tarih bilgisi gereklidir.' });
    }

    try {
        const existing = await prisma.waitingList.findFirst({
            where: {
                userId: req.user.userId,
                doctorId: parseInt(doctorId),
                date: new Date(date)
            }
        });

        if (existing) {
            return res.status(400).json({ error: 'Bu doktor için seçilen tarihte zaten bekleme listesindesiniz.' });
        }

        const waitlistItem = await prisma.waitingList.create({
            data: {
                userId: req.user.userId,
                doctorId: parseInt(doctorId),
                date: new Date(date)
            }
        });

        res.status(201).json({ message: 'Bekleme listesine başarıyla eklendiniz. Randevu iptali olursa tarafınıza bildirim gönderilecektir.', item: waitlistItem });
    } catch (error) {
        logger.error('Waitlist join error: ', error);
        res.status(500).json({ error: 'Bekleme listesine eklenirken hata oluştu' });
    }
};

// Bekleme listesinden çık
const leaveWaitlist = async (req, res) => {
    const { id } = req.params;

    try {
        const record = await prisma.waitingList.findUnique({ where: { id: parseInt(id) } });

        if (!record || record.userId !== req.user.userId) {
            return res.status(404).json({ error: 'Kayıt bulunamadı veya yetkiniz yok.' });
        }

        await prisma.waitingList.delete({ where: { id: parseInt(id) } });
        res.json({ message: 'Bekleme listesinden çıkıldı.' });
    } catch (error) {
        logger.error('Waitlist leave error: ', error);
        res.status(500).json({ error: 'Silme işlemi başarısız' });
    }
};

// Kullanıcının bekleme listelerini getir
const getUserWaitlists = async (req, res) => {
    try {
        const lists = await prisma.waitingList.findMany({
            where: { userId: req.user.userId },
            include: { doctor: true }
        });
        res.json(lists);
    } catch (error) {
        res.status(500).json({ error: 'Liste getirilemedi' });
    }
};

module.exports = { joinWaitlist, leaveWaitlist, getUserWaitlists };
