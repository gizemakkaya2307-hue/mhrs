import { useState, useEffect } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';

export default function Dependents() {
    const [dependents, setDependents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        tcNo: '',
        birthDate: '',
        relation: 'Çocuğu'
    });

    const fetchDependents = async () => {
        try {
            const res = await api.get('/dependents');
            setDependents(res.data);
        } catch {
            toast.error('Bağlı kişiler yüklenemedi.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDependents();
    }, []);

    const handleAddDependent = async (e) => {
        e.preventDefault();
        try {
            await api.post('/dependents', formData);
            toast.success('Bağlı kişi başarıyla eklendi.');
            setShowAddModal(false);
            setFormData({ name: '', tcNo: '', birthDate: '', relation: 'Çocuğu' });
            fetchDependents();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Ekleme başarısız.');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Bu kişiyi silmek istediğinize emin misiniz?')) return;
        try {
            await api.delete(`/dependents/${id}`);
            toast.success('Kişi silindi.');
            fetchDependents();
        } catch {
            toast.error('Silme işlemi başarısız.');
        }
    };

    if (loading) return <div className="p-8 text-center font-bold">Yükleniyor...</div>;

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100">
            <Navbar />
            <div className="mx-auto max-w-7xl py-12 px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-extrabold text-indigo-900">Aile Fertlerim</h1>
                        <p className="text-indigo-600 mt-1 uppercase text-xs tracking-widest font-bold">MHRS v7.0 Bağlı Kişi Yönetimi</p>
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-200 flex items-center gap-2"
                    >
                        <span>+</span> Yeni Bağlı Kişi Ekle
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {dependents.length === 0 ? (
                        <div className="col-span-3 bg-white/40 backdrop-blur-md p-12 rounded-3xl border border-white/50 text-center">
                            <p className="text-indigo-900/60 font-medium">Henüz bir bağlı kişi eklememişsiniz.</p>
                        </div>
                    ) : (
                        dependents.map(dep => (
                            <div key={dep.id} className="bg-white/60 backdrop-blur-xl p-6 rounded-3xl border border-white/80 shadow-xl hover:scale-[1.02] transition-transform">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 text-xl">
                                        👤
                                    </div>
                                    <button onClick={() => handleDelete(dep.id)} className="text-red-400 hover:text-red-600 text-xl">×</button>
                                </div>
                                <h3 className="text-lg font-bold text-indigo-900">{dep.name}</h3>
                                <p className="text-sm text-indigo-500 font-semibold mb-3">{dep.relation}</p>
                                <div className="space-y-1">
                                    <p className="text-xs text-gray-500 flex justify-between"><span>TC No:</span> <span className="text-gray-800 font-medium">{dep.tcNo}</span></p>
                                    <p className="text-xs text-gray-500 flex justify-between"><span>Doğum Tarihi:</span> <span className="text-gray-800 font-medium">{new Date(dep.birthDate).toLocaleDateString('tr-TR')}</span></p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Add Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-indigo-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">Yeni Yakınını Ekle</h2>
                        <form onSubmit={handleAddDependent} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Ad Soyad</label>
                                <input
                                    required
                                    className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">TC Kimlik No</label>
                                <input
                                    required
                                    maxLength={11}
                                    className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500"
                                    value={formData.tcNo}
                                    onChange={e => setFormData({ ...formData, tcNo: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Doğum Tarihi</label>
                                    <input
                                        required
                                        type="date"
                                        className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500"
                                        value={formData.birthDate}
                                        onChange={e => setFormData({ ...formData, birthDate: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Yakınlık Derecesi</label>
                                    <select
                                        className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500"
                                        value={formData.relation}
                                        onChange={e => setFormData({ ...formData, relation: e.target.value })}
                                    >
                                        <option>Çocuğu</option>
                                        <option>Annesi</option>
                                        <option>Babası</option>
                                        <option>Eşi</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex gap-4 mt-6">
                                <button type="submit" className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-indigo-100">Kaydet</button>
                                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-xl font-bold">Vazgeç</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
