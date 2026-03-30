const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function createTestAccounts() {
    try {
        const passwordHash = await bcrypt.hash('12345678', 10);
        
        let doctorUser = await prisma.user.findFirst({ where: { email: 'dr_gizem@mhrs.gov.tr' } });
        if (!doctorUser) {
            doctorUser = await prisma.user.create({
                data: {
                    name: 'Uzman Dr. Gizem Akkaya',
                    email: 'dr_gizem@mhrs.gov.tr',
                    password: passwordHash,
                    tcNo: '11111111111',
                    role: 'DOCTOR',
                    is2FAEnabled: false
                }
            });
            console.log("Test Doktoru oluşturuldu:", doctorUser.email);
            
            await prisma.doctor.create({
                data: {
                    name: doctorUser.name,
                    branch: 'Kardiyoloji',
                    hospital: 'Ankara Bilkent Şehir Hastanesi',
                    userId: doctorUser.id
                }
            });
            console.log("Doktor detayları eklendi.");
        } else {
            console.log("Doktor hesabı zaten mevcut.");
        }
        
        // Hasta hesabının is2FAEnabled özelliğini false yapalım ki browser'dan girerken MFA ile uğraşmayalım
        await prisma.user.updateMany({
            where: { email: 'gizemakkaya23007@gmail.com' },
            data: { is2FAEnabled: false, password: passwordHash }
        });
        console.log("Hasta şifresi '12345678' (ve 2FA kapalı) yapıldı.");
    } catch (err) {
        console.error("Hata:", err);
    } finally {
        await prisma.$disconnect();
    }
}

createTestAccounts();
