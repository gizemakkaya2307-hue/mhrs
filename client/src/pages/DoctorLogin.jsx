import { useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Mail, Stethoscope, ShieldCheck } from 'lucide-react';
import AuthInput from '../components/AuthInput';
import AuthAlert from '../components/AuthAlert';

export default function DoctorLogin() {
    const [form, setForm] = useState({ email: '', password: '', code: '' });
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const { login, verify2FA } = useAuth();
    const navigate = useNavigate();

    const validationErrors = useMemo(() => {
        const errors = {};
        const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
        if (!form.email.trim()) errors.email = 'E-posta zorunludur.';
        else if (!emailOk) errors.email = 'Geçerli bir e-posta giriniz.';
        if (step === 1 && !form.password) errors.password = 'Şifre zorunludur.';
        if (step === 2 && form.code.length !== 6) errors.code = '6 haneli doğrulama kodu giriniz.';
        return errors;
    }, [form, step]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        setSuccessMessage('');
        if (Object.keys(validationErrors).length > 0) return;
        setLoading(true);
        try {
            if (step === 1) {
                const res = await login(form.email, form.password);
                if (res && res.require2FA) {
                    setStep(2);
                    setSuccessMessage(res.message || 'Lütfen kodunuzu girin.');
                } else {
                    // Check if user is actually a doctor
                    const user = res?.user;
                    if (user && user.role !== 'DOCTOR' && user.role !== 'ADMIN') {
                        setErrorMessage('Bu giriş yalnızca doktorlar içindir. Lütfen hasta girişini kullanınız.');
                        // Logout since wrong portal
                        localStorage.removeItem('token');
                        localStorage.removeItem('refreshToken');
                        localStorage.removeItem('user');
                        setLoading(false);
                        return;
                    }
                    setSuccessMessage('Başarıyla giriş yapıldı.');
                    navigate('/doctor-panel');
                }
            } else {
                const res = await verify2FA(form.email, form.code);
                const user = res?.user;
                if (user && user.role !== 'DOCTOR' && user.role !== 'ADMIN') {
                    setErrorMessage('Bu giriş yalnızca doktorlar içindir.');
                    localStorage.removeItem('token');
                    localStorage.removeItem('refreshToken');
                    localStorage.removeItem('user');
                    setLoading(false);
                    return;
                }
                setSuccessMessage('Başarıyla giriş yapıldı.');
                navigate('/doctor-panel');
            }
        } catch (err) {
            const data = err.response?.data;
            const msg = data?.error || data?.message || data?.errors?.[0]?.message || 'Doğrulama başarısız.';
            setErrorMessage(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex overflow-hidden font-sans">
            {/* Left Side: Doctor Brand */}
            <div className="hidden lg:flex w-1/2 bg-emerald-900 relative items-center justify-center p-12 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-teal-600/40 via-emerald-900 to-slate-900 mix-blend-multiply" />
                
                <div className="absolute top-10 left-10 text-white/20">
                    <Stethoscope size={120} strokeWidth={0.5} />
                </div>
                
                <motion.div 
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    className="relative z-10 max-w-lg text-white"
                >
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md shadow-xl border border-white/20">
                            <Stethoscope size={32} className="text-emerald-300" />
                        </div>
                        <h2 className="text-3xl font-bold tracking-tight">MHRS <span className="text-emerald-300 font-light">Doktor Portalı</span></h2>
                    </div>
                    <h1 className="text-5xl font-extrabold leading-tight mb-6 tracking-tight">
                        Hastalarınıza <br/> 
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
                        Güvenle Hizmet.
                        </span>
                    </h1>
                    <p className="text-lg text-emerald-200/90 leading-relaxed font-light">
                        Randevularınızı, reçetelerinizi ve hasta kayıtlarınızı güvenli doktor paneli üzerinden yönetin. Klinik notlar, laboratuvar sonuçları ve tele-sağlık hizmetleri tek platformda.
                    </p>
                    
                    <div className="mt-12 flex gap-4">
                        <div className="px-5 py-3 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm shadow-inner flex items-center gap-2">
                            <ShieldCheck size={16} className="text-emerald-400" />
                            <span className="text-sm font-medium text-emerald-100">Güvenli Bağlantı</span>
                        </div>
                        <div className="px-5 py-3 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm shadow-inner flex items-center gap-2">
                            <span className="text-sm font-medium text-emerald-100">Doktor Portalı</span>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Right Side: Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-white relative">
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-emerald-50 blur-3xl opacity-60 lg:hidden" />
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-teal-50 blur-3xl opacity-60 lg:hidden" />
                
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="w-full max-w-md relative z-10"
                >
                    <div className="text-center md:text-left mb-10">
                        <div className="flex lg:hidden items-center justify-center md:justify-start gap-2 mb-6">
                            <div className="p-2 bg-emerald-600 rounded-xl shadow-md">
                                <Stethoscope size={24} className="text-white" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">MHRS Doktor</h2>
                        </div>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Doktor Girişi</h1>
                        <p className="text-sm text-slate-500 mt-2 font-medium">Doktor portalına güvenli erişim</p>
                    </div>

                    <div className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-100/60">
                        <form className="space-y-4" onSubmit={handleSubmit}>
                            <AuthAlert type="error" message={errorMessage} />
                            <AuthAlert type="success" message={successMessage} />

                            {step === 1 ? (
                                <>
                                    <AuthInput
                                        icon={Mail}
                                        type="email"
                                        autoFocus
                                        value={form.email}
                                        onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                                        placeholder="Doktor e-posta adresi"
                                        error={validationErrors.email}
                                    />
                                    <AuthInput
                                        icon={Lock}
                                        showToggle
                                        showPassword={showPassword}
                                        onTogglePassword={() => setShowPassword((v) => !v)}
                                        value={form.password}
                                        onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                                        placeholder="Şifre"
                                        error={validationErrors.password}
                                    />
                                </>
                            ) : (
                                <AuthInput
                                    icon={Lock}
                                    autoFocus
                                    value={form.code}
                                    onChange={(e) => setForm((prev) => ({ ...prev, code: e.target.value.replace(/\D/g, '').slice(0, 6) }))}
                                    placeholder="6 haneli doğrulama kodu"
                                    error={validationErrors.code}
                                />
                            )}

                            <motion.button
                                whileTap={{ scale: 0.98 }}
                                whileHover={{ scale: 1.01 }}
                                type="submit"
                                disabled={loading}
                                className="w-full rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-semibold py-3 shadow-lg shadow-emerald-200 disabled:opacity-60 transition-all"
                            >
                                {loading ? 'İşleniyor...' : step === 1 ? 'Doktor Paneline Giriş' : 'Doğrula'}
                            </motion.button>

                            <div className="flex items-center justify-between text-sm font-medium pt-2">
                                <button type="button" className="text-slate-500 hover:text-emerald-600 transition-colors">Şifremi unuttum</button>
                                <Link to="/login" className="text-emerald-600 hover:text-emerald-700 transition-colors">Hasta Girişi →</Link>
                            </div>
                        </form>
                    </div>
                    
                    <div className="mt-8 text-center text-xs text-slate-400">
                        &copy; 2026 T.C. Sağlık Bakanlığı Simülasyonu
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
