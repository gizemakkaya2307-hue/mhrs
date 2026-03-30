const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const logger = require('../utils/logger');

// Bu aşamada dosya multer ile upload ediliyor varsayılacaktır.
// Multer middleware'i route seviyesinde req.file içerisini doldurur.

const uploadPrescription = async (req, res) => {
    const { appointmentId, notes } = req.body;

    if (!req.file) {
        return res.status(400).json({ error: 'Lütfen yüklenecek bir dosya seçin.' });
    }

    try {
        // İlgili randevunun doktor tarafından onaylandığını kontrol edebiliriz
        // veya doktorun kendi hastasına dosya yükleyip yüklemediğine bakabiliriz.

        const appointment = await prisma.appointment.findUnique({
            where: { id: parseInt(appointmentId) }
        });

        if (!appointment) {
            return res.status(404).json({ error: 'Randevu bulunamadı.' });
        }

        // Sadece Doktor veya Admin dosya/reçete yükleyebilir kontrolü auth middleware'inde olacak

        const prescription = await prisma.prescription.create({
            data: {
                fileName: req.file.originalname,
                filePath: `/uploads/${req.file.filename}`, // Local storage URL
                notes: notes || '',
                appointmentId: parseInt(appointmentId)
            }
        });

        // İstersek hastaya bir bildirim de gönderebiliriz.
        const io = req.app.get('io');
        if (io) {
            io.to(appointment.userId.toString()).emit('notification', {
                type: 'info',
                message: 'Randevunuza yeni bir dosya/reçete eklendi.'
            });
        }

        res.status(201).json(prescription);
    } catch (error) {
        logger.error('Reçete/Dosya yükleme hatası: ', error);
        res.status(500).json({ error: 'Dosya kaydedilirken veritabanı hatası oluştu.' });
    }
};

const getPrescriptionsByAppointment = async (req, res) => {
    const { appointmentId } = req.params;

    try {
        const prescriptions = await prisma.prescription.findMany({
            where: { appointmentId: parseInt(appointmentId) },
            orderBy: { createdAt: 'desc' }
        });

        res.json(prescriptions);
    } catch (error) {
        logger.error('Reçete okuma hatası: ', error);
        res.status(500).json({ error: 'Dosyalar getirilirken hata oluştu.' });
    }
};

const deletePrescription = async (req, res) => {
    const { id } = req.params;

    try {
        await prisma.prescription.delete({
            where: { id: parseInt(id) }
        });

        // Ek olarak dosya sisteminden (fs.unlink) dosyanın fiziksel olarak silinmesi gerekir.
        // Şimdilik sadece veritabanından siliyoruz.
        res.json({ message: 'Dosya başarıyla silindi.' });
    } catch (error) {
        logger.error('Reçete silme hatası: ', error);
        res.status(500).json({ error: 'Dosya silinirken hata oluştu.' });
    }
}

module.exports = { uploadPrescription, getPrescriptionsByAppointment, deletePrescription };
