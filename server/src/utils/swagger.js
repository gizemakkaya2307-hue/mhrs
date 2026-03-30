const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Hastane Randevu Sistemi (MHRS) API',
            version: '7.0.0',
            description: 'Kurumsal seviyede MHRS API dokümantasyonu. Auth, randevu, doktor paneli, audit log, notification center, lab ve reçete modülleri dahildir.',
            contact: {
                name: 'MHRS Enterprise Dev Team',
            },
        },
        servers: [
            {
                url: 'http://localhost:3000',
                description: 'Local Geliştirme Sunucusu',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
            schemas: {
                User: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer' },
                        email: { type: 'string', format: 'email' },
                        name: { type: 'string' },
                        tcNo: { type: 'string' },
                        role: { type: 'string', enum: ['USER', 'DOCTOR', 'ADMIN'] },
                        is2FAEnabled: { type: 'boolean' },
                        createdAt: { type: 'string', format: 'date-time' },
                    },
                },
                Doctor: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer' },
                        name: { type: 'string' },
                        branch: { type: 'string' },
                        hospital: { type: 'string' },
                        userId: { type: 'integer', nullable: true },
                        clinicId: { type: 'integer', nullable: true },
                    },
                },
                Appointment: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer' },
                        date: { type: 'string', format: 'date-time' },
                        status: { type: 'string', enum: ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'] },
                        notes: { type: 'string', nullable: true },
                        userId: { type: 'integer' },
                        doctorId: { type: 'integer' },
                        dependentId: { type: 'integer', nullable: true },
                        createdAt: { type: 'string', format: 'date-time' },
                    },
                },
                Clinic: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer' },
                        name: { type: 'string' },
                        city: { type: 'string' },
                        district: { type: 'string' },
                    },
                },
                TimeSlot: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer' },
                        startTime: { type: 'string', format: 'date-time' },
                        endTime: { type: 'string', format: 'date-time' },
                        isBooked: { type: 'boolean' },
                        doctorId: { type: 'integer' },
                    },
                },
                Review: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer' },
                        rating: { type: 'integer', minimum: 1, maximum: 5 },
                        comment: { type: 'string', nullable: true },
                        userId: { type: 'integer' },
                        doctorId: { type: 'integer' },
                        createdAt: { type: 'string', format: 'date-time' },
                    },
                },
                Prescription: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer' },
                        fileName: { type: 'string' },
                        filePath: { type: 'string' },
                        notes: { type: 'string', nullable: true },
                        appointmentId: { type: 'integer' },
                        createdAt: { type: 'string', format: 'date-time' },
                    },
                },
                PrescriptionItem: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer' },
                        medicineName: { type: 'string' },
                        dosage: { type: 'string' },
                        frequency: { type: 'string' },
                        durationDays: { type: 'integer' },
                        instructions: { type: 'string', nullable: true },
                        appointmentId: { type: 'integer' },
                    },
                },
                LabResult: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer' },
                        testName: { type: 'string' },
                        resultValue: { type: 'string' },
                        unit: { type: 'string', nullable: true },
                        referenceRange: { type: 'string', nullable: true },
                        status: { type: 'string', enum: ['NORMAL', 'ABNORMAL', 'CRITICAL'] },
                        appointmentId: { type: 'integer' },
                    },
                },
                Notification: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer' },
                        title: { type: 'string' },
                        message: { type: 'string' },
                        type: { type: 'string' },
                        isRead: { type: 'boolean' },
                        userId: { type: 'integer' },
                        createdAt: { type: 'string', format: 'date-time' },
                    },
                },
                Dependent: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer' },
                        name: { type: 'string' },
                        tcNo: { type: 'string' },
                        birthDate: { type: 'string', format: 'date-time' },
                        relation: { type: 'string' },
                        userId: { type: 'integer' },
                    },
                },
                WaitingList: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer' },
                        date: { type: 'string', format: 'date-time' },
                        userId: { type: 'integer' },
                        doctorId: { type: 'integer' },
                    },
                },
                HealthProfile: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer' },
                        bloodType: { type: 'string', nullable: true },
                        allergies: { type: 'string', nullable: true },
                        chronicConditions: { type: 'string', nullable: true },
                        medications: { type: 'string', nullable: true },
                        emergencyContact: { type: 'string', nullable: true },
                        userId: { type: 'integer' },
                    },
                },
                Unavailability: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer' },
                        startTime: { type: 'string', format: 'date-time' },
                        endTime: { type: 'string', format: 'date-time' },
                        reason: { type: 'string' },
                        doctorId: { type: 'integer' },
                    },
                },
                AuditLog: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer' },
                        action: { type: 'string' },
                        resource: { type: 'string' },
                        resourceId: { type: 'string', nullable: true },
                        details: { type: 'string', nullable: true },
                        actorUserId: { type: 'integer', nullable: true },
                        createdAt: { type: 'string', format: 'date-time' },
                    },
                },
                SuccessResponse: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: true },
                        message: { type: 'string' },
                        data: { type: 'object' },
                    },
                },
                ErrorResponse: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: false },
                        message: { type: 'string' },
                        errors: { type: 'array', items: { type: 'string' } },
                    },
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    apis: ['./src/routes/*.js'],
};

const specs = swaggerJsdoc(options);
module.exports = specs;
