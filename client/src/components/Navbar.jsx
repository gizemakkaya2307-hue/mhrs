import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { Bell, Check, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Navbar() {
    const { t, i18n } = useTranslation();
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    
    // Notification State
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const dropdownRef = useRef(null);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const fetchNotifications = async () => {
        if (!user) return;
        try {
            const res = await api.get('/enterprise/notifications');
            setNotifications(res.data);
        } catch (error) {
            console.error('Bildirimler alınamadı', error);
        }
    };

    const markAsRead = async (id, e) => {
        e.stopPropagation();
        try {
            await api.patch(`/enterprise/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
        } catch (error) {
            console.error('Bildirim okundu işaretlenemedi', error);
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Setup simple polling every 60s for demo purposes (usually done via Socket.io)
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, [user]);

    // Close click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <nav className="bg-white dark:bg-gray-800 shadow transition-colors relative z-50">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 justify-between">
                    <div className="flex">
                        <div className="flex flex-shrink-0 items-center">
                            <Link to="/" className="flex items-center gap-2">
                                <div className="bg-indigo-600 text-white p-1 rounded">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
                                    </svg>
                                </div>
                                <span className="text-xl font-bold text-gray-900 dark:text-white ml-2 hidden sm:block">MHRS <span className="font-light">Enterprise</span></span>
                                <span className="bg-indigo-100 text-indigo-700 text-[10px] px-1.5 py-0.5 rounded font-black border border-indigo-200 ml-1">v7.0</span>
                            </Link>
                        </div>
                        <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                            {user && (
                                <>
                                    {user.role === 'USER' && (
                                        <>
                                            <Link to="/dashboard" className="inline-flex items-center border-b-2 border-indigo-500 px-1 pt-1 text-sm font-medium text-gray-900 dark:text-gray-100">
                                                Randevularım
                                            </Link>
                                            <Link to="/health-history" className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-500 hover:border-indigo-300 hover:text-gray-700 dark:text-gray-300">
                                                E-Nabız Arşivi
                                            </Link>
                                            <Link to="/health-profile" className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-500 hover:border-indigo-300 hover:text-gray-700 dark:text-gray-300">
                                                Sağlık Profili
                                            </Link>
                                        </>
                                    )}
                                    {user.role === 'DOCTOR' && (
                                        <Link to="/doctor-panel" className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-500 hover:border-indigo-300 hover:text-gray-700 dark:text-gray-300">
                                            Doktor Paneli
                                        </Link>
                                    )}
                                    {user.role === 'ADMIN' && (
                                        <Link to="/admin" className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-500 hover:border-indigo-300 hover:text-gray-700 dark:text-gray-300">
                                            Yönetim Paneli
                                        </Link>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                    <div className="hidden sm:ml-6 sm:flex sm:items-center">
                        <div className="flex items-center space-x-2 mr-4 cursor-pointer relative group">
                            <span className="text-xl">🌐</span>
                            <div className="absolute right-0 top-full mt-2 w-24 bg-white dark:bg-gray-800 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all grid grid-cols-1 overflow-hidden z-50">
                                <button onClick={() => i18n.changeLanguage('tr')} className="px-4 py-2 text-sm hover:bg-indigo-50 dark:hover:bg-gray-700 font-bold transition">TR</button>
                                <button onClick={() => i18n.changeLanguage('en')} className="px-4 py-2 text-sm hover:bg-indigo-50 dark:hover:bg-gray-700 font-bold transition">EN</button>
                                <button onClick={() => i18n.changeLanguage('ar')} className="px-4 py-2 text-sm hover:bg-indigo-50 dark:hover:bg-gray-700 font-bold transition">AR</button>
                            </div>
                        </div>

                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-full text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none mr-4"
                            aria-label="Toggle Dark Mode"
                        >
                            {theme === 'light' ? '🌙' : '☀️'}
                        </button>

                        {user && (
                            <div className="relative mr-4" ref={dropdownRef}>
                                <button
                                    onClick={() => setShowNotifications(!showNotifications)}
                                    className="p-2 relative rounded-full text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-gray-700 transition"
                                >
                                    <Bell size={20} />
                                    {unreadCount > 0 && (
                                        <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 bg-red-500 rounded-full ring-2 ring-white"></span>
                                    )}
                                </button>

                                {showNotifications && (
                                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden transform opacity-100 scale-100 transition-all origin-top-right">
                                        <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                                            <h3 className="text-sm font-bold text-slate-800">Bildirim Merkezi</h3>
                                            {unreadCount > 0 && (
                                                <span className="bg-indigo-100 text-indigo-700 text-xs font-black px-2 py-0.5 rounded-md">{unreadCount} Yeni</span>
                                            )}
                                        </div>
                                        <div className="max-h-80 overflow-y-auto">
                                            {notifications.length === 0 ? (
                                                <div className="p-6 text-center text-sm text-slate-400 font-medium">Bildiriminiz bulunmuyor.</div>
                                            ) : (
                                                <ul className="divide-y divide-slate-100">
                                                    {notifications.map(num => (
                                                        <li key={num.id} className={`p-4 flex gap-3 transition-colors ${num.isRead ? 'bg-white opacity-70' : 'bg-indigo-50/30'}`}>
                                                            <div className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${num.isRead ? 'bg-transparent' : 'bg-indigo-500'}`}></div>
                                                            <div className="flex-1">
                                                                <p className={`text-sm ${num.isRead ? 'text-slate-600 font-medium' : 'text-slate-900 font-bold'}`}>{num.title}</p>
                                                                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{num.message}</p>
                                                                <p className="text-[10px] text-slate-400 mt-1 font-semibold">{new Date(num.createdAt).toLocaleString('tr-TR')}</p>
                                                            </div>
                                                            {!num.isRead && (
                                                                <button onClick={(e) => markAsRead(num.id, e)} className="text-indigo-600 hover:text-indigo-800 p-1 rounded-full hover:bg-indigo-100 self-start" title="Okundu İşaretle">
                                                                    <Check size={14} />
                                                                </button>
                                                            )}
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                        <div className="p-2 border-t border-slate-100 bg-slate-50 text-center">
                                            <button onClick={() => setShowNotifications(false)} className="text-xs font-bold text-slate-500 hover:text-slate-800">Kapat</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {user && (
                            <>
                                <span className="mr-4 text-sm text-gray-700 dark:text-gray-300">Merhaba, <b className="dark:text-white">{user.name}</b></span>
                                <button
                                    onClick={handleLogout}
                                    className="rounded-md bg-rose-50 dark:bg-gray-700 text-rose-600 dark:text-white px-3 py-1.5 text-sm font-bold shadow-sm hover:bg-rose-100 transition border border-rose-200"
                                >
                                    Çıkış
                                </button>
                            </>
                        )}
                    </div>
                    
                    <div className="-mr-2 flex items-center sm:hidden">
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                        >
                            <span className="sr-only">Menüyü aç</span>
                            {mobileMenuOpen ? (
                                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            ) : (
                                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                                </svg>
                            )}
                        </button>
                    </div>

                </div>
            </div>
            
            {mobileMenuOpen && (
                <div className="sm:hidden">
                    <div className="space-y-1 pt-2 pb-3">
                        {user && (
                            <>
                                {user.role === 'USER' && (
                                    <>
                                        <Link to="/dashboard" className="block border-l-4 border-indigo-500 bg-indigo-50 py-2 pl-3 pr-4 text-base font-medium text-indigo-700">Randevularım</Link>
                                        <Link to="/health-history" className="block border-l-4 border-transparent py-2 pl-3 pr-4 text-base font-medium text-gray-500 hover:bg-gray-50">E-Nabız Arşivi</Link>
                                        <Link to="/health-profile" className="block border-l-4 border-transparent py-2 pl-3 pr-4 text-base font-medium text-gray-500 hover:bg-gray-50">Sağlık Profili</Link>
                                    </>
                                )}
                                {user.role === 'DOCTOR' && (
                                    <Link to="/doctor-panel" className="block border-l-4 border-transparent py-2 pl-3 pr-4 text-base font-medium text-gray-500 hover:bg-gray-50">Doktor Paneli</Link>
                                )}
                                {user.role === 'ADMIN' && (
                                    <Link to="/admin" className="block border-l-4 border-transparent py-2 pl-3 pr-4 text-base font-medium text-gray-500 hover:border-gray-300 hover:bg-gray-50">Yönetim Paneli</Link>
                                )}
                                <button onClick={handleLogout} className="block w-full text-left border-l-4 border-transparent py-2 pl-3 pr-4 text-base font-medium text-red-500 hover:border-gray-300 hover:bg-gray-50">Çıkış Yap</button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
