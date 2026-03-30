const app = require('./src/app');
const dotenv = require('dotenv');
const logger = require('./src/utils/logger');
const http = require('http');
const { Server } = require('socket.io');

dotenv.config();

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ["GET", "POST", "PUT", "DELETE"]
    }
});

app.set('io', io);

io.on('connection', (socket) => {
    logger.info(`Yeni Websocket bağlantısı: ${socket.id}`);

    socket.on('join_room', (userId) => {
        if (userId) {
            socket.join(userId.toString());
            logger.info(`User ${userId} socket odasına katıldı.`);
        }
    });

    // --- WEBRTC TELE-SAĞLIK SİNYALİZASYONU ---

    // Aramayı Başlat
    socket.on('callUser', (data) => {
        const { userToCall, signalData, from, name } = data;
        io.to(userToCall.toString()).emit('callUser', { signal: signalData, from, name });
    });

    // Aramayı Cevapla
    socket.on('answerCall', (data) => {
        io.to(data.to.toString()).emit('callAccepted', data.signal);
    });

    // Aramayı Bitir / Reddet
    socket.on('endCall', (data) => {
        io.to(data.to.toString()).emit('callEnded');
    });

    socket.on('disconnect', () => {
        logger.info(`Websocket bağlantısı kesildi: ${socket.id}`);
        // İhtiyaç duyulursa o anki arama durumu socket üzerinden sonlandırılabilir.
    });
});

const PORT = process.env.PORT || 3000;

// Worker'ı başlat (BullMQ Notification Queue)
require('./src/workers/notificationWorker');

// Cron Job'ları başlat
require('./src/utils/cronJobs');

server.listen(PORT, () => {
    logger.info(`Sunucu ${PORT} portunda çalışıyor (MHRS v6.0 Enterprise Edition, Socket.io, BullMQ & Cron aktif)`);
});
