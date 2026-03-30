const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const getDoctors = async (req, res) => {
    const { branch, city, district, clinicId } = req.query;
    try {
        const whereClause = {};
        if (branch) whereClause.branch = { contains: branch, mode: 'insensitive' };

        if (city || district || clinicId) {
            whereClause.clinic = {
                is: {
                    ...(city && { city: { contains: city, mode: 'insensitive' } }),
                    ...(district && { district: { contains: district, mode: 'insensitive' } }),
                    ...(clinicId && { id: parseInt(clinicId) })
                }
            };
        }

        const doctors = await prisma.doctor.findMany({
            where: whereClause,
            include: {
                clinic: true,
                reviews: true
            }
        });
        res.json(doctors);
    } catch (error) {
        res.status(500).json({ error: 'Doktorlar listelenirken hata oluştu' });
    }
};

const createDoctor = async (req, res) => { // Admin only in real app
    const { name, branch, hospital, clinicId, userId } = req.body;
    try {
        const doctor = await prisma.doctor.create({
            data: {
                name,
                branch,
                hospital,
                clinicId: clinicId ? parseInt(clinicId) : null,
                userId: userId ? parseInt(userId) : null
            },
        });
        res.status(201).json(doctor);
    } catch (error) {
        res.status(500).json({ error: 'Doktor eklenirken hata oluştu' });
    }
};

const deleteDoctor = async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.doctor.delete({
            where: { id: parseInt(id) },
        });
        res.json({ message: 'Doktor başarıyla silindi' });
    } catch (error) {
        res.status(500).json({ error: 'Doktor silinirken hata oluştu' });
    }
};

module.exports = { getDoctors, createDoctor, deleteDoctor };
