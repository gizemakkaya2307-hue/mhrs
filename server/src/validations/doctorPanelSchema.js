const { z } = require('zod');

const doctorDailyQuerySchema = z.object({
    date: z.string().optional()
});

const appointmentParamSchema = z.object({
    appointmentId: z.coerce.number().int().positive()
});

const patientParamSchema = z.object({
    patientUserId: z.coerce.number().int().positive()
});

const clinicalNoteSchema = z.object({
    diagnosis: z.string().min(2).max(500),
    examinationNote: z.string().min(2).max(3000),
    prescriptionItems: z.array(z.object({
        medicineName: z.string().min(2).max(120),
        dosage: z.string().min(1).max(100),
        frequency: z.string().min(1).max(120),
        durationDays: z.coerce.number().int().min(1).max(365),
        instructions: z.string().max(500).optional().nullable()
    })).max(20).optional().default([])
});

const appointmentStatusSchema = z.object({
    status: z.enum(['COMPLETED', 'NO_SHOW', 'CANCELLED', 'CONFIRMED', 'PENDING'])
});

module.exports = {
    doctorDailyQuerySchema,
    appointmentParamSchema,
    patientParamSchema,
    clinicalNoteSchema,
    appointmentStatusSchema
};
