import { useState, useEffect } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';

export default function Profile() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        tcNo: '',
        createdAt: '',
        currentPassword: '',
        newPassword: '',
        is2FAEnabled: false,
    });
    const [message, setMessage] = useState({ type: '', text: '' });

    const fetchProfile = async () => {
        try {
            const res = await api.get('/users/profile');
            setFormData(prev => ({ ...prev, ...res.data }));
        } catch {
            console.error('Profil yüklenemedi');
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        try {
            const res = await api.put('/users/profile', {
                name: formData.name,
                email: formData.email,
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword
            });
            setMessage({ type: 'success', text: res.data.message });
            setFormData(prev => ({ ...prev, currentPassword: '', newPassword: '' }));
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.error || 'Güncelleme başarısız' });
        }
    };

    const handleToggle2FA = async () => {
        try {
            const res = await api.post('/users/2fa/toggle');
            setFormData(prev => ({ ...prev, is2FAEnabled: res.data.is2FAEnabled }));
            setMessage({ type: 'success', text: res.data.message });
        } catch {
            setMessage({ type: 'error', text: '2FA ayarı değiştirilemedi.' });
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar />
            <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
                <div className="bg-white shadow sm:rounded-lg max-w-2xl mx-auto overflow-hidden">
                    <div className="px-4 py-5 sm:px-6 bg-indigo-50 border-b border-indigo-100">
                        <h3 className="text-lg font-medium leading-6 text-indigo-900">Profil Bilgilerim</h3>
                        <p className="mt-1 max-w-2xl text-sm text-indigo-700">Kişisel bilgilerinizi ve şifrenizi buradan güncelleyebilirsiniz.</p>
                    </div>
                    <div className="px-4 py-5 sm:p-6">
                        {message.text && (
                            <div className={`mb-4 p-3 rounded ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {message.text}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                                <div className="sm:col-span-3">
                                    <label className="block text-sm font-medium text-gray-700">TC Kimlik No</label>
                                    <div className="mt-1">
                                        <input type="text" disabled value={formData.tcNo} className="block w-full disabled:bg-gray-100 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" />
                                    </div>
                                </div>

                                <div className="sm:col-span-3">
                                    <label className="block text-sm font-medium text-gray-700">Kayıt Tarihi</label>
                                    <div className="mt-1">
                                        <input type="text" disabled value={new Date(formData.createdAt).toLocaleDateString('tr-TR')} className="block w-full disabled:bg-gray-100 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" />
                                    </div>
                                </div>

                                <div className="sm:col-span-6">
                                    <label className="block text-sm font-medium text-gray-700">Ad Soyad</label>
                                    <div className="mt-1">
                                        <input type="text" name="name" value={formData.name} onChange={handleChange} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" />
                                    </div>
                                </div>

                                <div className="sm:col-span-6">
                                    <label className="block text-sm font-medium text-gray-700">Email Adresi</label>
                                    <div className="mt-1">
                                        <input type="email" name="email" value={formData.email} onChange={handleChange} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" />
                                    </div>
                                </div>

                                <div className="sm:col-span-6 border-t pt-4">
                                    <h4 className="text-sm font-medium text-gray-900 mb-4">Şifre Değiştir (İsteğe Bağlı)</h4>
                                </div>

                                <div className="sm:col-span-3">
                                    <label className="block text-sm font-medium text-gray-700">Mevcut Şifre</label>
                                    <div className="mt-1">
                                        <input type="password" name="currentPassword" value={formData.currentPassword} onChange={handleChange} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" placeholder="Sadece değiştirmek isterseniz girin" />
                                    </div>
                                </div>

                                <div className="sm:col-span-3">
                                    <label className="block text-sm font-medium text-gray-700">Yeni Şifre</label>
                                    <div className="mt-1">
                                        <input type="password" name="newPassword" value={formData.newPassword} onChange={handleChange} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" placeholder="En az 6 karakter" />
                                    </div>
                                </div>

                                {/* 2FA Toggle */}
                                <div className="sm:col-span-6 border-t pt-4">
                                    <h4 className="text-sm font-medium text-gray-900 mb-2">Ekstra Güvenlik (İki Faktörlü Doğrulama)</h4>
                                    <div className="flex items-center justify-between bg-gray-50 p-4 rounded-md border border-gray-200">
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">2FA Doğrulaması</p>
                                            <p className="text-xs text-gray-500 mt-1">Giriş yaparken kayıtlı e-postanıza 6 haneli bir kod gönderilir.</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleToggle2FA}
                                            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 ${formData.is2FAEnabled ? 'bg-indigo-600' : 'bg-gray-200'}`}
                                            role="switch"
                                            aria-checked={formData.is2FAEnabled}
                                        >
                                            <span
                                                aria-hidden="true"
                                                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${formData.is2FAEnabled ? 'translate-x-5' : 'translate-x-0'}`}
                                            />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <button type="submit" className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                                    Kaydet
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
