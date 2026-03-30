const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.toggleFavorite = async (req, res) => {
    const { doctorId } = req.body;
    const userId = req.user.id;

    try {
        const existing = await prisma.favoriteDoctor.findUnique({
            where: {
                userId_doctorId: { userId, doctorId: parseInt(doctorId) }
            }
        });

        if (existing) {
            await prisma.favoriteDoctor.delete({
                where: { id: existing.id }
            });
            return res.json({ message: 'Doktor favorilerden çıkarıldı.', favorited: false });
        }

        const favorite = await prisma.favoriteDoctor.create({
            data: { userId, doctorId: parseInt(doctorId) }
        });
        res.status(201).json({ message: 'Doktor favorilere eklendi.', favorited: true, favorite });
    } catch (error) {
        res.status(500).json({ error: 'Favori işlemi başarısız.' });
    }
};

exports.getFavorites = async (req, res) => {
    const userId = req.user.id;
    try {
        const favorites = await prisma.favoriteDoctor.findMany({
            where: { userId },
            include: {
                doctor: {
                    include: { clinic: true }
                }
            }
        });
        res.json(favorites);
    } catch (error) {
        res.status(500).json({ error: 'Favoriler listelenemedi.' });
    }
};
