import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function HealthProfile() {
    const [form, setForm] = useState({
        bloodType: '',
        allergies: '',
        chronicConditions: '',
        medications: '',
        emergencyContact: '',
        notes: ''
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/enterprise/health-profile').then((res) => {
            if (res.data) setForm((prev) => ({ ...prev, ...res.data }));
        }).finally(() => setLoading(false));
    }, []);

    const onSave = async (e) => {
        e.preventDefault();
        await api.put('/enterprise/health-profile', form);
        toast.success('Sağlık profili güncellendi.');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <main className="max-w-3xl mx-auto p-6">
                <h1 className="text-2xl font-bold mb-4">Sağlık Geçmişi Profili</h1>
                {loading ? <div className="bg-white p-4 rounded-xl shadow">Yükleniyor...</div> : (
                    <form onSubmit={onSave} className="bg-white p-6 rounded-xl shadow space-y-3">
                        <input className="w-full border rounded p-2" placeholder="Kan grubu" value={form.bloodType || ''} onChange={(e) => setForm({ ...form, bloodType: e.target.value })} />
                        <textarea className="w-full border rounded p-2" placeholder="Alerjiler" value={form.allergies || ''} onChange={(e) => setForm({ ...form, allergies: e.target.value })} />
                        <textarea className="w-full border rounded p-2" placeholder="Kronik hastalıklar" value={form.chronicConditions || ''} onChange={(e) => setForm({ ...form, chronicConditions: e.target.value })} />
                        <textarea className="w-full border rounded p-2" placeholder="Kullandığı ilaçlar" value={form.medications || ''} onChange={(e) => setForm({ ...form, medications: e.target.value })} />
                        <input className="w-full border rounded p-2" placeholder="Acil durumda aranacak kişi" value={form.emergencyContact || ''} onChange={(e) => setForm({ ...form, emergencyContact: e.target.value })} />
                        <textarea className="w-full border rounded p-2" placeholder="Ek notlar" value={form.notes || ''} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
                        <button className="w-full bg-indigo-600 text-white rounded p-2">Kaydet</button>
                    </form>
                )}
            </main>
        </div>
    );
}
