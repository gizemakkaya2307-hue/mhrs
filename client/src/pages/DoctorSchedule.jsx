import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';

export default function DoctorSchedule() {
    const { user } = useAuth();
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [startTime, setStartTime] = useState('09:00');
    const [endTime, setEndTime] = useState('17:00');
    const [interval, setInterval] = useState(30);
    const [loading, setLoading] = useState(false);
    const [existingSlots, setExistingSlots] = useState([]);

    const fetchSlots = async () => {
        if (!user) return;
        try {
            const res = await api.get(`/time-slots/doctor/${user.id}?date=${date}`);
            setExistingSlots(res.data);
        } catch (err) {
            console.error('Slotlar yüklenemedi');
        }
    };

    useEffect(() => {
        fetchSlots();
    }, [date, user]);

    const handleGenerate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/schedules/generate', {
                doctorId: user.id,
                date,
                startTime,
                endTime,
                intervalMinutes: parseInt(interval)
            });
            toast.success('Mesai dilimleri başarıyla oluşturuldu!');
            fetchSlots();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Mesai oluşturulamadı.');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteSlots = async () => {
        if (!confirm('Bu tarihteki dolmamış tüm randevu dilimlerini silmek istediğinize emin misiniz?')) return;
        try {
            await api.delete(`/schedules/doctor/${user.id}?date=${date}`);
            toast.success('Mesai dilimleri temizlendi.');
            fetchSlots();
        } catch (err) {
            toast.error('Silme işlemi başarısız.');
        }
    };

    if (user?.role !== 'DOCTOR' && user?.role !== 'ADMIN') {
        return <div className="p-8 text-center text-red-600 font-bold">Bu sayfaya erişim yetkiniz yok.</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 text-black">
            <Navbar />
            <div className="max-w-4xl mx-auto py-10 px-4">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                    <div className="bg-indigo-600 p-8 text-white">
                        <h1 className="text-2xl font-bold">Mesai ve Randevu Yönetimi</h1>
                        <p className="mt-2 text-indigo-100">Çalışma saatlerinizi belirleyin ve randevu slotlarını otomatik oluşturun.</p>
                    </div>

                    <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-12">
                        {/* Form */}
                        <form onSubmit={handleGenerate} className="space-y-6">
                            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                <span className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center text-sm">1</span>
                                Planlama Yap
                            </h2>

                            <div>
                                <label className="block text-sm font-semibold text-gray-600 mb-2">Tarih Seçin</label>
                                <input
                                    type="date"
                                    className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                    value={date}
                                    min={new Date().toISOString().split('T')[0]}
                                    onChange={(e) => setDate(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-600 mb-2">Başlangıç</label>
                                    <input
                                        type="time"
                                        className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                        value={startTime}
                                        onChange={(e) => setStartTime(e.target.value)}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-600 mb-2">Bitiş</label>
                                    <input
                                        type="time"
                                        className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                        value={endTime}
                                        onChange={(e) => setEndTime(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-600 mb-2">Randevu Aralığı (Dakika)</label>
                                <select
                                    className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                    value={interval}
                                    onChange={(e) => setInterval(e.target.value)}
                                >
                                    <option value="15">15 Dakika</option>
                                    <option value="20">20 Dakika</option>
                                    <option value="30">30 Dakika</option>
                                    <option value="45">45 Dakika</option>
                                    <option value="60">1 Saat</option>
                                </select>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 disabled:opacity-50"
                                >
                                    {loading ? 'Oluşturuluyor...' : 'Slotları Üret'}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleDeleteSlots}
                                    className="px-4 border border-red-200 text-red-600 rounded-xl hover:bg-red-50 transition-all"
                                    title="Boş slotları temizle"
                                >
                                    Temizle
                                </button>
                            </div>
                        </form>

                        {/* Preview */}
                        <div className="space-y-6">
                            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                <span className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center text-sm">2</span>
                                Mevcut Slotlar ({existingSlots.length})
                            </h2>
                            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 max-h-[400px] overflow-y-auto">
                                {existingSlots.length === 0 ? (
                                    <p className="text-center text-gray-400 py-10 italic">Bu tarih için henüz planlama yapılmamış.</p>
                                ) : (
                                    <div className="grid grid-cols-3 gap-2">
                                        {existingSlots.map(slot => (
                                            <div
                                                key={slot.id}
                                                className={`p-2 text-center rounded-lg text-xs font-bold border ${slot.isBooked ? 'bg-indigo-100 text-indigo-700 border-indigo-200' : 'bg-white text-gray-600 border-gray-200 shadow-sm'}`}
                                            >
                                                {new Date(slot.startTime).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                                {slot.isBooked && <span className="block text-[8px] uppercase">Dolu</span>}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
