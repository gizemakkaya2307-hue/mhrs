import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity, Calendar, Clock, ShieldCheck, ArrowRight } from 'lucide-react';

export default function Home() {
    const { user } = useAuth();
    return (
        <div className="min-h-screen bg-slate-50 font-sans selection:bg-indigo-100">
            {/* Navbar */}
            <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-br from-indigo-600 to-blue-500 rounded-2xl shadow-lg shadow-indigo-200">
                            <Activity className="text-white" size={24} />
                        </div>
                        <span className="text-2xl font-black text-slate-800 tracking-tight">MHRS <span className="text-indigo-600 font-light">Enterprise</span></span>
                    </div>
                    <div className="flex items-center gap-6">
                        {user ? (
                             <Link to={user.role === 'DOCTOR' ? "/doctor-panel" : user.role === 'ADMIN' ? "/admin" : "/dashboard"} className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase tracking-widest px-6 py-3 rounded-xl transition-all shadow-md">
                                 SİSTEME GEÇ (Panelim)
                             </Link>
                        ) : (
                            <>
                                <Link to="/doctor-login" className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-colors hidden sm:block">Hekim Girişi</Link>
                                <Link to="/login" className="text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors hidden sm:block">Giriş Yap</Link>
                                <Link to="/register" className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-black uppercase tracking-widest px-6 py-3 rounded-xl transition-all shadow-md">Kayıt Ol</Link>
                            </>
                        )}
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="pt-40 pb-20 px-6 relative overflow-hidden">
                {/* Background Decorators */}
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[60rem] h-[60rem] bg-indigo-50 rounded-full blur-3xl opacity-50 -z-10 animate-pulse" />
                
                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="text-center max-w-4xl mx-auto">
                        <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase tracking-widest mb-8 border border-indigo-100 shadow-sm">
                            <span className="relative flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-500"></span>
                            </span>
                            v7.0 AI Destekli Randevu Sistemi Aktif
                        </div>
                        
                        <h1 className="text-6xl md:text-[5.5rem] font-black text-slate-900 tracking-tighter leading-[1.1] mb-8">
                            Sağlığınız İçin <br className="hidden sm:block" />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500">Akıllı Randevu</span> Ağı.
                        </h1>
                        
                        <p className="text-lg md:text-xl text-slate-500 font-medium mb-12 max-w-2xl mx-auto leading-relaxed">
                            81 il ve tüm ilçeleri kapsayan entegre sağlık ağı ile kapasite aşımına takılmadan doktorunuzu bulun, "Hızlı Randevu" teknolojisiyle işleminizi saniyeler içinde tamamlayın.
                        </p>
                        
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link to={user ? "/dashboard" : "/login"} className="w-full sm:w-auto px-10 py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-all hover:scale-105 hover:shadow-xl hover:shadow-indigo-200 flex items-center justify-center gap-3">
                                Hemen Randevu Al <ArrowRight size={20} />
                            </Link>
                            {!user && (
                                <Link to="/register" className="w-full sm:w-auto px-10 py-5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-2xl font-black text-sm uppercase tracking-widest transition-all hover:scale-105 shadow-sm">
                                    E-Nabız Profili Oluştur
                                </Link>
                            )}
                        </div>
                    </div>
                    
                    {/* Features Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-40">
                        {[
                            { icon: Clock, title: "Hızlı Randevu", desc: "Sizi listede boğmak yerine bulunduğunuz şehirdeki en yakın ve ilk müsait olan uzman hekimi anında sistem karşınıza çıkarır." },
                            { icon: Calendar, title: "Kapasite Güvenliği", desc: "Aynı saniyede oluşan çakışmaları (Race-condition) önleyen kurumsal seviye, gerçek kapasiteli akıllı saat slotları." },
                            { icon: ShieldCheck, title: "Bekleme Listesi Modülü", desc: "Gideceğiniz gün kapasite 100% dolu olsa bile çaresiz kalmayın. Waitlist Butonuna basıp ilk iptalde otomatik öncelik kazanın." }
                        ].map((feature, i) => (
                            <div key={i} className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-2 transition-transform duration-300">
                                <div className="w-16 h-16 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl flex items-center justify-center mb-6 border border-indigo-100">
                                    <feature.icon className="text-indigo-600" size={32} />
                                </div>
                                <h3 className="text-xl font-black text-slate-800 mb-3">{feature.title}</h3>
                                <p className="text-sm font-medium text-slate-500 leading-relaxed">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
            
            {/* Footer Minimal */}
            <footer className="border-t border-slate-200 bg-white py-10 text-center">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">&copy; 2026 T.C. Merkezi Hekim Randevu Simülasyonu - Enterprise v7.0</p>
            </footer>
        </div>
    );
}
