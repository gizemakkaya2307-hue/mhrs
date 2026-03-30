import { useEffect, useMemo, useState } from 'react';
import Navbar from '../components/Navbar';
import api from '../services/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, User, FileText, CheckCircle, ChevronRight, ChevronLeft, MapPin } from 'lucide-react';

export default function AppointmentWizard() {
    const [step, setStep] = useState(1);
    const [doctors, setDoctors] = useState([]);
    const [slots, setSlots] = useState([]);
    const [draftId, setDraftId] = useState(null);
    const [form, setForm] = useState({ doctorId: '', date: '', timeSlotId: '', notes: '' });

    useEffect(() => {
        api.get('/doctors').then((r) => setDoctors(r.data.slice(0, 100))).catch(() => {});
    }, []);

    useEffect(() => {
        if (form.doctorId && form.date) {
            api.get(`/time-slots/doctor/${form.doctorId}?date=${form.date}`).then((r) => setSlots(r.data)).catch(() => setSlots([]));
        }
    }, [form.doctorId, form.date]);

    const currentDoctor = useMemo(() => doctors.find((d) => d.id === Number(form.doctorId)), [doctors, form.doctorId]);

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
        setStep((s) => Math.min(4, s + 1));
    };

    const onPrev = () => {
        setStep((s) => Math.max(1, s - 1));
    };

    const onSubmit = async () => {
        try {
            await api.post('/appointments', { doctorId: Number(form.doctorId), timeSlotId: Number(form.timeSlotId), notes: form.notes });
            toast.success('Randevunuz başarıyla oluşturuldu.');
            setStep(4);
        } catch (e) {
            toast.error('Randevu oluşturulurken bir hata oluştu.');
        }
    };

    const variants = {
        hidden: { opacity: 0, x: 20 },
        visible: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -20 }
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <Navbar />
            <main className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
                
                {/* Stepper Header */}
                <div className="mb-12">
                    <h1 className="text-3xl font-black text-slate-900 text-center tracking-tight mb-8">Randevu Planlama Asistanı</h1>
                    <div className="flex items-center justify-between relative max-w-2xl mx-auto">
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-200 -z-10 rounded-full"></div>
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-indigo-600 transition-all duration-500 -z-10 rounded-full" style={{ width: `${(step - 1) * 33.33}%` }}></div>
                        
                        {[
                            { num: 1, icon: <User size={18} />, label: "Uzman Seçimi" },
                            { num: 2, icon: <Calendar size={18} />, label: "Tarih" },
                            { num: 3, icon: <Clock size={18} />, label: "Saat & Notlar" },
                            { num: 4, icon: <CheckCircle size={18} />, label: "Onay" }
                        ].map((s) => (
                            <div key={s.num} className="flex flex-col items-center">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-sm transition-all duration-500 shadow-lg ${step >= s.num ? 'bg-indigo-600 text-white translate-y-[-4px] ring-4 ring-indigo-100' : 'bg-white text-slate-400 border-2 border-slate-100'}`}>
                                    {step > s.num ? <CheckCircle size={20} /> : s.icon}
                                </div>
                                <span className={`text-[10px] mt-3 font-black uppercase tracking-widest ${step >= s.num ? 'text-indigo-600' : 'text-slate-400'}`}>
                                    {s.label}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Form Container */}
                <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 p-8 min-h-[400px] relative overflow-hidden">
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div key="step1" variants={variants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
                                <div className="text-center mb-8">
                                    <h2 className="text-xl font-bold text-slate-800">Hangi uzmanla görüşmek istersiniz?</h2>
                                    <p className="text-slate-500 text-sm mt-2">Tedavi olmak istediğiniz poliklinik ve doktoru seçiniz.</p>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {doctors.map((d) => (
                                        <button
                                            key={d.id}
                                            onClick={() => setForm({ ...form, doctorId: d.id.toString() })}
                                            className={`p-4 rounded-2xl border-2 text-left transition-all flex items-start gap-4 ${form.doctorId === d.id.toString() ? 'border-indigo-600 bg-indigo-50 shadow-md' : 'border-slate-100 hover:border-indigo-200 hover:bg-slate-50'}`}
                                        >
                                            <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(d.name)}&background=4f46e5&color=fff&rounded=true`} alt={d.name} className="w-12 h-12 rounded-full shadow-sm" />
                                            <div>
                                                <h4 className={`font-bold ${form.doctorId === d.id.toString() ? 'text-indigo-900' : 'text-slate-800'}`}>{d.name}</h4>
                                                <p className="text-xs text-indigo-600 font-semibold mb-1">{d.branch}</p>
                                                <div className="flex items-center gap-1 text-[10px] text-slate-500 font-medium">
                                                    <MapPin size={10} /> {d.hospital}
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                                
                                <div className="mt-8 flex justify-end">
                                    <button disabled={!form.doctorId} onClick={onNext} className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                                        İleri <ChevronRight size={18} />
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div key="step2" variants={variants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
                                <div className="text-center mb-8">
                                    <h2 className="text-xl font-bold text-slate-800">Randevu Tarihi</h2>
                                    <p className="text-slate-500 text-sm mt-2">Lütfen doktorunuzun takviminden uygun bir gün seçiniz.</p>
                                </div>
                                
                                <div className="max-w-md mx-auto bg-slate-50 p-6 rounded-3xl border border-slate-100">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block mb-3 ml-1">Takvim</label>
                                    <input 
                                        type="date" 
                                        className="w-full text-lg font-bold text-slate-800 bg-white border-0 rounded-2xl p-4 shadow-sm focus:ring-2 focus:ring-indigo-600 cursor-pointer" 
                                        min={new Date().toISOString().split('T')[0]}
                                        value={form.date} 
                                        onChange={(e) => setForm({ ...form, date: e.target.value })} 
                                    />
                                </div>

                                <div className="mt-12 flex justify-between items-center border-t border-slate-100 pt-6">
                                    <button onClick={onPrev} className="text-slate-500 font-bold px-6 py-3 rounded-xl hover:bg-slate-50 flex items-center gap-2">
                                        <ChevronLeft size={18} /> Geri
                                    </button>
                                    <button disabled={!form.date} onClick={onNext} className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                                        İleri <ChevronRight size={18} />
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div key="step3" variants={variants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
                                <div className="text-center mb-8">
                                    <h2 className="text-xl font-bold text-slate-800">Saat ve Notlar</h2>
                                    <p className="text-slate-500 text-sm mt-2">Son olarak görüşme saatinizi belirleyip, şikayetinizi yazabilirsiniz.</p>
                                </div>

                                <div className="max-w-2xl mx-auto space-y-8">
                                    <div>
                                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block mb-3 ml-1">Uygun Saatler</label>
                                        <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                                            {slots.length === 0 ? (
                                                <div className="col-span-full py-4 text-center text-sm font-bold text-red-500 bg-red-50 rounded-xl border border-red-100">Bu tarihte boş randevu kalmamıştır. Lütfen geri dönüp başka tarih seçin.</div>
                                            ) : (
                                                slots.map((s) => (
                                                    <button 
                                                        key={s.id} 
                                                        onClick={() => setForm({ ...form, timeSlotId: s.id.toString() })}
                                                        className={`p-3 rounded-xl border-2 text-sm font-bold transition-all ${form.timeSlotId === s.id.toString() ? 'border-indigo-600 bg-indigo-600 text-white scale-105' : 'border-slate-100 bg-white text-slate-600 hover:border-indigo-200 hover:bg-slate-50'}`}
                                                    >
                                                        {new Date(s.startTime).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                                    </button>
                                                ))
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block mb-3 ml-1">Doktora Notunuz (Opsiyonel)</label>
                                        <div className="relative">
                                            <div className="absolute top-4 left-4 text-slate-400"><FileText size={18} /></div>
                                            <textarea 
                                                className="w-full bg-slate-50 border-0 rounded-2xl p-4 pl-12 text-sm font-medium focus:ring-2 focus:ring-indigo-600 focus:bg-white resize-none h-32" 
                                                placeholder="Şikayetlerinizi veya doktorunuzun bilmesini istediğiniz detayları buraya yazabilirsiniz..." 
                                                value={form.notes} 
                                                onChange={(e) => setForm({ ...form, notes: e.target.value })} 
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-12 flex justify-between items-center border-t border-slate-100 pt-6 max-w-2xl mx-auto">
                                    <button onClick={onPrev} className="text-slate-500 font-bold px-6 py-3 rounded-xl hover:bg-slate-50 flex items-center gap-2">
                                        <ChevronLeft size={18} /> Geri
                                    </button>
                                    <button disabled={!form.timeSlotId} onClick={onSubmit} className="bg-emerald-600 shadow-xl shadow-emerald-200 text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                                        <CheckCircle size={18} /> Onayla ve Bitir
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {step === 4 && (
                            <motion.div key="step4" variants={variants} initial="hidden" animate="visible" className="py-12 text-center">
                                <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <CheckCircle size={48} />
                                </div>
                                <h2 className="text-3xl font-black text-slate-900 mb-4">Randevunuz Onaylandı!</h2>
                                <p className="text-slate-500 max-w-md mx-auto mb-8 font-medium leading-relaxed">Randevu bilgileriniz sistemimize kaydedilmiş olup detaylar e-posta adresinize gönderilmiştir. Sağlıklı günler dileriz.</p>
                                
                                {currentDoctor && (
                                    <div className="inline-flex flex-col text-left bg-slate-50 p-6 rounded-2xl border border-slate-100 mb-8">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Randevu Özeti</p>
                                        <p className="font-bold text-slate-800">{currentDoctor.name} ({currentDoctor.branch})</p>
                                        <p className="text-sm text-slate-600">{new Date(form.date).toLocaleDateString('tr-TR')} - {slots.find(s => s.id.toString() === form.timeSlotId)?.time || ''}</p>
                                        <p className="text-xs text-slate-500 mt-2"><MapPin size={12} className="inline mr-1" />{currentDoctor.hospital}</p>
                                    </div>
                                )}
                                
                                <div>
                                    <a href="/dashboard" className="inline-flex items-center gap-2 text-indigo-600 font-bold hover:text-indigo-800 transition-colors">
                                        <ChevronLeft size={18} /> Ana Ekrana Dön
                                    </a>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
}
