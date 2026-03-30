// require('express-async-errors'); // Express 5 handles async errors natively
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const logger = require('./utils/logger');
const errorMiddleware = require('./middleware/errorMiddleware');
require('dotenv').config();

const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./utils/swagger');

const app = express();

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

const morganFormat = process.env.NODE_ENV !== "production" ? "dev" : "combined";
app.use(morgan(morganFormat, {
    stream: {
        write: (message) => logger.info(message.trim())
    }
}));

const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173').split(',').map((i) => i.trim());
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
        return callback(new Error('CORS policy violation'));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Güvenlik Middleware
app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }
}));
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200, // Limit biraz artırıldı
    message: { success: false, message: 'Çok fazla istek gönderildi, lütfen biraz bekleyin.', errors: [] }
});
app.use('/api', limiter);

const path = require('path');

// Uploads dizinine public erişim izni
app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));

// Routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const doctorRoutes = require('./routes/doctors');
const appointmentRoutes = require('./routes/appointments');
const clinicRoutes = require('./routes/clinics');
const statsRoutes = require('./routes/stats');
const timeSlotRoutes = require('./routes/timeSlots');
const reviewRoutes = require('./routes/reviews');
const prescriptionRoutes = require('./routes/prescriptions');
const waitlistRoutes = require('./routes/waitlists');
const scheduleRoutes = require('./routes/schedules');
const dependentRoutes = require('./routes/dependents');
const unavailabilityRoutes = require('./routes/unavailabilities');
const uxRoutes = require('./routes/uxRoutes');
const enterpriseRoutes = require('./routes/enterprise');
const doctorPanelRoutes = require('./routes/doctorPanel');

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/clinics', clinicRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/time-slots', timeSlotRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/waitlists', waitlistRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/dependents', dependentRoutes);
app.use('/api/unavailabilities', unavailabilityRoutes);
app.use('/api/ux', uxRoutes);
app.use('/api/enterprise', enterpriseRoutes);
app.use('/api/doctor-panel', doctorPanelRoutes);

app.get('/', (req, res) => {
    res.send('Hastane Randevu Sistemi API Çalışıyor (v2 Enterprise)');
});

// Error Handler (En sonda olmalı)
app.use(errorMiddleware);

module.exports = app;
