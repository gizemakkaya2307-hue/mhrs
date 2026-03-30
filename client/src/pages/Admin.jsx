import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { maskEmail, maskTC } from '../utils/masking';

export default function Admin() {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [stats, setStats] = useState({ users: 0, doctors: 0, appointments: 0, clinics: 0 });
    const [doctors, setDoctors] = useState([]);
    const [clinics, setClinics] = useState([]);
    const [users, setUsers] = useState([]);
    const [doctorForm, setDoctorForm] = useState({ name: '', branch: '', hospital: '', clinicId: '' });
    const [clinicForm, setClinicForm] = useState({ name: '', city: '', district: '' });
    const [appointments, setAppointments] = useState([]);
    const [enterpriseStats, setEnterpriseStats] = useState(null);
    const [auditLogs, setAuditLogs] = useState([]);

    const fetchStats = useCallback(async () => {
        try {
            const res = await api.get('/stats/dashboard');
            setStats(res.data);
        } catch {
            console.error('İstatistikler alınamadı');
        }
    }, []);

    const fetchDoctors = useCallback(async () => {
        try {
            const res = await api.get('/doctors');
            setDoctors(res.data);
        } catch {
            console.error('Doktorlar alınamadı');
        }
    }, []);

    const fetchClinics = useCallback(async () => {
        try {
            const res = await api.get('/clinics');
            setClinics(res.data);
        } catch {
            console.error('Klinikler alınamadı');
        }
    }, []);

    const fetchUsers = useCallback(async () => {
        try {
            const res = await api.get('/users');
            setUsers(res.data);
        } catch {
            console.error('Kullanıcılar alınamadı');
        }
    }, []);

    const fetchAppointments = useCallback(async () => {
        try {
            const res = await api.get('/appointments/all'); // Admin endpoint
            setAppointments(res.data);
        } catch {
            console.error('Randevular alınamadı');
        }
    }, []);

    const fetchEnterpriseData = useCallback(async () => {
        try {
            const [s, a] = await Promise.all([
                api.get('/enterprise/admin-dashboard'),
                api.get('/enterprise/audit-logs?limit=50')
            ]);
            setEnterpriseStats(s.data);
            setAuditLogs(a.data);
        } catch {
            toast.error('Enterprise admin verileri alınamadı');
        }
    }, []);

    useEffect(() => {
        fetchStats();
        fetchDoctors();
        fetchClinics();
        fetchUsers();
        fetchAppointments();
        fetchEnterpriseData();
    }, [fetchStats, fetchDoctors, fetchClinics, fetchUsers, fetchAppointments, fetchEnterpriseData]);

    const handleAddDoctor = async (e) => {
        e.preventDefault();
        try {
            await api.post('/doctors', {
                ...doctorForm,
                clinicId: doctorForm.clinicId ? parseInt(doctorForm.clinicId) : null
            });
            setDoctorForm({ name: '', branch: '', hospital: '', clinicId: '' });
            fetchDoctors();
            fetchStats();
            toast.success('Doktor başarıyla eklendi');
        } catch {
            toast.error('Doktor eklenemedi');
        }
    };

    const handleAddClinic = async (e) => {
        e.preventDefault();
        try {
            await api.post('/clinics', clinicForm);
            setClinicForm({ name: '', city: '', district: '' });
            fetchClinics();
            fetchStats();
            toast.success('Klinik başarıyla eklendi');
        } catch {
            toast.error('Klinik eklenemedi');
        }
    };

    const handleDeleteDoctor = async (id) => {
        if (!confirm('Bu doktoru silmek istediğinize emin misiniz?')) return;
        try {
            await api.delete(`/doctors/${id}`);
            fetchDoctors();
            fetchStats();
            toast.success('Doktor silindi');
        } catch {
            toast.error('Silme başarısız');
        }
    };

    const handleDeleteClinic = async (id) => {
        if (!confirm('Bu kliniği silmek istediğinize emin misiniz?')) return;
        try {
            await api.delete(`/clinics/${id}`);
            fetchClinics();
            fetchStats();
            toast.success('Klinik silindi');
        } catch {
            toast.error('Silme başarısız');
        }
    };

    const handleRoleUpdate = async (id, newRole) => {
        try {
            await api.put(`/users/${id}/role`, { role: newRole });
            fetchUsers();
            toast.success('Kullanıcı rolü güncellendi');
        } catch {
            toast.error('Güncelleme başarısız');
        }
    };

    const handleDeleteUser = async (id) => {
        if (!confirm('Kullanıcıyı silmek istediğinize emin misiniz?')) return;
        try {
            await api.delete(`/users/${id}`);
            fetchUsers();
            fetchStats();
            toast.success('Kullanıcı hesabı silindi');
        } catch {
            toast.error('Silme başarısız');
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar />
            <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">

                {/* Sekmeler */}
                <div className="mb-6 border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8">
                        {['dashboard', 'doctors', 'clinics', 'users', 'calendar', 'performance', 'audit'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`
                  whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                  ${activeTab === tab
                                        ? 'border-indigo-500 text-indigo-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                `}
                            >
                                {tab === 'dashboard' ? 'Genel Bakış' : tab === 'doctors' ? 'Doktor Yönetimi' : tab === 'clinics' ? 'Klinik Yönetimi' : tab === 'users' ? 'Kullanıcı Yönetimi' : tab === 'calendar' ? 'Takvim Paneli' : tab === 'performance' ? 'Performans Analizi' : 'Audit Log'}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Dashboard Sekmesi */}
                {activeTab === 'dashboard' && (
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                        {[
                            { label: 'Toplam Kullanıcı', value: stats.users, color: 'bg-blue-500' },
                            { label: 'Toplam Doktor', value: stats.doctors, color: 'bg-green-500' },
                            { label: 'Toplam Randevu', value: stats.appointments, color: 'bg-indigo-500' },
                            { label: 'Toplam Klinik', value: stats.clinics, color: 'bg-purple-500' },
                        ].map((item) => (
                            <div key={item.label} className="overflow-hidden rounded-lg bg-white shadow">
                                <div className="p-5">
                                    <div className="flex items-center">
                                        <div className={`flex-shrink-0 rounded-md p-3 ${item.color} text-white`}>
                                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                            </svg>
                                        </div>
                                        <div className="ml-5 w-0 flex-1">
                                            <dl>
                                                <dt className="truncate text-sm font-medium text-gray-500">{item.label}</dt>
                                                <dd className="text-lg font-medium text-gray-900">{item.value}</dd>
                                            </dl>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {enterpriseStats && (
                            <>
                                <div className="overflow-hidden rounded-lg bg-white shadow"><div className="p-5"><dt className="truncate text-sm font-medium text-gray-500">Bekleyen Hasta</dt><dd className="text-lg font-medium text-gray-900">{enterpriseStats.waitlists}</dd></div></div>
                                <div className="overflow-hidden rounded-lg bg-white shadow"><div className="p-5"><dt className="truncate text-sm font-medium text-gray-500">Audit Kayıtları</dt><dd className="text-lg font-medium text-gray-900">{enterpriseStats.auditLogs}</dd></div></div>
                            </>
                        )}
                    </div>
                )}

                {/* Dashboard: Bekleme Listesi Table */}
                {activeTab === 'dashboard' && enterpriseStats?.waitlistItems && (
                    <div className="mt-8 bg-white shadow-lg sm:rounded-[2rem] overflow-hidden text-slate-800 border border-slate-100">
                        <div className="px-6 py-6 sm:px-8 bg-indigo-900 border-b border-indigo-800 flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-black text-white flex items-center gap-2">
                                    ⏳ Merkezi Bekleme Listesi (Waitlist)
                                </h3>
                                <p className="text-sm text-indigo-200 mt-1 font-medium">Randevu iptallerinde veya boşalan slotlarda ilk çağrılacak hastalar.</p>
                            </div>
                            <span className="bg-indigo-800 text-indigo-200 px-3 py-1 font-bold text-xs rounded-lg border border-indigo-700">Aktif: {enterpriseStats.waitlists}</span>
                        </div>
                        <div className="overflow-x-auto">
                            {enterpriseStats.waitlistItems.length === 0 ? (
                                <p className="p-8 text-center text-slate-500 font-medium">Şu anda bekleme listesinde hasta bulunmamaktadır.</p>
                            ) : (
                                <table className="min-w-full divide-y divide-slate-100">
                                    <thead className="bg-slate-50">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Hasta Bilgisi</th>
                                            <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Hekim</th>
                                            <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Kayıt Tarihi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-slate-100 font-medium text-sm">
                                        {enterpriseStats.waitlistItems.map((item) => (
                                            <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="font-bold text-slate-800">{item.user?.name}</div>
                                                    <div className="text-xs text-slate-500">{item.user?.email}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-indigo-700 font-semibold">{item.doctor?.name}</div>
                                                    <div className="text-xs text-slate-500">{item.doctor?.branch}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-slate-500">
                                                    {new Date(item.createdAt).toLocaleString('tr-TR')}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                )}

                {/* Doktor Yönetimi Sekmesi */}
                {activeTab === 'doctors' && (
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        <div className="bg-white shadow sm:rounded-lg overflow-hidden h-fit">
                            <div className="px-4 py-5 sm:px-6 bg-indigo-50 border-b border-indigo-100">
                                <h3 className="text-lg font-medium leading-6 text-indigo-900">Yeni Doktor Ekle</h3>
                            </div>
                            <div className="px-4 py-5 sm:p-6 text-black">
                                <form onSubmit={handleAddDoctor} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Ad Soyad</label>
                                        <input type="text" required value={doctorForm.name} onChange={e => setDoctorForm({ ...doctorForm, name: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Branş</label>
                                        <input type="text" required value={doctorForm.branch} onChange={e => setDoctorForm({ ...doctorForm, branch: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Hastane</label>
                                        <input type="text" required value={doctorForm.hospital} onChange={e => setDoctorForm({ ...doctorForm, hospital: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Klinik</label>
                                        <select value={doctorForm.clinicId} onChange={e => setDoctorForm({ ...doctorForm, clinicId: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border">
                                            <option value="">Klinik Seçin (İsteğe bağlı)</option>
                                            {clinics.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                    </div>
                                    <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Ekle</button>
                                </form>
                            </div>
                        </div>
                        <div className="bg-white shadow sm:rounded-lg overflow-hidden">
                            <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
                                <h3 className="text-lg font-medium leading-6 text-gray-900">Doktorlar</h3>
                            </div>
                            <ul className="divide-y divide-gray-200">
                                {doctors.map((doctor) => (
                                    <li key={doctor.id} className="px-4 py-4 sm:px-6 flex justify-between items-center">
                                        <div className="text-black">
                                            <p className="text-sm font-medium text-indigo-600">{doctor.name}</p>
                                            <p className="text-xs text-gray-500">{doctor.branch} - {doctor.hospital}</p>
                                        </div>
                                        <button onClick={() => handleDeleteDoctor(doctor.id)} className="text-red-500 text-sm">Sil</button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}

                {/* Klinik Yönetimi Sekmesi */}
                {activeTab === 'clinics' && (
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        <div className="bg-white shadow sm:rounded-lg overflow-hidden h-fit">
                            <div className="px-4 py-5 sm:px-6 bg-indigo-50 border-b border-indigo-100">
                                <h3 className="text-lg font-medium leading-6 text-indigo-900">Yeni Klinik Ekle</h3>
                            </div>
                            <div className="px-4 py-5 sm:p-6 text-black">
                                <form onSubmit={handleAddClinic} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Klinik Adı</label>
                                        <input type="text" required value={clinicForm.name} onChange={e => setClinicForm({ ...clinicForm, name: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" placeholder="Ör: Göz Hastalıkları Polikliniği" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Şehir</label>
                                        <input type="text" required value={clinicForm.city} onChange={e => setClinicForm({ ...clinicForm, city: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">İlçe</label>
                                        <input type="text" required value={clinicForm.district} onChange={e => setClinicForm({ ...clinicForm, district: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" />
                                    </div>
                                    <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Ekle</button>
                                </form>
                            </div>
                        </div>
                        <div className="bg-white shadow sm:rounded-lg overflow-hidden">
                            <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
                                <h3 className="text-lg font-medium leading-6 text-gray-900">Klinikler</h3>
                            </div>
                            <ul className="divide-y divide-gray-200">
                                {clinics.map((clinic) => (
                                    <li key={clinic.id} className="px-4 py-4 sm:px-6 flex justify-between items-center text-black">
                                        <div>
                                            <p className="text-sm font-medium text-indigo-600">{clinic.name}</p>
                                            <p className="text-xs text-gray-500">{clinic.city} / {clinic.district}</p>
                                        </div>
                                        <button onClick={() => handleDeleteClinic(clinic.id)} className="text-red-500 text-sm">Sil</button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}

                {/* Kullanıcı Yönetimi Sekmesi */}
                {activeTab === 'users' && (
                    <div className="bg-white shadow sm:rounded-lg overflow-hidden">
                        <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
                            <h3 className="text-lg font-medium leading-6 text-gray-900">Kullanıcı Listesi</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ad Soyad</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email/TC</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200 text-black">
                                    {users.map((u) => (
                                        <tr key={u.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">{u.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{maskEmail(u.email)}<br />{maskTC(u.tcNo)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <select
                                                    value={u.role}
                                                    onChange={(e) => handleRoleUpdate(u.id, e.target.value)}
                                                    className="rounded border-gray-300 text-sm p-1"
                                                >
                                                    <option value="USER">USER</option>
                                                    <option value="DOCTOR">DOCTOR</option>
                                                    <option value="ADMIN">ADMIN</option>
                                                </select>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <button onClick={() => handleDeleteUser(u.id)} className="text-red-600 hover:text-red-900 font-medium">Kullanıcıyı Sil</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Akıllı Takvim Yönetimi */}
                {activeTab === 'calendar' && (
                    <div className="bg-white shadow sm:rounded-[2rem] overflow-hidden p-8 border border-indigo-50">
                        <div className="mb-8 flex justify-between items-center text-black">
                            <div>
                                <h3 className="text-2xl font-black text-gray-900 tracking-tight">Akıllı Randevu Yönetimi</h3>
                                <p className="text-sm text-gray-400 font-medium">Randevuları sürükleyerek yeniden planlayabilir veya üzerine tıklayarak detayları görebilirsiniz.</p>
                            </div>
                            <div className="flex gap-2">
                                <span className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-600 text-[10px] font-black rounded-full border border-green-100 uppercase">● AKTİF</span>
                                <span className="flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded-full border border-indigo-100 uppercase">● DRAG & DROP</span>
                            </div>
                        </div>

                        <div className="calendar-container text-black">
                            <FullCalendar
                                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                                initialView="timeGridWeek"
                                headerToolbar={{
                                    left: 'prev,next today',
                                    center: 'title',
                                    right: 'dayGridMonth,timeGridWeek,timeGridDay'
                                }}
                                events={appointments.map(app => ({
                                    id: app.id,
                                    title: `${app.doctor?.name || 'Doktor'} - ${app.patientName || app.user?.name || 'Hasta'}`,
                                    start: `${app.date}T${app.time}`,
                                    backgroundColor: app.status === 'CANCELLED' ? '#ef4444' : '#4f46e5',
                                    borderColor: 'transparent'
                                }))}
                                editable={true}
                                droppable={true}
                                eventClick={(info) => {
                                    toast(`Randevu: ${info.event.title}\nDurum: Bilgi Alındı`, { icon: '📅' });
                                }}
                                eventDrop={async (info) => {
                                    const newDate = info.event.start.toISOString().split('T')[0];
                                    const newTime = info.event.start.toTimeString().split(' ')[0].substring(0, 5);
                                    try {
                                        await api.put(`/appointments/${info.event.id}/reschedule`, { date: newDate, time: newTime });
                                        toast.success('Randevu başarıyla kaydırıldı!');
                                        fetchAppointments();
                                    } catch {
                                        info.revert();
                                        toast.error('Planlama çakışması veya yetki hatası.');
                                    }
                                }}
                                locale="tr"
                                firstDay={1}
                                slotMinTime="08:00:00"
                                slotMaxTime="20:00:00"
                                height="auto"
                            />
                        </div>
                    </div>
                )}

                {/* Performans Sekmesi */}
                {activeTab === 'performance' && (
                    <div className="bg-white shadow sm:rounded-lg overflow-hidden text-black">
                        <div className="px-4 py-5 sm:px-6 bg-indigo-50 border-b border-indigo-100 flex justify-between items-center">
                            <h3 className="text-lg font-medium leading-6 text-indigo-900">Doktor Performans Metrikleri</h3>
                            <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full font-bold">Gerçek Zamanlı</span>
                        </div>
                        <div className="px-4 py-5 sm:p-6">
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                {doctors.map(doc => (
                                    <div key={doc.id} className="border rounded-lg p-4 bg-gray-50 border-gray-200 hover:shadow-md transition-shadow">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <p className="text-sm font-bold text-gray-900">{doc.name}</p>
                                                <p className="text-xs text-indigo-600 font-medium">{doc.branch}</p>
                                            </div>
                                            <div className="h-8 w-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-xs">
                                                {doc.id}
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <div>
                                                <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                                                    <span>Randevu Doluluk Oranı</span>
                                                    <span>%75</span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-1.5">
                                                    <div className="bg-green-500 h-1.5 rounded-full" style={{ width: '75%' }}></div>
                                                </div>
                                            </div>
                                            <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                                                <span className="text-xs text-gray-500">Hasta Puanı</span>
                                                <span className="text-xs font-bold text-amber-500">★★★★☆ (4.2)</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'audit' && (
                    <div className="bg-white shadow-lg sm:rounded-[2rem] overflow-hidden text-slate-800 border border-slate-100">
                        <div className="px-6 py-6 sm:px-8 bg-slate-900 border-b border-slate-800 flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-black text-white flex items-center gap-2">
                                    🛡️ Sistem İzi ve Denetim (Audit Logs)
                                </h3>
                                <p className="text-sm text-slate-400 mt-1 font-medium">Sistemdeki tüm eylemlerin geri dönük güvenlik kayıtları.</p>
                            </div>
                            <span className="bg-slate-800 text-slate-300 px-3 py-1 font-bold text-xs rounded-lg border border-slate-700">En son 50 Kayıt</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-100">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Aksiyon</th>
                                        <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Kaynak</th>
                                        <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Kullanıcı (Rol)</th>
                                        <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Tarih</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-slate-100 font-medium text-sm">
                                    {auditLogs.map((log) => {
                                        let actionColor = 'bg-slate-100 text-slate-700';
                                        if (log.action === 'CREATE') actionColor = 'bg-emerald-100 text-emerald-800 border border-emerald-200';
                                        if (log.action === 'UPDATE' || log.action === 'UPSERT') actionColor = 'bg-blue-100 text-blue-800 border border-blue-200';
                                        if (log.action === 'DELETE') actionColor = 'bg-red-100 text-red-800 border border-red-200';
                                        if (log.action === 'LOGIN' || log.action === 'LOGOUT') actionColor = 'bg-purple-100 text-purple-800 border border-purple-200';

                                        return (
                                            <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2.5 py-1 inline-flex text-[10px] leading-5 font-black uppercase tracking-wider rounded-md ${actionColor}`}>
                                                        {log.action}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap font-bold text-slate-700">
                                                    {log.resource} <span className="text-slate-400 font-medium text-xs ml-1">#{log.resourceId}</span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-slate-600">
                                                    {log.actorRole || 'SYSTEM'} <span className="text-xs text-slate-400">(ID: {log.userId})</span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-slate-500 font-semibold text-xs">
                                                    {new Date(log.createdAt).toLocaleString('tr-TR')}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
