const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getAllUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                tcNo: true,
                role: true,
                createdAt: true
            }
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: 'Kullanıcılar listelenemedi.' });
    }
};

const updateUserRole = async (req, res) => {
    const { id } = req.params;
    const { role } = req.body;
    try {
        const user = await prisma.user.update({
            where: { id: parseInt(id) },
            data: { role }
        });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Rol güncellenemedi.' });
    }
};

const deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.user.delete({ where: { id: parseInt(id) } });
        res.json({ message: 'Kullanıcı silindi.' });
    } catch (error) {
        res.status(500).json({ error: 'Kullanıcı silinemedi.' });
    }
};

const getProfile = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.userId },
            select: { id: true, name: true, email: true, tcNo: true, role: true }
        });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Profil alınamadı.' });
    }
};

const updateProfile = async (req, res) => {
    const { name, email } = req.body;
    try {
        const user = await prisma.user.update({
            where: { id: req.user.userId },
            data: { name, email }
        });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Profil güncellenemedi.' });
    }
};

const toggle2FA = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
        if (!user) return res.status(404).json({ error: 'Kullanıcı bulunamadı.' });

        const updatedUser = await prisma.user.update({
            where: { id: req.user.userId },
            data: { is2FAEnabled: !user.is2FAEnabled }
        });

        res.json({ message: `2FA ${updatedUser.is2FAEnabled ? 'aktif' : 'pasif'} edildi.`, is2FAEnabled: updatedUser.is2FAEnabled });
    } catch (error) {
        res.status(500).json({ error: '2FA ayarı değiştirilemedi.' });
    }
};

module.exports = { getAllUsers, updateUserRole, deleteUser, getProfile, updateProfile, toggle2FA };
