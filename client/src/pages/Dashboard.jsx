import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';
import { cities, cityDistricts } from '../utils/locationData';

export default function Dashboard() {
    const { user } = useAuth();
    
    // Core Data States
    const [appointments, setAppointments] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [clinics, setClinics] = useState([]);
    const [availableSlots, setAvailableSlots] = useState([]);
    const [reviews, setReviews] = useState({});
    const [waitlists, setWaitlists] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [dependents, setDependents] = useState([]);
    const [reports, setReports] = useState([]);

    // Selection & Wizard State (Step-Based)
    const [currentStep, setCurrentStep] = useState(1);
    const [filters, setFilters] = useState({ branch: '', city: '', clinicId: '', district: '' });
    const [selectedDoctor, setSelectedDoctor] = useState('');
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedSlot, setSelectedSlot] = useState('');
    const [selectedDependent, setSelectedDependent] = useState('');

    // UI Status States
    const [loading, setLoading] = useState(true);
    const [isSearching, setIsSearching] = useState(false);

    // Hızlı Randevu Loading State
    const [isQuickBooking, setIsQuickBooking] = useState(false);

    // Veri İndirme (Fetch Data)
    const fetchDoctors = useCallback(async () => {
        setIsSearching(true);
        try {
            const params = new URLSearchParams();
            if (filters.branch) params.append('branch', filters.branch);
            if (filters.city) params.append('city', filters.city);
            if (filters.district) params.append('district', filters.district);
            if (filters.clinicId) params.append('clinicId', filters.clinicId);

            const res = await api.get(`/doctors?${params.toString()}`);
            setDoctors(res.data);
            if (res.data.length > 0 && currentStep === 1) setCurrentStep(2);
        } catch {
            console.error('Doktorlar yüklenemedi');
        } finally {
            setIsSearching(false);
        }
    }, [filters, currentStep]);

    const fetchInitialData = useCallback(async () => {
        try {
            const [appRes, clinicRes, waitRes, favRes, depRes, reportsRes] = await Promise.all([
                api.get('/appointments'),
                api.get('/clinics'),
                api.get('/waitlists'),
                api.get('/ux/favorites'),
                api.get('/dependents'),
                api.get('/ux/e-nabiz')
            ]);
            setAppointments(Array.isArray(appRes.data?.data) ? appRes.data.data : (Array.isArray(appRes.data) ? appRes.data : []));
            setClinics(Array.isArray(clinicRes.data?.data) ? clinicRes.data.data : (Array.isArray(clinicRes.data) ? clinicRes.data : []));
            setWaitlists(Array.isArray(waitRes.data?.data) ? waitRes.data.data : (Array.isArray(waitRes.data) ? waitRes.data : []));
            setFavorites(Array.isArray(favRes.data?.data) ? favRes.data.data : (Array.isArray(favRes.data) ? favRes.data : []));
            setDependents(Array.isArray(depRes.data?.data) ? depRes.data.data : (Array.isArray(depRes.data) ? depRes.data : []));
            setReports(Array.isArray(reportsRes.data?.data) ? reportsRes.data.data : (Array.isArray(reportsRes.data) ? reportsRes.data : []));
            await fetchDoctors();
        } catch {
            console.error('Veri çekme hatası');
        } finally {
            setLoading(false);
        }
    }, [fetchDoctors]);

    const fetchSlots = useCallback(async () => {
        try {
            const res = await api.get(`/time-slots/doctor/${selectedDoctor}?date=${selectedDate}`);
            setAvailableSlots(res.data);
        } catch {
            console.error('Slotlar yüklenemedi');
        }
    }, [selectedDoctor, selectedDate]);

    // Setup Hooks
    useEffect(() => { fetchInitialData(); }, [fetchInitialData]);

    // 🔥 BUG ÇÖZÜMÜ: Eğer filtre değişirse Doktor listesini Backend'e yeniden sor (Sorguyu Tetikle)
    useEffect(() => {
        if (!loading) {
            fetchDoctors();
        }
    }, [filters.branch, filters.city, filters.district, filters.clinicId, fetchDoctors, loading]);

    useEffect(() => {
        if (selectedDoctor && selectedDate) fetchSlots();
        else { setAvailableSlots([]); setSelectedSlot(''); }
    }, [selectedDoctor, selectedDate, fetchSlots]);

    // Hızlı Randevu Metodu
    const handleQuickAppointment = async () => {
        if (!filters.city || !filters.district) return toast.error("Şehir ve İlçe seçmelisiniz");
        
        setIsQuickBooking(true);
        const quickToast = toast.loading("Aranıyor: En yakın doktor ve saat taraması yapılıyor...");
        
        try {
            const res = await api.post('/appointments/quick', {
                city: filters.city,
                district: filters.district,
                clinicId: filters.clinicId
            });
            
            const { slot, doctor } = res.data.data;
            const targetDateStr = new Date(slot.startTime).toLocaleString('tr-TR', { dateStyle: 'long', timeStyle: 'short' });
            
            toast.dismiss(quickToast);
            if(window.confirm(`BULUNDU! 🎉\n\nUzman: ${doctor.name} (${doctor.branch})\nTarih: ${targetDateStr}\nHastane: ${doctor.clinic?.name || doctor.hospital}\n\nBu randevuyu jet hızıyla onaylıyor musunuz?`)) {
                 await api.post('/appointments', {
                    doctorId: doctor.id,
                    timeSlotId: slot.id,
                    dependentId: selectedDependent ? parseInt(selectedDependent) : null
                });
                toast.success("✅ Hızlı Randevunuz başarıyla onaylandı!");
                
                // Refresh Data & Goto Step 4
                const appRes = await api.get('/appointments');
                setAppointments(appRes.data?.data || appRes.data);
                setCurrentStep(4);
            }
        } catch (error) {
            toast.dismiss(quickToast);
            toast.error(error.response?.data?.error || "Bulunan kriterlere uygun randevu/kapasite kalmamış.");
        } finally {
            setIsQuickBooking(false);
        }
    };

    // Normal Randevu Sistemi (Stepli Wizard)
    const handleJoinWaitlist = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/waitlists', { doctorId: parseInt(selectedDoctor), date: selectedDate });
            toast.success(res.data?.message || 'Bekleme listesine başarıyla adınız yazıldı. Müsaitlik anında e-posta alacaksınız!');
            const waitRes = await api.get('/waitlists');
            setWaitlists(waitRes.data?.data || waitRes.data);
        } catch (error) {
            toast.error(error.response?.data?.error || 'Bekleme listesine kayıt başarısız.');
        }
    };
    const handleBookAppointment = async (e) => {
        e.preventDefault();
        if (!selectedSlot) return toast.error('Lütfen boş (yeşil) bir saat dilimi seçin.');
        if (!window.confirm('Randevuyu onaylıyor musunuz?')) return;

        try {
            const tId = toast.loading("İşleminiz kaydediliyor, kapasiteler kontrol ediliyor...");
            const res = await api.post('/appointments', {
                doctorId: parseInt(selectedDoctor),
                timeSlotId: parseInt(selectedSlot),
                dependentId: selectedDependent ? parseInt(selectedDependent) : null
            });
            toast.dismiss(tId);
            toast.success(res.data.message || 'Randevu başarıyla oluşturuldu!');
            
            setSelectedDoctor(''); setSelectedDate(''); setSelectedSlot('');
            setCurrentStep(4);
            const appRes = await api.get('/appointments');
            setAppointments(appRes.data?.data || appRes.data);
            
        } catch (error) {
            toast.dismiss();
            toast.error(error.response?.data?.error || 'Randevu kapasite sebebiyle alınamadı. Başka bir hasta öncelikli alınmış olabilir.');
            // Yenileki yeni kapasiteleri görsün
            fetchSlots();
        }
    };

    const handleCancelAppointment = async (id) => {
        if (!window.confirm('Bu randevuyu iptal etmek istediğinize emin misiniz?')) return;
        try {
            const tId = toast.loading("İptal işlemi gerçekleştiriliyor...");
            await api.delete(`/appointments/${id}`);
            toast.dismiss(tId);
            toast.success('Randevunuz iptal edildi ve sistem ilgili kapasiteyi tekrar diğer hastalara açtı.');

            const appRes = await api.get('/appointments');
            setAppointments(appRes.data?.data || appRes.data);
        } catch {
            toast.dismiss();
            toast.error('İptal işlemi başarısız oldu.');
        }
    };

    const toggleFavorite = async (docId) => {
        try {
            const isFav = favorites.some(f => f.doctorId === docId);
            if (isFav) {
                const fav = favorites.find(f => f.doctorId === docId);
                await api.delete(`/ux/favorites/${fav.id}`);
                setFavorites(prev => prev.filter(f => f.doctorId !== docId));
                toast.success('Favorilerden çıkarıldı.');
            } else {
                const res = await api.post('/ux/favorites', { doctorId: docId });
                setFavorites(prev => [...prev, res.data]);
                toast.success('⭐ Doktor favorilere eklendi!');
            }
        } catch {
            toast.error('Favori işlemi başarısız.');
        }
    };

    if (loading) return <div className="h-screen flex items-center justify-center bg-gray-50 text-indigo-700 font-bold tracking-widest uppercase">Yükleniyor...</div>;

    const now = new Date();
    const futureAppointments = appointments.filter(app => new Date(app.date) >= now);
    const pastAppointments = appointments.filter(app => new Date(app.date) < now);

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            <Navbar />

            {/* v7.0 SaaS Premium Dashboard */}
            <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
                
                {/* 1. Header & Stepper */}
                <div className="mb-12 max-w-4xl mx-auto">
                    <div className="text-center mb-10">
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Merkezi Randevu Planlayıcısı</h1>
                        <p className="text-slate-500 font-medium mt-2">Yapay zeka asistanı desteğiyle en hızlı randevuyu bulun.</p>
                    </div>

                    <div className="flex items-center justify-between relative mt-12 bg-white/50 p-6 rounded-3xl backdrop-blur-xl border border-white shadow-sm">
                        <div className="absolute left-6 top-1/2 -translate-y-1/2 w-[calc(100%-3rem)] h-1 bg-slate-100 -z-10 rounded-full"></div>
                        <div className={`absolute left-6 top-1/2 -translate-y-1/2 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-700 -z-10 rounded-full`} style={{ width: `${(currentStep - 1) * 33.33}%` }}></div>

                        {[
                            { step: 1, label: 'Bölge / Uzmanlık', icon: '📍' },
                            { step: 2, label: 'Doktor Seçimi', icon: '👨‍⚕️' },
                            { step: 3, label: 'Tarih & Saat', icon: '🗓️' },
                            { step: 4, label: 'Onay', icon: '✅' }
                        ].map((s) => (
                            <div key={s.step} className="flex flex-col items-center">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl transition-all duration-500 shadow-xl ${currentStep >= s.step
                                    ? 'bg-gradient-to-br from-indigo-600 to-blue-600 text-white scale-110 shadow-blue-200 ring-4 ring-white'
                                    : 'bg-white text-slate-300 border border-slate-100'
                                    }`}>
                                    {currentStep > s.step ? '✓' : s.icon}
                                </div>
                                <span className={`text-[11px] mt-4 font-black uppercase tracking-widest ${currentStep >= s.step ? 'text-indigo-600' : 'text-slate-400'} transition-colors duration-500`}>
                                    {s.label}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* STEP 1: Bölge Seçimi ve Hızlı İşlemler */}
                    {(currentStep === 1 || currentStep === 2) && (
                        <div className="lg:col-span-4 space-y-6">
                            
                            {/* Glassmorphism Arama Kartı */}
                            <div className="bg-white/70 backdrop-blur-3xl p-8 rounded-[2rem] border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                                <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-3">
                                    <span className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">🔍</span>
                                    Filtrele
                                </h3>

                                <div className="space-y-5">
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest block">Hastane Şehri</label>
                                        <select
                                            className="w-full bg-slate-50/50 border-0 ring-1 ring-slate-100 rounded-2xl p-4 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer"
                                            value={filters.city}
                                            onChange={(e) => setFilters({ ...filters, city: e.target.value, district: '', clinicId: '' })}
                                        >
                                            <option value="">İl Seçin (Tüm Türkiye)</option>
                                            {cities.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest block">İlçe</label>
                                        <select
                                            className="w-full bg-slate-50/50 border-0 ring-1 ring-slate-100 rounded-2xl p-4 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer"
                                            value={filters.district}
                                            onChange={(e) => setFilters({ ...filters, district: e.target.value, clinicId: '' })}
                                        >
                                            <option value="">Tüm İlçeler</option>
                                            {filters.city && [...new Set(cityDistricts[filters.city] || ["Merkez"])].sort().map(d => <option key={d} value={d}>{d}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest block">Klinik / Branş</label>
                                        <select
                                            className="w-full bg-slate-50/50 border-0 ring-1 ring-slate-100 rounded-2xl p-4 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer"
                                            value={filters.clinicId}
                                            onChange={(e) => setFilters({ ...filters, clinicId: e.target.value })}
                                        >
                                            <option value="">Tüm Poliklinikler / Branşlar</option>
                                            {Object.entries(clinics.filter(c => (!filters.city || c.city === filters.city) && (!filters.district || c.district.toLowerCase() === filters.district.toLowerCase())).reduce((acc, c) => {
                                                    const b = c.name.split(' ')[0] || "Diğer"; 
                                                    if (!acc[b]) acc[b] = []; 
                                                    acc[b].push(c); 
                                                    return acc;
                                                }, {})).map(([branch, bp]) => (
                                                <optgroup key={branch} label={branch}>
                                                    {bp.map(c => <option key={c.id} value={c.id}>{(c.name.split('-')[1] || c.name).trim()} ({c.hospital || c.city})</option>)}
                                                </optgroup>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                            
                            {/* 🔥 YENİ: HIZLI RANDEVU KART */}
                            {filters.city && filters.district && (
                                <div className="p-8 bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 rounded-[2rem] shadow-2xl relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl transform translate-x-10 translate-y-10"></div>
                                    
                                    <h4 className="text-white font-black text-lg mb-2">⚡ Hızlı Randevu </h4>
                                    <p className="text-indigo-200 text-xs mb-6 font-medium leading-relaxed">Şehir ve ilçe seçiminizi yaptınız. Branş seçmek veya doktor listesinde kaybolmak istemiyorsanız, sizi anında en yakın boştaki uzmana atayabiliriz.</p>
                                    
                                    <button 
                                        onClick={handleQuickAppointment}
                                        disabled={isQuickBooking}
                                        className="w-full bg-white text-indigo-900 font-extrabold py-4 px-6 rounded-xl hover:bg-indigo-50 hover:scale-[1.02] active:scale-95 transition-all outline-none shadow-[0_0_20px_rgba(255,255,255,0.3)] disabled:opacity-50 text-sm tracking-widest uppercase flex justify-center items-center gap-2"
                                    >
                                        {isQuickBooking ? 'Taranıyor...' : 'EN YAKIN ZAMANA OLUŞTUR'}
                                    </button>
                                </div>
                            )}

                        </div>
                    )}

                    {/* STEP 2: Doktor Listesi */}
                    {(currentStep === 2 || currentStep === 1) && (
                        <div className="lg:col-span-8">
                            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 min-h-[600px]">
                                <div className="flex justify-between items-center mb-8 border-b border-slate-50 pb-6">
                                    <h3 className="text-xl font-black text-slate-800">Mevcut Uzmanlar</h3>
                                    {currentStep === 2 && (
                                        <button onClick={() => setCurrentStep(1)} className="text-xs font-black text-slate-400 bg-slate-50 px-4 py-2 rounded-lg hover:text-indigo-600 transition-colors">
                                            ← Filtrelere Dön
                                        </button>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {isSearching ? (
                                        <div className="col-span-2 text-center py-20 animate-pulse text-indigo-400 font-black">Hekim Listesi Yükleniyor...</div>
                                    ) : doctors.length > 0 ? (
                                        doctors.map((doc) => (
                                            <div key={doc.id} className="group bg-slate-50/50 hover:bg-white p-6 rounded-3xl border border-slate-100 hover:border-indigo-100 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-50 hover:-translate-y-1 cursor-pointer" 
                                                 onClick={() => { setSelectedDoctor(doc.id.toString()); setCurrentStep(3); }}>
                                                <div className="flex items-start gap-5">
                                                    <div className="relative">
                                                        <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(doc.name)}&background=e0e7ff&color=4338ca&bold=true&rounded=true&size=128`} alt={doc.name} className="w-16 h-16 rounded-2xl shadow-sm group-hover:rotate-6 transition-all" />
                                                        {favorites.some(f => f.doctorId === doc.id) && (
                                                            <div className="absolute -top-2 -right-2 bg-amber-400 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs shadow-md">★</div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="text-[15px] font-black text-slate-900 group-hover:text-indigo-600 truncate">{doc.name}</h4>
                                                        <p className="text-[11px] font-bold text-indigo-500 uppercase tracking-wider mb-2">{doc.branch}</p>
                                                        <p className="text-[11px] text-slate-500 font-medium leading-tight line-clamp-2">{doc.hospital} - {doc.clinic?.name}</p>
                                                        {reports.some(r => r.appointment?.doctorId === doc.id) && (
                                                            <div className="mt-2 inline-block bg-teal-50 text-teal-600 text-[9px] px-3 py-1 rounded-full font-black uppercase tracking-widest border border-teal-100">
                                                                ✓ Daha Önce Muayene Oldunuz
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="col-span-2 py-20 text-center flex flex-col items-center">
                                            <div className="text-5xl mb-4 opacity-30">📭</div>
                                            <h4 className="text-slate-400 font-black uppercase tracking-widest text-sm">Uzman Bulunamadı</h4>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 3: Saat ve Karar Modülü */}
                    {currentStep === 3 && (
                        <div className="lg:col-span-12 max-w-5xl mx-auto w-full animate-in fade-in zoom-in-95 duration-300">
                            <div className="bg-white rounded-[3rem] shadow-2xl p-10 border border-slate-50">
                                
                                <div className="flex items-center gap-6 mb-12 border-b border-slate-100 pb-8">
                                    <button onClick={() => setCurrentStep(2)} className="w-12 h-12 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-2xl flex items-center justify-center font-black transition-colors">←</button>
                                    <div>
                                        <h3 className="text-2xl font-black text-slate-800">Randevu Saatinizi Belirleyin</h3>
                                        <p className="text-sm text-slate-500 font-medium mt-1">Seçtiğiniz uzmanın <span className="text-indigo-600 font-bold">Kapasite Limitli</span> randevu cetveli (Yeşil renkler randevuya açıktır).</p>
                                    </div>
                                    <div className="ml-auto text-right">
                                        <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(doctors.find(d => d.id === parseInt(selectedDoctor))?.name || '')}&background=eff6ff&color=1e40af&rounded=true&bold=true`} className="w-14 h-14 rounded-full inline-block" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                    <div className="space-y-6">
                                        <div className="space-y-3">
                                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-2">Bağlı Kişi</label>
                                            <select className="w-full bg-slate-50 border-0 rounded-2xl p-5 text-sm font-bold text-slate-700" value={selectedDependent} onChange={(e) => setSelectedDependent(e.target.value)}>
                                                <option value="">Kendi Adıma</option>
                                                {dependents.map(dep => <option key={dep.id} value={dep.id}>{dep.name}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-2">Tarih</label>
                                            <input type="date" className="w-full bg-slate-50 border-0 rounded-2xl p-5 text-sm font-bold text-slate-700" value={selectedDate} min={new Date().toISOString().split('T')[0]} onChange={(e) => setSelectedDate(e.target.value)} />
                                        </div>
                                    </div>

                                    <div>
                                        {selectedDate ? (
                                            <div className="space-y-4">
                                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-2 flex justify-between">
                                                    <span>Müsait Saat Dilimleri</span>
                                                    <span>Bitiş: 17:00</span>
                                                </label>
                                                <div className="grid grid-cols-4 gap-3 bg-slate-50 p-6 rounded-3xl border border-slate-100 h-[250px] overflow-y-auto">
                                                    {availableSlots.length > 0 ? (
                                                        availableSlots.map(slot => (
                                                            <button
                                                                key={slot.id}
                                                                disabled={slot.isBooked}
                                                                onClick={() => setSelectedSlot(slot.id.toString())}
                                                                className={`p-3 rounded-2xl text-[11px] font-black tracking-wider transition-all border-2 
                                                                    ${slot.isBooked 
                                                                        ? 'bg-rose-50 border-rose-100 text-rose-300 opacity-60 cursor-not-allowed line-through' 
                                                                        : selectedSlot === slot.id.toString()
                                                                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200 -translate-y-1'
                                                                            : 'bg-white border-emerald-100 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300 hover:shadow-md'
                                                                    }`}
                                                                title={slot.isBooked ? `Kapasite Dolu (${slot.currentCount}/${slot.maxCapacity})` : `Boş Yer Var (${slot.currentCount}/${slot.maxCapacity})`}
                                                            >
                                                                {slot.time}
                                                            </button>
                                                        ))
                                                    ) : (
                                                        <div className="col-span-full flex flex-col items-center justify-center p-4">
                                                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-2">{loading ? "Yükleniyor..." : "Bu tarih için cetveli bulunmuyor"}</p>
                                                        </div>
                                                    )}
                                                </div>
                                                
                                                {/* Kapasite Dolu Öneri Modülü */}
                                                {availableSlots.length > 0 && availableSlots.every(s => s.isBooked) && (
                                                    <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-4 mt-4 animate-in fade-in slide-in-from-bottom">
                                                        <span className="text-xl">⚠️</span>
                                                        <div className="flex-1">
                                                            <p className="text-xs font-black text-amber-800 uppercase tracking-widest">Kapasite Aşımı</p>
                                                            <p className="text-[11px] text-amber-700 font-medium mt-1">Bu gündeki tüm saatlerin kapasitesi dolmuştur! Sıranızı garantiye alın.</p>
                                                        </div>
                                                        <button onClick={handleJoinWaitlist} className="bg-amber-500 text-white font-black text-[10px] px-4 py-2 rounded-xl h-fit hover:bg-amber-600 transition-colors uppercase tracking-widest shrink-0">
                                                            Sıraya Gir 🔔
                                                        </button>
                                                    </div>
                                                )}

                                            </div>
                                        ) : (
                                            <div className="h-full flex flex-col items-center justify-center bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200 opacity-70">
                                                <span className="text-4xl mb-4">🗓️</span>
                                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Mesai listesi için tarih giriniz</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {selectedSlot && (
                                    <div className="mt-12 pt-8 border-t border-slate-100 flex justify-end">
                                        <button onClick={handleBookAppointment} className="bg-indigo-600 text-white font-black py-4 px-12 rounded-2xl shadow-xl shadow-indigo-200 hover:scale-105 transition-transform uppercase tracking-widest text-sm">
                                            ✓ Randevuyu Kesinleştir
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* STEP 4: Başarı & Onay */}
                    {currentStep === 4 && (
                        <div className="lg:col-span-12 max-w-2xl mx-auto w-full text-center py-20 animate-in zoom-in slide-in-from-bottom-8 duration-500">
                            <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8 text-5xl shadow-2xl shadow-green-100">
                                ✓
                            </div>
                            <h2 className="text-3xl font-black text-slate-800 mb-4 tracking-tight">Onaylandı. Geçmiş Olsun.</h2>
                            <p className="text-slate-500 font-medium mb-12">Merkezi sisteme kapasiteniz başarılı bir şekilde düşüldü. Randevunuz takviminize eklendi.</p>

                            <div className="flex gap-4 justify-center">
                                <button onClick={() => setCurrentStep(1)} className="px-8 py-4 bg-slate-800 text-white font-black rounded-xl hover:bg-slate-900 transition-colors text-xs uppercase tracking-widest">
                                    Ana Ekrana Dön
                                </button>
                            </div>
                        </div>
                    )}

                </div>

                {/* Dashboard Tabloları (Alt Kısım) */}
                <div className="mt-20 pt-16 border-t border-slate-200">
                    <div className="flex items-center gap-3 mb-8">
                        <h2 className="text-2xl font-black text-slate-800">Randevularım</h2>
                        <span className="bg-indigo-100 text-indigo-700 font-black text-[10px] px-3 py-1 rounded-full uppercase tracking-widest">Aktif Panel</span>
                    </div>

                    <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
                        {futureAppointments.length > 0 ? (
                            <table className="min-w-full divide-y divide-slate-100">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th scope="col" className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Tarih</th>
                                        <th scope="col" className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Poliklinik & Doktor</th>
                                        <th scope="col" className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">İşlem</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-slate-50">
                                    {futureAppointments.map(app => (
                                        <tr key={app.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-8 py-6 whitespace-nowrap">
                                                <div className="text-sm font-black text-slate-700">{new Date(app.date).toLocaleDateString('tr-TR', { weekday: 'short', month: 'short', day: 'numeric'})}</div>
                                                <div className="text-xs text-indigo-600 font-black">{new Date(app.date).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit'})}</div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="text-sm font-black text-slate-800">{app.doctor.name}</div>
                                                <div className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-1">{app.doctor.branch} - {app.doctor.clinic?.name}</div>
                                            </td>
                                            <td className="px-8 py-6 whitespace-nowrap text-right space-x-3">
                                                <button onClick={() => toggleFavorite(app.doctorId)} className="text-amber-500 bg-amber-50 hover:bg-amber-100 p-2.5 rounded-xl transition-colors" title="Favorilere Ekle">⭐</button>
                                                <button onClick={() => handleCancelAppointment(app.id)} className="text-rose-600 bg-rose-50 hover:bg-rose-100 text-[11px] font-black px-4 py-2.5 rounded-xl uppercase tracking-widest transition-colors">İptal Et</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="p-16 text-center">
                                <span className="text-4xl filter grayscale opacity-20 block mb-4">🩺</span>
                                <p className="text-sm text-slate-400 font-bold">Yaklaşan herhangi bir randevunuz bulunmuyor.</p>
                            </div>
                        )}
                    </div>
                </div>

            </main>
        </div>
    );
}
