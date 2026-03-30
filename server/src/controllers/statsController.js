const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getDashboardStats = async (req, res) => {
    try {
        const [userCount, doctorCount, appointmentCount, clinicCount] = await Promise.all([
            prisma.user.count(),
            prisma.doctor.count(),
            prisma.appointment.count(),
            prisma.clinic.count(),
        ]);

        res.json({
            users: userCount,
            doctors: doctorCount,
            appointments: appointmentCount,
            clinics: clinicCount,
        });
    } catch (error) {
        res.status(500).json({ error: 'İstatistikler alınırken hata oluştu.' });
    }
};

module.exports = { getDashboardStats };
