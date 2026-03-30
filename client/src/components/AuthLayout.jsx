import { motion } from 'framer-motion';
import { Activity } from 'lucide-react';

export default function AuthLayout({ title, subtitle, children }) {
    return (
        <div className="min-h-screen bg-slate-50 flex overflow-hidden font-sans">
            {/* Left Side: Brand & Visuals */}
            <div className="hidden lg:flex w-1/2 bg-indigo-900 relative items-center justify-center p-12 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-600/40 via-indigo-900 to-slate-900 mix-blend-multiply" />
                
                {/* Decorative Elements */}
                <div className="absolute top-10 left-10 text-white/20">
                    <Activity size={120} strokeWidth={0.5} />
                </div>
                
                <motion.div 
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    className="relative z-10 max-w-lg text-white"
                >
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md shadow-xl border border-white/20">
                            <Activity size={32} className="text-blue-300" />
                        </div>
                        <h2 className="text-3xl font-bold tracking-tight">MHRS <span className="text-blue-300 font-light">Enterprise</span></h2>
                    </div>
                    <h1 className="text-5xl font-extrabold leading-tight mb-6 tracking-tight">
                        Sağlığınız İçin <br/> 
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">
                        Güvenli Adım.
                        </span>
                    </h1>
                    <p className="text-lg text-indigo-200/90 leading-relaxed font-light">
                        81 il ve tüm ilçeleri kapsayan entegre sağlık ağı ile randevularınızı, tahlillerinizi ve reçetelerinizi tek bir merkezden, en yüksek güvenlik standartlarıyla yönetin.
                    </p>
                    
                    <div className="mt-12 flex gap-4">
                        <div className="px-5 py-3 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm shadow-inner flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="text-sm font-medium text-indigo-100">Sistem Aktif</span>
                        </div>
                        <div className="px-5 py-3 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm shadow-inner flex items-center gap-2">
                            <span className="text-sm font-medium text-indigo-100">v7.0 Enterprise</span>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Right Side: Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-white relative">
                {/* Mobile Background Elements */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-blue-50 blur-3xl opacity-60 lg:hidden" />
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-indigo-50 blur-3xl opacity-60 lg:hidden" />
                
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="w-full max-w-md relative z-10"
                >
                    <div className="text-center md:text-left mb-10">
                        <div className="flex lg:hidden items-center justify-center md:justify-start gap-2 mb-6">
                            <div className="p-2 bg-indigo-600 rounded-xl shadow-md">
                                <Activity size={24} className="text-white" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">MHRS</h2>
                        </div>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{title}</h1>
                        <p className="text-sm text-slate-500 mt-2 font-medium">{subtitle}</p>
                    </div>

                    <div className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-100/60">
                        {children}
                    </div>
                    
                    <div className="mt-8 text-center text-xs text-slate-400">
                        &copy; 2026 T.C. Sağlık Bakanlığı Simülasyonu
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
