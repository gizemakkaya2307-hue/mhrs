const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const writeAuditLog = async ({
    req,
    action,
    resource,
    resourceId = null,
    details = null,
    doctorId = null
}) => {
    try {
        await prisma.auditLog.create({
            data: {
                actorRole: req?.user?.role || null,
                actorName: req?.user?.email || null,
                actorUserId: req?.user?.userId || null,
                action,
                resource,
                resourceId: resourceId ? String(resourceId) : null,
                details: details ? JSON.stringify(details) : null,
                ipAddress: req?.ip || null,
                userAgent: req?.headers?.['user-agent'] || null,
                doctorId
            }
        });
    } catch (error) {
        // Audit log failures should not break business flow.
        console.error('Audit log write failed:', error.message);
    }
};

module.exports = { writeAuditLog };
