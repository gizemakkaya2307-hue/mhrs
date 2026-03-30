import { useEffect } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function SocketListener() {
    const { user } = useAuth();

    useEffect(() => {
        if (!user) return;

        // Connect to Socket.io server
        const socket = io('http://localhost:3000', {
            transports: ['websocket', 'polling'] // Support both
        });

        socket.on('connect', () => {
            console.log('Socket.io bağlandı');
            // Join user specific room to get direct notifications
            socket.emit('join_room', user.id || user.userId);
        });

        socket.on('notification', (data) => {
            // Toast notification depending on the type
            if (data.type === 'success') {
                toast.success(data.message);
            } else if (data.type === 'error') {
                toast.error(data.message);
            } else if (data.type === 'warning') {
                toast(data.message, { icon: '⚠️' });
            } else {
                toast(data.message, { icon: 'ℹ️' });
            }
        });

        socket.on('slot:update', (data) => {
            toast(`Slot güncellendi: Doktor #${data.doctorId}`, { icon: '🕒' });
        });

        return () => {
            socket.disconnect();
        };
    }, [user]);

    return null; // This component doesn't render anything visually
}
