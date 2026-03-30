const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUsers() {
    try {
        const patients = await prisma.user.findMany({
            where: { role: 'USER' },
            take: 1,
            select: { email: true, name: true, role: true }
        });
        const doctors = await prisma.user.findMany({
            where: { role: 'DOCTOR' },
            take: 1,
            select: { email: true, name: true, role: true }
        });
        
        console.log("=== HASTA HESABI ===");
        console.log(patients.length > 0 ? patients[0] : "Bulunamadı");
        
        console.log("\n=== DOKTOR HESABI ===");
        console.log(doctors.length > 0 ? doctors[0] : "Bulunamadı");
    } catch (err) {
        console.error("Veritabanı okuma hatası:", err);
    } finally {
        await prisma.$disconnect();
    }
}

checkUsers();
