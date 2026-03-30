const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');

async function fixUsers() {
    try {
        // Disable 2FA for the main user
        await prisma.user.updateMany({
            where: { email: 'gizemakkaya23007@gmail.com' },
            data: { is2FAEnabled: false }
        });

        // Set password for admin@admin.com to 'admin123'
        const hashedPassword = await bcrypt.hash('admin123', 10);
        await prisma.user.updateMany({
            where: { email: 'admin@admin.com' },
            data: { password: hashedPassword }
        });

        console.log('--- USERS FIXED ---');
        console.log('1. gizemakkaya23007@gmail.com: 2FA disabled');
        console.log('2. admin@admin.com: Password reset to admin123');
    } catch (error) {
        console.error('Error fixing users:', error);
    } finally {
        await prisma.$disconnect();
    }
}

fixUsers();
