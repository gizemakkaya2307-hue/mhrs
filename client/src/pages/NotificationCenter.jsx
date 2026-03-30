import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import api from '../services/api';

export default function NotificationCenter() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchNotifications = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await api.get('/enterprise/notifications');
            setItems(res.data);
        } catch {
            setError('Bildirimler alınamadı.');
        } finally {
            setLoading(false);
        }
    };

    // eslint-disable-next-line react-hooks/set-state-in-effect
    useEffect(() => { fetchNotifications(); }, []);

    const markRead = async (id) => {
        await api.patch(`/enterprise/notifications/${id}/read`);
        setItems((prev) => prev.map((i) => (i.id === id ? { ...i, isRead: true } : i)));
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />
            <main className="max-w-4xl mx-auto p-6">
                <h1 className="text-2xl font-bold text-slate-900 mb-4">Bildirim Merkezi</h1>
                {loading && <div className="bg-white rounded-xl p-4 shadow">Yükleniyor...</div>}
                {error && <div className="bg-red-50 text-red-600 rounded-xl p-4">{error}</div>}
                {!loading && !error && items.length === 0 && <div className="bg-white rounded-xl p-4 shadow">Henüz bildiriminiz yok.</div>}
                <div className="space-y-3">
                    {items.map((item) => (
                        <div key={item.id} className={`bg-white rounded-xl p-4 shadow border transition-all ${item.isRead ? 'border-slate-100' : 'border-indigo-200'}`}>
                            <div className="flex justify-between items-start gap-4">
                                <div>
                                    <p className="font-semibold text-slate-800">{item.title}</p>
                                    <p className="text-sm text-slate-600 mt-1">{item.message}</p>
                                </div>
                                {!item.isRead && (
                                    <button className="text-xs px-3 py-1 rounded bg-indigo-600 text-white" onClick={() => markRead(item.id)}>Okundu</button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}
