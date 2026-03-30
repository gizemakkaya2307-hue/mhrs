import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// the translations
const resources = {
  tr: {
    translation: {
      "hospital": "Hastane Randevu Sistemi",
      "login": "Giriş Yap",
      "register": "Kayıt Ol",
      "appointments": "Randevular",
      "dashboard": "Ana Ekran",
      "settings": "Ayarlar",
      "email": "E-posta Adresi",
      "password": "Şifre",
      "tc_no": "T.C. Kimlik No",
      "full_name": "Ad Soyad",
      "phone": "Telefon Numarası",
      "login_success": "Giriş başarılı",
      "login_error": "E-posta veya şifre hatalı",
      "not_found": "Sayfa bulunamadı",
      "doctor_login": "Doktor Girişi"
    }
  },
  en: {
    translation: {
      "hospital": "Hospital Appointment System",
      "login": "Login",
      "register": "Sign Up",
      "appointments": "Appointments",
      "dashboard": "Dashboard",
      "settings": "Settings",
      "email": "Email Address",
      "password": "Password",
      "tc_no": "National ID Number",
      "full_name": "Full Name",
      "phone": "Phone Number",
      "login_success": "Login successful",
      "login_error": "Invalid email or password",
      "not_found": "Page not found",
      "doctor_login": "Doctor Login"
    }
  },
  ar: {
    translation: {
      "hospital": "نظام موعد المستشفى",
      "login": "تسجيل الدخول",
      "register": "يسجل",
      "appointments": "مواعيد",
      "dashboard": "لوحة القيادة",
      "settings": "إعدادات",
      "email": "عنوان البريد الإلكتروني",
      "password": "كلمة المرور",
      "tc_no": "رقم الهوية الوطنية",
      "full_name": "الاسم الكامل",
      "phone": "رقم الهاتف",
      "login_success": "تم تسجيل الدخول بنجاح",
      "login_error": "البريد الإلكتروني أو كلمة المرور غير صالحة",
      "not_found": "الصفحة غير موجودة",
      "doctor_login": "تسجيل دخول الطبيب"
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'tr',
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    }
  });

export default i18n;
