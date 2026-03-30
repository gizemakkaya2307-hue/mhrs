import { useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Mail, Heart } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import AuthLayout from '../components/AuthLayout';
import AuthInput from '../components/AuthInput';
import AuthAlert from '../components/AuthAlert';

export default function Login() {
    const { t } = useTranslation();
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
        if (!form.email.trim()) errors.email = t('email_required', 'E-posta zorunludur.');
        else if (!emailOk) errors.email = t('email_invalid', 'Geçerli bir e-posta giriniz.');
        if (step === 1 && !form.password) errors.password = t('password_required', 'Şifre zorunludur.');
        if (step === 2 && form.code.length !== 6) errors.code = t('code_required', '6 haneli doğrulama kodu giriniz.');
        return errors;
    }, [form, step, t]);

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
                    setSuccessMessage('Başarıyla giriş yapıldı.');
                    navigate('/dashboard');
                }
            } else {
                await verify2FA(form.email, form.code);
                setSuccessMessage('Başarıyla giriş yapıldı.');
                navigate('/dashboard');
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
        <AuthLayout title={t('login')} subtitle={t('login_subtitle', 'MHRS kurumsal hesabınıza güvenli giriş')}>
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
                            placeholder="E-posta adresi"
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
                        className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-500 hover:to-blue-400 text-white font-semibold py-3 shadow-lg shadow-indigo-200 disabled:opacity-60 transition-all"
                    >
                        {loading ? t('processing', 'İşleniyor...') : step === 1 ? t('submitting', 'Sisteme Giriş Yap') : t('verify', 'Doğrula')}
                    </motion.button>

                    <div className="flex items-center justify-between text-sm font-medium pt-2">
                        <button type="button" className="text-slate-500 hover:text-indigo-600 transition-colors">{t('forgot_password', 'Şifremi unuttum')}</button>
                        <Link to="/register" className="text-indigo-600 hover:text-indigo-700 transition-colors">{t('register')}</Link>
                    </div>

                    <div className="relative my-4">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-200"></div>
                        </div>
                        <div className="relative flex justify-center text-xs">
                            <span className="px-3 bg-white text-slate-400 font-medium">{t('or', 'veya')}</span>
                        </div>
                    </div>

                    <Link
                        to="/doctor-login"
                        className="flex items-center justify-center gap-2 w-full rounded-xl border-2 border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold py-3 transition-all"
                    >
                        <Heart size={18} />
                        {t('doctor_login')}
                    </Link>
                </form>
            </AuthLayout>
    );
}
