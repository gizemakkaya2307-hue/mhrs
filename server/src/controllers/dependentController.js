const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.addDependent = async (req, res) => {
    const { name, tcNo, birthDate, relation } = req.body;
    const userId = req.user.userId;

    try {
        const dependent = await prisma.dependent.create({
            data: {
                name,
                tcNo,
                birthDate: new Date(birthDate),
                relation,
                userId
            }
        });
        res.status(201).json(dependent);
    } catch (error) {
        res.status(400).json({ error: 'Bağlı kişi eklenemedi (TC No benzersiz olmalıdır).' });
    }
};

exports.getDependents = async (req, res) => {
    const userId = req.user.id;
    try {
        const dependents = await prisma.dependent.findMany({
            where: { userId }
        });
        res.json(dependents);
    } catch (error) {
        res.status(500).json({ error: 'Bağlı kişiler listelenemedi.' });
    }
};

exports.deleteDependent = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    try {
        const dependent = await prisma.dependent.findFirst({
            where: { id: parseInt(id), userId }
        });

        if (!dependent) return res.status(404).json({ error: 'Bağlı kişi bulunamadı.' });

        await prisma.dependent.delete({ where: { id: parseInt(id) } });
        res.json({ message: 'Bağlı kişi silindi.' });
    } catch (error) {
        res.status(500).json({ error: 'Bağlı kişi silinemedi.' });
    }
};
