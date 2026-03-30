const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getClinics = async (req, res) => {
    try {
        const clinics = await prisma.clinic.findMany();
        res.json(clinics);
    } catch (error) {
        res.status(500).json({ error: 'Klinikler getirilirken hata oluştu.' });
    }
};

const createClinic = async (req, res) => {
    const { name, city, district } = req.body;
    try {
        const clinic = await prisma.clinic.create({
            data: { name, city, district }
        });
        res.status(201).json(clinic);
    } catch (error) {
        res.status(500).json({ error: 'Klinik oluşturulurken hata oluştu.' });
    }
};

const deleteClinic = async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.clinic.delete({
            where: { id: parseInt(id) }
        });
        res.json({ message: 'Klinik başarıyla silindi.' });
    } catch (error) {
        res.status(500).json({ error: 'Klinik silinirken hata oluştu.' });
    }
};

module.exports = { getClinics, createClinic, deleteClinic };
