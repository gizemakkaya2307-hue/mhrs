import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';
import { doctorPanelService } from '../services/doctorPanelService';
import toast from 'react-hot-toast';
import { 
    Calendar, Users, CalendarCheck, Clock, CheckCircle2, 
    XCircle, FileText, Activity, User, PlusCircle, Beaker, Pill 
} from 'lucide-react';

export default function DoctorPanel() {
    const today = new Date().toISOString().slice(0, 10);
    const [date, setDate] = useState(today);
    const [loading, setLoading] = useState(false);
    const [upcoming, setUpcoming] = useState([]);
    const [past, setPast] = useState([]);
    const [activeTab, setActiveTab] = useState('upcoming');
    const [selectedId, setSelectedId] = useState(null);
    const [detail, setDetail] = useState(null);
    const [history, setHistory] = useState([]);
    const [saving, setSaving] = useState(false);
    const [activeDetailTab, setActiveDetailTab] = useState('genel');
    const [showLabForm, setShowLabForm] = useState(false);
    const [labForm, setLabForm] = useState({
        testName: '',
        resultValue: '',
        unit: '',
        referenceRange: '',
        status: 'NORMAL'
    });
    const [form, setForm] = useState({
        diagnosis: '',
        examinationNote: '',
        prescriptionItems: [{ medicineName: '', dosage: '', frequency: '', durationDays: 7, instructions: '' }]
    });

    const fetchDaily = async (targetDate = date) => {
        setLoading(true);
        try {
            const res = await doctorPanelService.getDailyAppointments(targetDate);
            setUpcoming(res.upcoming || []);
            setPast(res.past || []);
        } catch (error) {
            toast.error(error.response?.data?.error || 'Randevular yüklenemedi.');
        } finally {
            setLoading(false);
        }
    };

    const openDetail = async (id) => {
        try {
            setSelectedId(id);
            setActiveDetailTab('genel');
            const appointment = await doctorPanelService.getAppointmentDetail(id);
            setDetail(appointment);
            setForm({
                diagnosis: appointment.visitRecord?.diagnosis || '',
                examinationNote: appointment.visitRecord?.examinationNote || '',
                prescriptionItems: appointment.prescriptionItems?.length
                    ? appointment.prescriptionItems.map((p) => ({
                        medicineName: p.medicineName,
                        dosage: p.dosage,
                        frequency: p.frequency,
                        durationDays: p.durationDays,
                        instructions: p.instructions || ''
                    }))
                    : [{ medicineName: '', dosage: '', frequency: '', durationDays: 7, instructions: '' }]
            });
            const patientHistory = await doctorPanelService.getPatientHistory(appointment.userId);
            setHistory(patientHistory);
        } catch (error) {
            toast.error(error.response?.data?.error || 'Randevu detayı yüklenemedi.');
        }
    };

    const submitClinical = async (e) => {
        e.preventDefault();
        if (!selectedId) return;
        setSaving(true);
        try {
            await doctorPanelService.addClinicalNote(selectedId, form);
            toast.success('Klinik not ve reçete başarıyla kaydedildi.');
            await openDetail(selectedId);
            await fetchDaily();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Klinik kayıt kaydedilemedi.');
        } finally {
            setSaving(false);
        }
    };

    const changeStatus = async (status) => {
        if (!selectedId) return;
        try {
            await doctorPanelService.updateStatus(selectedId, status);
            toast.success('Randevu durumu güncellendi.');
            await openDetail(selectedId);
            await fetchDaily();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Durum güncellenemedi.');
        }
    };

    const currentList = useMemo(() => (activeTab === 'upcoming' ? upcoming : past), [activeTab, upcoming, past]);
    const totalAppointments = upcoming.length + past.length;

    const addPrescriptionRow = () => {
        setForm((prev) => ({
            ...prev,
            prescriptionItems: [...prev.prescriptionItems, { medicineName: '', dosage: '', frequency: '', durationDays: 7, instructions: '' }]
        }));
    };

    const updatePrescriptionRow = (idx, key, value) => {
        setForm((prev) => ({
            ...prev,
            prescriptionItems: prev.prescriptionItems.map((row, i) => i === idx ? { ...row, [key]: value } : row)
        }));
    };

    const submitLab = async (e) => {
        e.preventDefault();
        if (!selectedId) return;
        setSaving(true);
        try {
            await doctorPanelService.addLabResult({ ...labForm, appointmentId: selectedId });
            toast.success('Laboratuvar sonucu eklendi.');
            setShowLabForm(false);
            setLabForm({ testName: '', resultValue: '', unit: '', referenceRange: '', status: 'NORMAL' });
            await openDetail(selectedId);
        } catch (error) {
            toast.error(error.response?.data?.error || 'Laboratuvar sonucu eklenemedi.');
        } finally {
            setSaving(false);
        }
    };

    const handleRequestLab = () => {
        setShowLabForm(!showLabForm);
    };

    // eslint-disable-next-line react-hooks/set-state-in-effect
    useEffect(() => { fetchDaily(today); }, []);

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <Navbar />
            
            {/* Header Block */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                            <Activity className="text-indigo-600" size={28} />
                            Hekim Çalışma Alanı
                        </h1>
                        <p className="text-sm text-slate-500 font-medium">Günlük poliklinik akışı ve hasta yönetimi</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="bg-slate-100 p-1.5 rounded-xl flex items-center border border-slate-200">
                            <Calendar size={18} className="text-slate-400 ml-2" />
                            <input 
                                type="date" 
                                className="bg-transparent border-none text-sm font-semibold text-slate-700 focus:ring-0 cursor-pointer" 
                                value={date} 
                                onChange={(e) => setDate(e.target.value)} 
                            />
                        </div>
                        <button onClick={() => fetchDaily()} className="bg-indigo-600 text-white px-4 py-2.5 rounded-xl font-bold shadow-sm shadow-indigo-200 text-sm hover:bg-indigo-700 transition">
                            Güncelle
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
                {/* Metrics Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center"><Users size={24} /></div>
                        <div>
                            <p className="text-sm font-semibold text-slate-400">Toplam Randevu</p>
                            <p className="text-2xl font-black text-slate-800">{totalAppointments}</p>
                        </div>
                    </div>
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center"><Clock size={24} /></div>
                        <div>
                            <p className="text-sm font-semibold text-slate-400">Bekleyen</p>
                            <p className="text-2xl font-black text-slate-800">{upcoming.length}</p>
                        </div>
                    </div>
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center"><CalendarCheck size={24} /></div>
                        <div>
                            <p className="text-sm font-semibold text-slate-400">Geçmiş (Bugün)</p>
                            <p className="text-2xl font-black text-slate-800">{past.length}</p>
                        </div>
                    </div>
                </div>

                <div className="grid lg:grid-cols-12 gap-6">
                    {/* Left Column: Timeline */}
                    <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[calc(100vh-280px)]">
                        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                            <div className="flex bg-slate-200/50 p-1 rounded-xl">
                                <button className={`flex-1 py-1.5 text-sm font-bold rounded-lg transition-colors ${activeTab === 'upcoming' ? 'bg-white shadow-sm text-indigo-700' : 'text-slate-500'}`} onClick={() => setActiveTab('upcoming')}>Bekleyenler</button>
                                <button className={`flex-1 py-1.5 text-sm font-bold rounded-lg transition-colors ${activeTab === 'past' ? 'bg-white shadow-sm text-indigo-700' : 'text-slate-500'}`} onClick={() => setActiveTab('past')}>Geçmiş</button>
                            </div>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-3 space-y-2">
                            {loading ? (
                                <div className="animate-pulse space-y-3">
                                    {[1,2,3].map(i => <div key={i} className="h-20 bg-slate-100 rounded-xl"></div>)}
                                </div>
                            ) : currentList.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-3">
                                    <Clock size={40} className="opacity-20" />
                                    <p className="text-sm font-medium">Bu listede randevu bulunmuyor.</p>
                                </div>
                            ) : (
                                currentList.map(a => (
                                    <motion.button
                                        key={a.id}
                                        whileHover={{ scale: 1.01 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => openDetail(a.id)}
                                        className={`w-full text-left flex gap-3 p-3 rounded-xl border transition-all ${selectedId === a.id ? 'bg-indigo-50 border-indigo-200 ring-1 ring-indigo-200' : 'bg-white border-slate-100 hover:border-slate-300'}`}
                                    >
                                        <div className={`h-10 w-10 flex-shrink-0 rounded-full flex justify-center items-center text-sm font-bold ${selectedId === a.id ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                            {new Date(a.date).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                        <div className="overflow-hidden">
                                            <p className="font-bold text-slate-800 text-sm truncate">{a.user?.name}</p>
                                            <p className="text-xs font-semibold text-slate-400 truncate tracking-wide mt-0.5">{a.status}</p>
                                        </div>
                                    </motion.button>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Right Column: Patient Detail */}
                    <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-sm h-[calc(100vh-280px)] overflow-hidden flex flex-col">
                        {!detail ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                                <User size={56} className="mb-4 opacity-20" />
                                <h3 className="text-lg font-bold text-slate-600">Hasta Seçilmedi</h3>
                                <p className="text-sm mt-1">Detayları görmek için listeden bir randevu seçin.</p>
                            </div>
                        ) : (
                            <>
                                {/* Detail Header */}
                                <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
                                    <div className="flex items-center gap-4">
                                        <div className="h-14 w-14 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center">
                                            <User size={28} />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-black text-slate-800">{detail.user?.name}</h2>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-xs font-bold px-2 py-0.5 bg-slate-200 text-slate-600 rounded-md tracking-wider">{detail.user?.tcNo}</span>
                                                <span className="text-xs font-medium text-slate-500">{detail.user?.email}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => changeStatus('COMPLETED')} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold hover:bg-emerald-100">
                                            <CheckCircle2 size={14} /> Tamamlandı
                                        </button>
                                        <button onClick={() => changeStatus('NO_SHOW')} className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold hover:bg-rose-100">
                                            <XCircle size={14} /> Gelmedi
                                        </button>
                                    </div>
                                </div>

                                {/* Tabs */}
                                <div className="px-5 pt-4 border-b border-slate-100">
                                    <div className="flex gap-6">
                                        {['genel', 'klinik', 'recete'].map((tab) => (
                                            <button 
                                                key={tab}
                                                onClick={() => setActiveDetailTab(tab)}
                                                className={`pb-3 text-sm font-bold border-b-2 transition-colors ${activeDetailTab === tab ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                                            >
                                                {tab === 'genel' ? 'Geçmiş Kayıtlar' : tab === 'klinik' ? 'Muayene Notu' : 'Reçete & Tetkik'}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Tab Content Wrapper */}
                                <div className="flex-1 overflow-y-auto p-5 bg-white">
                                    <AnimatePresence mode="wait">
                                        {/* GENEL TAB */}
                                        {activeDetailTab === 'genel' && (
                                            <motion.div key="genel" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                                                <div className="flex items-center justify-between mb-4">
                                                    <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                                                        <FileText size={16} className="text-indigo-500"/> Önceki Ziyaretler
                                                    </h3>
                                                </div>
                                                {history.length === 0 ? (
                                                    <div className="p-8 border-2 border-dashed border-slate-200 rounded-2xl text-center">
                                                        <p className="text-sm font-semibold text-slate-400">Hastanın önceki ziyareti bulunmuyor.</p>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-3">
                                                        {history.map(h => (
                                                            <div key={h.id} className="p-4 rounded-xl border border-slate-200 hover:border-indigo-200 transition-colors bg-slate-50/50">
                                                                <div className="flex justify-between items-start mb-2">
                                                                    <span className="text-xs font-black text-slate-500 tracking-wider">
                                                                        {new Date(h.date).toLocaleDateString('tr-TR', { day:'numeric', month:'short', year:'numeric' })}
                                                                    </span>
                                                                    <span className="text-[10px] font-bold px-2 py-1 bg-slate-200 text-slate-600 rounded-md">{h.status}</span>
                                                                </div>
                                                                {h.visitRecord?.diagnosis ? (
                                                                    <div className="space-y-1">
                                                                        <p className="text-sm font-bold text-slate-800">Tanı: <span className="text-indigo-600">{h.visitRecord.diagnosis}</span></p>
                                                                        <p className="text-xs text-slate-600 pt-1 border-t border-slate-200">{h.visitRecord.examinationNote}</p>
                                                                    </div>
                                                                ) : (
                                                                    <p className="text-xs text-slate-400 font-medium pb-1">Tanı girilmemiş.</p>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </motion.div>
                                        )}

                                        {/* KLİNİK NOT TAB */}
                                        {activeDetailTab === 'klinik' && (
                                            <motion.form id="clinicalForm" onSubmit={submitClinical} key="klinik" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5">
                                                <div>
                                                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Klinik Tanı (ICD-10 Ön Tipi)</label>
                                                    <input 
                                                        className="w-full border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm p-3 font-semibold transition-all" 
                                                        placeholder="Örn: J03.9 Akut tonsillit" 
                                                        value={form.diagnosis} 
                                                        onChange={(e) => setForm({ ...form, diagnosis: e.target.value })} 
                                                        required 
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Muayene Bulguları & Notlar</label>
                                                    <textarea 
                                                        className="w-full border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm p-3 font-medium transition-all" 
                                                        rows={6} 
                                                        placeholder="Hastanın şikayetleri, muayene bulguları ve anamnez..." 
                                                        value={form.examinationNote} 
                                                        onChange={(e) => setForm({ ...form, examinationNote: e.target.value })} 
                                                        required 
                                                    />
                                                </div>
                                                <button type="submit" disabled={saving} className="w-full py-3 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold shadow-md shadow-slate-300 transition-all flex justify-center items-center gap-2">
                                                    <FileText size={18} /> {saving ? 'Kaydediliyor...' : 'Klinik Notu Kaydet'}
                                                </button>
                                            </motion.form>
                                        )}

                                        {/* RECETE / LABORATUVAR TAB */}
                                        {activeDetailTab === 'recete' && (
                                            <motion.div key="recete" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                                                
                                                {/* Lab Skeleton Action */}
                                                <div className="p-5 border border-blue-100 bg-blue-50/50 rounded-2xl flex flex-col md:flex-row md:items-center justify-between shadow-sm gap-4">
                                                    <div>
                                                        <h4 className="font-bold text-blue-900 flex items-center gap-2"><Beaker size={18}/> Hızlı Tetkik & Laboratuvar</h4>
                                                        <p className="text-xs text-blue-700/80 mt-1 font-medium">Bu hastaya POC (Hızlı) Tahlil sonucu girin.</p>
                                                    </div>
                                                    <button onClick={handleRequestLab} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-sm transition-colors w-fit">
                                                        {showLabForm ? 'Kapat' : '+ Sonuç Gir'}
                                                    </button>
                                                </div>

                                                {/* Inline Lab Form */}
                                                <AnimatePresence>
                                                    {showLabForm && (
                                                        <motion.form 
                                                            onSubmit={submitLab}
                                                            initial={{ opacity: 0, height: 0 }} 
                                                            animate={{ opacity: 1, height: 'auto' }} 
                                                            exit={{ opacity: 0, height: 0 }} 
                                                            className="bg-white border border-blue-200 rounded-xl p-4 space-y-3 overflow-hidden"
                                                        >
                                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                                                <input className="text-sm p-2 bg-slate-50 border border-slate-200 rounded-lg" placeholder="Test Adı (örn: Hemoglobin)" value={labForm.testName} onChange={(e) => setLabForm({ ...labForm, testName: e.target.value })} required />
                                                                <input className="text-sm p-2 bg-slate-50 border border-slate-200 rounded-lg" placeholder="Sonuç Değeri (örn: 14.2)" value={labForm.resultValue} onChange={(e) => setLabForm({ ...labForm, resultValue: e.target.value })} required />
                                                                <input className="text-sm p-2 bg-slate-50 border border-slate-200 rounded-lg" placeholder="Birim (örn: g/dL)" value={labForm.unit} onChange={(e) => setLabForm({ ...labForm, unit: e.target.value })} />
                                                                <input className="text-sm p-2 bg-slate-50 border border-slate-200 rounded-lg" placeholder="Referans Aralığı (örn: 12-16)" value={labForm.referenceRange} onChange={(e) => setLabForm({ ...labForm, referenceRange: e.target.value })} />
                                                            </div>
                                                            <div className="flex items-center justify-between">
                                                                <select className="text-sm p-2 bg-slate-50 border border-slate-200 rounded-lg font-bold" value={labForm.status} onChange={(e) => setLabForm({ ...labForm, status: e.target.value })}>
                                                                    <option value="NORMAL" className="text-emerald-600">NORMAL</option>
                                                                    <option value="ABNORMAL" className="text-red-600">ANORMAL</option>
                                                                </select>
                                                                <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-900 text-white text-sm font-bold rounded-lg shadow-sm">
                                                                    {saving ? 'Kaydediliyor...' : 'Kaydet'}
                                                                </button>
                                                            </div>
                                                        </motion.form>
                                                    )}
                                                </AnimatePresence>

                                                <hr className="border-slate-100" />

                                                {/* E-Reçete Form */}
                                                <div>
                                                    <div className="flex items-center justify-between mb-4">
                                                        <div>
                                                            <h4 className="font-bold text-slate-800 flex items-center gap-2"><Pill size={18} className="text-emerald-500"/> E-Reçete Düzenle</h4>
                                                            <p className="text-xs text-slate-500 mt-1 font-medium">Reçeteye eklenecek ilaçları ve kullanım talimatlarını girin.</p>
                                                        </div>
                                                        <button type="button" onClick={addPrescriptionRow} className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg hover:bg-indigo-100 transition-colors">
                                                            <PlusCircle size={14} /> Kalem Ekle
                                                        </button>
                                                    </div>
                                                    
                                                    <form id="rxForm" onSubmit={submitClinical} className="space-y-3">
                                                        {form.prescriptionItems.map((row, idx) => (
                                                            <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-2 md:grid-cols-5 gap-3">
                                                                <input className="col-span-2 text-sm p-2 w-full bg-white border border-slate-200 rounded-lg focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400" placeholder="İlaç Adı (örn: Parol 500)" value={row.medicineName} onChange={(e) => updatePrescriptionRow(idx, 'medicineName', e.target.value)} />
                                                                <input className="text-sm p-2 w-full bg-white border border-slate-200 rounded-lg focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400" placeholder="Doz: 1x1" value={row.dosage} onChange={(e) => updatePrescriptionRow(idx, 'dosage', e.target.value)} />
                                                                <input className="text-sm p-2 w-full bg-white border border-slate-200 rounded-lg focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400" placeholder="Sıklık (Tok)" value={row.frequency} onChange={(e) => updatePrescriptionRow(idx, 'frequency', e.target.value)} />
                                                                <input className="text-sm p-2 w-full bg-white border border-slate-200 rounded-lg focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400" placeholder="Gün" type="number" min="1" value={row.durationDays} onChange={(e) => updatePrescriptionRow(idx, 'durationDays', Number(e.target.value))} />
                                                            </div>
                                                        ))}
                                                        
                                                        <button type="submit" disabled={saving} className="w-full mt-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-sm shadow-emerald-200 transition-colors flex justify-center items-center gap-2">
                                                            <CheckCircle2 size={18} /> {saving ? 'İşleniyor...' : 'Reçeteyi Onayla'}
                                                        </button>
                                                    </form>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
