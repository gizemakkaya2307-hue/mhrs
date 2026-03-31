import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';
import api from '../services/api';
import toast from 'react-hot-toast';
import { 
    Calendar, User, Clock, CheckCircle, MapPin, 
    ChevronRight, ChevronLeft, Activity, FileText 
} from 'lucide-react';

export default function AppointmentWizard() {
    const [step, setStep] = useState(1);
    const [locations, setLocations] = useState([]);
    const [selectedCity, setSelectedCity] = useState('');
    const [selectedDistrict, setSelectedDistrict] = useState('');
    const [hospitals, setHospitals] = useState([]);
    const [selectedHospitalId, setSelectedHospitalId] = useState('');
    const [branches] = useState([
        { name: "Kardiyoloji", icon: "❤️" },
        { name: "Göz Hastalıkları", icon: "👁️" },
        { name: "Kulak Burun Boğaz", icon: "👂" },
        { name: "Dahiliye (İç Hastalıkları)", icon: "🩺" },
        { name: "Nöroloji", icon: "🧠" },
        { name: "Ortopedi ve Travmatoloji", icon: "🦴" },
        { name: "Çocuk Sağlığı ve Hastalıkları", icon: "👶" },
        { name: "Genel Cerrahi", icon: "🔪" },
        { name: "Psikiyatri", icon: "🧘" }
    ]);
    const [selectedBranch, setSelectedBranch] = useState('');
    const [doctors, setDoctors] = useState([]);
    const [slots, setSlots] = useState([]);
    const [draftId, setDraftId] = useState(null);
    const [form, setForm] = useState({ doctorId: '', date: '', timeSlotId: '', notes: '' });

    useEffect(() => {
        api.get('/clinics').then(res => {
            const uniqueCities = [...new Set(res.data.map(c => c.city))].sort();
            setLocations(uniqueCities);
        });
    }, []);

    useEffect(() => {
        if (selectedCity) {
            api.get(`/clinics?city=${selectedCity}${selectedDistrict ? `&district=${selectedDistrict}` : ''}`)
               .then(res => setHospitals(res.data));
        }
    }, [selectedCity, selectedDistrict]);

    useEffect(() => {
        if (selectedHospitalId && selectedBranch) {
            api.get(`/doctors?clinicId=${selectedHospitalId}&branch=${selectedBranch}`)
               .then(res => setDoctors(res.data));
        }
    }, [selectedHospitalId, selectedBranch]);

    useEffect(() => {
        if (form.doctorId && form.date) {
            api.get(`/time-slots/doctor/${form.doctorId}?date=${form.date}`).then((r) => setSlots(r.data)).catch(() => setSlots([]));
        }
    }, [form.doctorId, form.date]);

    const saveDraft = async (patch) => {
        try {
            const res = await api.post('/enterprise/appointment-drafts', { id: draftId, ...form, ...patch, step });
            setDraftId(res.data.id);
        } catch (e) {
            console.error("Taslak kaydedilemedi", e);
        }
    };

    const onNext = async () => {
        await saveDraft({});
        setStep((s) => Math.min(6, s + 1));
    };

    const onPrev = () => {
        setStep((s) => Math.max(1, s - 1));
    };

    const onSubmit = async () => {
        try {
            await api.post('/appointments', { 
                doctorId: Number(form.doctorId), 
                timeSlotId: Number(form.timeSlotId), 
                notes: form.notes 
            });
            toast.success('Randevunuz başarıyla oluşturuldu.');
            setStep(6);
        } catch (e) {
            toast.error('Randevu oluşturulurken bir hata oluştu.');
        }
    };

    const variants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 }
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <Navbar />
            <main className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
                
                {/* Stepper Header */}
                <div className="mb-12">
                    <h1 className="text-3xl font-black text-slate-900 text-center tracking-tight mb-8">Kurumsal Randevu Sistemi</h1>
                    <div className="flex items-center justify-between relative max-w-3xl mx-auto">
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-200 -z-10 rounded-full"></div>
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-indigo-600 transition-all duration-500 -z-10 rounded-full" style={{ width: `${(step - 1) * 20}%` }}></div>
                        
                        {[
                            { num: 1, icon: <MapPin size={16} />, label: "İl/İlçe" },
                            { num: 2, icon: <Activity size={16} />, label: "Hastane" },
                            { num: 3, icon: <FileText size={16} />, label: "Branş" },
                            { num: 4, icon: <User size={16} />, label: "Hekim" },
                            { num: 5, icon: <Calendar size={16} />, label: "Zaman" },
                            { num: 6, icon: <CheckCircle size={16} />, label: "Onay" }
                        ].map((s) => (
                            <div key={s.num} className="flex flex-col items-center">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm transition-all duration-500 shadow-lg ${step >= s.num ? 'bg-indigo-600 text-white translate-y-[-4px] ring-4 ring-indigo-100' : 'bg-white text-slate-400 border-2 border-slate-100'}`}>
                                    {step > s.num ? <CheckCircle size={18} /> : s.icon}
                                </div>
                                <span className={`text-[8px] mt-2 font-black uppercase tracking-widest ${step >= s.num ? 'text-indigo-600' : 'text-slate-400'}`}>
                                    {s.label}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 p-8 min-h-[500px] relative">
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div key="step1" variants={variants} initial="hidden" animate="visible" exit="exit" className="space-y-8">
                                <div className="text-center">
                                    <h2 className="text-xl font-bold text-slate-800">Nerede muayene olmak istersiniz?</h2>
                                    <p className="text-slate-500 text-sm mt-2">İl ve ilçe seçerek size en yakın hastaneleri bulun.</p>
                                </div>
                                <div className="grid md:grid-cols-2 gap-6 max-w-xl mx-auto">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">İl Seçiniz</label>
                                        <select 
                                            className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-700 focus:border-indigo-500 outline-none transition-all"
                                            value={selectedCity}
                                            onChange={(e) => { setSelectedCity(e.target.value); setSelectedDistrict(''); }}
                                        >
                                            <option value="">Lütfen Seçiniz</option>
                                            {locations.map(city => <option key={city} value={city}>{city}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">İlçe Giriniz (Opsiyonel)</label>
                                        <input 
                                            className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-700 focus:border-indigo-500 outline-none transition-all"
                                            placeholder="İlçe adı giriniz..."
                                            value={selectedDistrict}
                                            onChange={(e) => setSelectedDistrict(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-center mt-8">
                                    <button disabled={!selectedCity} onClick={onNext} className="bg-slate-900 text-white px-12 py-4 rounded-2xl font-bold hover:bg-indigo-600 transition-all disabled:opacity-30">Hastaneleri Listele</button>
                                </div>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div key="step2" variants={variants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
                                <div className="text-center mb-8">
                                    <h2 className="text-xl font-bold text-slate-800">{selectedCity} İlindeki Hastaneler</h2>
                                </div>
                                <div className="grid gap-4 max-w-2xl mx-auto">
                                    {hospitals.map(h => (
                                        <button 
                                            key={h.id}
                                            onClick={() => { setSelectedHospitalId(h.id); onNext(); }}
                                            className={`p-5 rounded-2xl border-2 text-left flex items-center justify-between transition-all ${selectedHospitalId === h.id ? 'border-indigo-600 bg-indigo-50 shadow-md' : 'border-slate-100 hover:border-indigo-200 bg-white'}`}
                                        >
                                            <div>
                                                <h4 className="font-bold text-slate-800">{h.name}</h4>
                                                <p className="text-xs text-slate-500 font-medium mt-1">{h.district} / {h.city}</p>
                                            </div>
                                            <ChevronRight className="text-slate-300" />
                                        </button>
                                    ))}
                                </div>
                                <button onClick={onPrev} className="mt-8 text-slate-400 font-bold text-sm flex items-center gap-2 mx-auto"><ChevronLeft size={16}/> Geri Dön</button>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div key="step3" variants={variants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
                                <div className="text-center mb-8">
                                    <h2 className="text-xl font-bold text-slate-800">Tıbbi Birim (Poliklinik) Seçiniz</h2>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {branches.map(b => (
                                        <button 
                                            key={b.name}
                                            onClick={() => { setSelectedBranch(b.name); onNext(); }}
                                            className={`p-6 rounded-3xl border-2 flex flex-col items-center gap-3 transition-all ${selectedBranch === b.name ? 'border-indigo-600 bg-indigo-50 shadow-md' : 'border-slate-100 hover:border-indigo-200 bg-white'}`}
                                        >
                                            <span className="text-3xl">{b.icon}</span>
                                            <span className="font-bold text-xs text-center">{b.name}</span>
                                        </button>
                                    ))}
                                </div>
                                <button onClick={onPrev} className="mt-8 text-slate-400 font-bold text-sm flex items-center gap-2 mx-auto"><ChevronLeft size={16}/> Geri Dön</button>
                            </motion.div>
                        )}

                        {step === 4 && (
                            <motion.div key="step4" variants={variants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
                                <div className="text-center mb-8">
                                    <h2 className="text-xl font-bold text-slate-800">Hekiminizi Seçiniz</h2>
                                </div>
                                <div className="space-y-3 max-w-2xl mx-auto">
                                    {doctors.length === 0 ? (
                                        <p className="text-center py-12 text-slate-400 font-bold italic">Bu branşta henüz aktif hekim bulunmamaktadır.</p>
                                    ) : doctors.map(d => (
                                        <button 
                                            key={d.id}
                                            onClick={() => { setForm({...form, doctorId: d.id.toString()}); onNext(); }}
                                            className={`w-full p-4 rounded-2xl border-2 flex items-center gap-4 transition-all ${Number(form.doctorId) === d.id ? 'border-indigo-600 bg-indigo-50 shadow-md' : 'border-slate-100 hover:border-indigo-200 bg-white'}`}
                                        >
                                            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-black">DR</div>
                                            <div className="text-left">
                                                <h4 className="font-bold text-slate-800">{d.name}</h4>
                                                <p className="text-[10px] text-indigo-600 font-black uppercase tracking-widest">{d.branch}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                                <button onClick={onPrev} className="mt-8 text-slate-400 font-bold text-sm flex items-center gap-2 mx-auto"><ChevronLeft size={16}/> Geri Dön</button>
                            </motion.div>
                        )}

                        {step === 5 && (
                            <motion.div key="step5" variants={variants} initial="hidden" animate="visible" exit="exit" className="space-y-8">
                                <div className="text-center">
                                    <h2 className="text-xl font-bold text-slate-800">Randevu Tarihi ve Saati</h2>
                                </div>
                                <div className="grid md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Takvim</label>
                                        <input type="date" className="w-full p-4 bg-slate-100 rounded-2xl font-bold" min={new Date().toISOString().split('T')[0]} value={form.date} onChange={(e) => setForm({...form, date: e.target.value})} />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Müsaitlik</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {slots.length === 0 ? (
                                                <p className="col-span-full text-center text-xs text-red-500 font-bold">Uygun saat bulunamadı.</p>
                                            ) : slots.map(s => (
                                                <button 
                                                    key={s.id}
                                                    onClick={() => setForm({...form, timeSlotId: s.id.toString()})}
                                                    className={`p-3 rounded-xl border-2 text-xs font-black transition-all ${form.timeSlotId === s.id.toString() ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-500 border-slate-100'}`}
                                                >
                                                    {new Date(s.startTime).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <textarea className="w-full p-4 bg-slate-50 rounded-2xl text-sm font-medium" placeholder="Şikayetinizi buraya yazabilirsiniz (İsteğe bağlı)..." value={form.notes} onChange={(e) => setForm({...form, notes: e.target.value})} />
                                <div className="flex justify-between items-center bg-slate-900 rounded-3xl text-white p-6">
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Hızlı Özet</p>
                                        <p className="font-bold text-sm">{(doctors.find(d => d.id === Number(form.doctorId)))?.name || 'Seçilmedi'}</p>
                                    </div>
                                    <button disabled={!form.timeSlotId} onClick={onSubmit} className="bg-emerald-500 text-white px-8 py-3 rounded-xl font-black shadow-lg shadow-emerald-900/40 hover:bg-emerald-400 transition-all disabled:opacity-30">ONAYLA</button>
                                </div>
                            </motion.div>
                        )}

                        {step === 6 && (
                            <motion.div key="step6" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center py-12">
                                <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <CheckCircle size={48} />
                                </div>
                                <h2 className="text-3xl font-black text-slate-900 mb-4">Randevunuz Oluşturuldu!</h2>
                                <p className="text-slate-500 max-w-sm mx-auto mb-10 font-medium">Randevu bilgileriniz sistemimize kaydedilmiştir. Hekim onayı sonrası bildirim alacaksınız.</p>
                                <a href="/dashboard" className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black hover:bg-indigo-600 transition-all">Paneline Dön</a>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
}
