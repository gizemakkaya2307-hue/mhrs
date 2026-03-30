import { useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Mail, User, ShieldCheck, CheckCircle2, XCircle } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import AuthInput from '../components/AuthInput';
import AuthAlert from '../components/AuthAlert';

export default function Register() {
    const [form, setForm] = useState({ name: '', email: '', tcNo: '', password: '', confirmPassword: '' });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const { register } = useAuth();
    const navigate = useNavigate();

    // Password Strength Logic
    const passwordStrength = useMemo(() => {
        let score = 0;
        if (!form.password) return score;
        if (form.password.length >= 8) score += 1;
        if (/[A-Z]/.test(form.password)) score += 1;
        if (/[a-z]/.test(form.password)) score += 1;
        if (/[0-9]/.test(form.password)) score += 1;
        if (/[^A-Za-z0-9]/.test(form.password)) score += 1;
        return score;
    }, [form.password]);

    const strengthColor = useMemo(() => {
        if (passwordStrength <= 1) return 'bg-red-400';
        if (passwordStrength <= 3) return 'bg-amber-400';
        if (passwordStrength === 4) return 'bg-green-400';
        return 'bg-emerald-500';
    }, [passwordStrength]);

    const validationErrors = useMemo(() => {
        const errors = {};
        const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
        
        if (!form.name.trim()) errors.name = 'Ad Soyad zorunludur.';
        if (!form.email.trim()) errors.email = 'E-posta zorunludur.';
        else if (!emailOk) errors.email = 'Geçerli e-posta giriniz.';
        if (form.tcNo && !/^\d{11}$/.test(form.tcNo)) errors.tcNo = 'TC No 11 haneli olmalıdır.';
        if (form.password && passwordStrength < 5) errors.password = 'Şifre zayıf. Tüm standartları karşılamalıdır.';
        if (form.confirmPassword && form.confirmPassword !== form.password) errors.confirmPassword = 'Şifreler eşleşmiyor.';
        
        return errors;
    }, [form, passwordStrength]);

    const isTcValid = form.tcNo.length === 11 && /^\d{11}$/.test(form.tcNo);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        setSuccessMessage('');
        
        // Block submit if errors exist or fields are empty
        if (Object.keys(validationErrors).length > 0 || !form.tcNo || !form.password) {
            setErrorMessage('Lütfen formdaki tüm hataları düzeltin ve doldurun.');
            return;
        }

        setLoading(true);
        try {
            await register({ name: form.name, email: form.email, password: form.password, tcNo: form.tcNo });
            setSuccessMessage('Hesabınız başarıyla oluşturuldu. Giriş yapabilirsiniz.');
            setTimeout(() => navigate('/login'), 1500);
        } catch (err) {
            const data = err.response?.data;
            const msg = data?.error || data?.message || data?.errors?.[0]?.message || 'Kayıt başarısız.';
            setErrorMessage(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout title="Kayıt Ol" subtitle="MHRS kurumsal platformuna yeni hesap oluşturun">
            <form className="space-y-4" onSubmit={handleSubmit}>
                <AnimatePresence>
                    {errorMessage && <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}><AuthAlert type="error" message={errorMessage} /></motion.div>}
                    {successMessage && <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}><AuthAlert type="success" message={successMessage} /></motion.div>}
                </AnimatePresence>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <AuthInput
                        icon={User}
                        autoFocus
                        value={form.name}
                        onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                        placeholder="Ad Soyad"
                        error={validationErrors.name && form.name ? validationErrors.name : ''}
                    />
                    <div className="relative">
                        <AuthInput
                            icon={ShieldCheck}
                            value={form.tcNo}
                            onChange={(e) => setForm((prev) => ({ ...prev, tcNo: e.target.value.replace(/\D/g, '').slice(0, 11) }))}
                            placeholder="TC Kimlik No"
                            error={validationErrors.tcNo && form.tcNo ? validationErrors.tcNo : ''}
                        />
                        {form.tcNo && (
                            <div className="absolute right-3 top-3.5">
                                {isTcValid ? <CheckCircle2 size={18} className="text-emerald-500" /> : <XCircle size={18} className="text-slate-300" />}
                            </div>
                        )}
                    </div>
                </div>

                <AuthInput
                    icon={Mail}
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                    placeholder="E-posta adresi"
                    error={validationErrors.email && form.email ? validationErrors.email : ''}
                />
                
                <div className="space-y-1">
                    <AuthInput
                        icon={Lock}
                        showToggle
                        showPassword={showPassword}
                        onTogglePassword={() => setShowPassword((v) => !v)}
                        value={form.password}
                        onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                        placeholder="Güvenli Şifre"
                    />
                    
                    {/* Live Password Strength Meter */}
                    {form.password && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-2 px-1">
                            <div className="flex gap-1 mb-1 relative w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <motion.div 
                                    className={`absolute left-0 top-0 bottom-0 ${strengthColor}`}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(passwordStrength / 5) * 100}%` }}
                                    transition={{ duration: 0.3 }}
                                />
                            </div>
                            <div className="flex justify-between text-[10px] uppercase font-bold text-slate-400 mt-1">
                                <span>Güç: {passwordStrength === 0 ? 'Yok' : passwordStrength <= 2 ? 'Zayıf' : passwordStrength === 3 ? 'Orta' : passwordStrength === 4 ? 'İyi' : 'Çok Güçlü'}</span>
                                {passwordStrength === 5 && <span className="text-emerald-500">Hazır</span>}
                            </div>
                        </motion.div>
                    )}
                </div>

                <AuthInput
                    icon={Lock}
                    showToggle
                    showPassword={showConfirmPassword}
                    onTogglePassword={() => setShowConfirmPassword((v) => !v)}
                    value={form.confirmPassword}
                    onChange={(e) => setForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                    placeholder="Şifreyi Tekrarlayın"
                    error={validationErrors.confirmPassword && form.confirmPassword ? validationErrors.confirmPassword : ''}
                />

                <motion.button
                    whileTap={{ scale: 0.98 }}
                    whileHover={{ scale: 1.01 }}
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-500 hover:to-blue-400 text-white font-semibold py-3 shadow-lg shadow-indigo-200 disabled:opacity-60 transition-all"
                >
                    {loading ? 'Sistem Kaydı Yapılıyor...' : 'Hesap Oluştur'}
                </motion.button>

                <div className="text-center pt-3 text-sm font-medium">
                    <span className="text-slate-500">Zaten hesabınız var mı? </span>
                    <Link to="/login" className="text-indigo-600 hover:text-indigo-700 transition-colors">Sisteme Giriş Yap</Link>
                </div>
            </form>
        </AuthLayout>
    );
}
