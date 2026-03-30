import { useState, useEffect } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';
import { Pill, Activity, FileText, User, Calendar, Beaker, CheckCircle2, AlertCircle } from 'lucide-react';

export default function HealthHistory() {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await api.get('/ux/e-nabiz');
                setAppointments(res.data);
            } catch {
                toast.error('Sağlık geçmişi yüklenemedi.');
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    if (loading) return <div className="p-8 text-center font-bold text-slate-500">Kayıtlar Yükleniyor...</div>;

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-12">
            <Navbar />
            
            {/* Header Area */}
            <div className="bg-indigo-600 pb-24 pt-10">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-4 text-white">
                        <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-3xl shadow-lg border border-white/20">
                            🩺
                        </div>
                        <div>
                            <h1 className="text-3xl font-black tracking-tight">E-Nabız Arşivi</h1>
                            <p className="text-indigo-200 font-medium text-sm mt-1">Geçmiş Muayene, Tahlil ve Reçete Verileriniz</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 space-y-6">
                {appointments.length === 0 ? (
                    <div className="bg-white p-16 rounded-[2rem] shadow-xl shadow-slate-200/50 text-center border border-slate-100">
                        <Activity className="mx-auto h-20 w-20 text-slate-200 mb-4" />
                        <h3 className="text-xl font-bold text-slate-700">Kayıt Bulunamadı</h3>
                        <p className="text-slate-500 font-medium mt-2">Sisteme kayıtlı geçmiş ziyaretiniz veya sağlık veriniz bulunmuyor.</p>
                    </div>
                ) : (
                    appointments.map(app => (
                        <div key={app.id} className="bg-white p-6 sm:p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 mb-8 overflow-hidden relative">
                            {/* Card Header */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6 mb-6">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="flex items-center gap-1.5 bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg text-xs font-bold w-fit">
                                            <Calendar size={14} /> {new Date(app.date).toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}
                                        </span>
                                        {app.dependent && (
                                            <span className="bg-amber-100 text-amber-700 px-3 py-1.5 rounded-lg text-xs font-bold">Yakını: {app.dependent.name}</span>
                                        )}
                                    </div>
                                    <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                                        <User size={20} className="text-slate-400" /> Dr. {app.doctor?.name} <span className="text-sm font-medium text-slate-400">({app.doctor?.branch})</span>
                                    </h2>
                                </div>
                                <div className="text-right">
                                    <span className="uppercase text-[10px] font-black tracking-widest text-slate-400 bg-slate-100 px-3 py-1 rounded-full">Protokol NO: {app.id}</span>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-8">
                                {/* Left Col: Diagnosis & Notes */}
                                <div className="space-y-6">
                                    {/* Diagnosis block */}
                                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5">
                                        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-3">
                                            <FileText size={16} className="text-indigo-500" /> Muayene Tanısı
                                        </h3>
                                        {app.visitRecord ? (
                                            <div>
                                                <p className="text-lg font-black text-slate-700 mb-2">{app.visitRecord.diagnosis}</p>
                                                <p className="text-sm text-slate-600 leading-relaxed italic border-l-2 border-indigo-200 pl-3">"{app.visitRecord.examinationNote}"</p>
                                            </div>
                                        ) : (
                                            <p className="text-sm text-slate-400 font-medium">Bu ziyaret için özel bir tanı girilmemiş.</p>
                                        )}
                                    </div>

                                    {/* Prescriptions */}
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-3">
                                            <Pill size={16} className="text-emerald-500" /> E-Reçete
                                        </h3>
                                        {app.prescriptionItems?.length > 0 ? (
                                            <div className="space-y-3">
                                                {app.prescriptionItems.map(item => (
                                                    <div key={item.id} className="flex flex-col bg-white border border-emerald-100 rounded-xl p-4 shadow-[0_2px_10px_-4px_rgba(16,185,129,0.2)]">
                                                        <div className="flex justify-between items-start mb-1">
                                                            <p className="font-bold text-slate-800">{item.medicineName}</p>
                                                            <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded text-xs font-bold">{item.durationDays} Gün</span>
                                                        </div>
                                                        <div className="flex gap-4 text-xs font-semibold text-slate-500 mt-2">
                                                            <span>Doz: <span className="text-slate-700">{item.dosage}</span></span>
                                                            <span>Sıklık: <span className="text-slate-700">{item.frequency}</span></span>
                                                        </div>
                                                        {item.instructions && <p className="text-[11px] text-slate-400 mt-2 bg-slate-50 p-1.5 rounded">{item.instructions}</p>}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-slate-400 font-medium bg-slate-50 p-4 rounded-xl border border-slate-100">Bu ziyarette ilaç yazılmamış.</p>
                                        )}
                                    </div>
                                </div>

                                {/* Right Col: Labs & Reports */}
                                <div className="space-y-6">
                                    {/* Lab Results */}
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-3">
                                            <Beaker size={16} className="text-rose-500" /> Laboratuvar Sonuçları
                                        </h3>
                                        {app.labResults?.length > 0 ? (
                                            <div className="bg-white border border-rose-100 rounded-2xl overflow-hidden shadow-[0_4px_20px_-8px_rgba(244,63,94,0.15)]">
                                                <table className="w-full text-left text-sm">
                                                    <thead className="bg-rose-50 border-b border-rose-100">
                                                        <tr>
                                                            <th className="px-4 py-3 font-bold text-rose-900">Tetkik Adı</th>
                                                            <th className="px-4 py-3 font-bold text-rose-900">Sonuç</th>
                                                            <th className="px-4 py-3 font-bold text-rose-900">Durum</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-slate-100">
                                                        {app.labResults.map(lab => (
                                                            <tr key={lab.id} className="hover:bg-slate-50">
                                                                <td className="px-4 py-3 font-semibold text-slate-700">{lab.testName} <p className="text-[10px] text-slate-400 font-normal">Ref: {lab.referenceRange}</p></td>
                                                                <td className="px-4 py-3 font-black text-slate-800">{lab.resultValue} <span className="text-xs font-medium text-slate-500">{lab.unit}</span></td>
                                                                <td className="px-4 py-3">
                                                                    {lab.status === 'NORMAL' ? (
                                                                        <span className="flex items-center gap-1 text-[10px] bg-emerald-100 text-emerald-700 font-black px-2 py-1 rounded w-fit"><CheckCircle2 size={12}/> NORMAL</span>
                                                                    ) : (
                                                                        <span className="flex items-center gap-1 text-[10px] bg-red-100 text-red-700 font-black px-2 py-1 rounded w-fit"><AlertCircle size={12}/> ANORMAL</span>
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        ) : (
                                            <p className="text-sm text-slate-400 font-medium bg-slate-50 p-4 rounded-xl border border-slate-100">Bu ziyarette tetkik istenmemiş.</p>
                                        )}
                                    </div>

                                    {/* Reports / Epikriz */}
                                    {app.reports?.length > 0 && (
                                        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 shadow-sm">
                                            <h3 className="text-sm font-bold text-amber-900 mb-3 flex items-center gap-2">⚠️ Tıbbi Raporlar</h3>
                                            <div className="space-y-3">
                                                {app.reports.map(rep => (
                                                    <div key={rep.id} className="bg-white border border-amber-100 rounded-xl p-3">
                                                        <h4 className="font-bold text-slate-800 text-sm mb-1">{rep.title}</h4>
                                                        <p className="text-xs text-slate-600 italic">"{rep.content}"</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
