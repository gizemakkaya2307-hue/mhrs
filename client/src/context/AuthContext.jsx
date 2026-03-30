import { createContext, useState, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        try {
            const storedUser = localStorage.getItem('user');
            return storedUser ? JSON.parse(storedUser) : null;
        } catch {
            return null;
        }
    });
    const loading = false; // Synchronous init now

    const login = async (email, password) => {
        const res = await api.post('/auth/login', { email, password });
        const payload = res.data?.data || res.data;

        if (payload.require2FA) {
            return payload; // { require2FA: true, email: ... }
        }

        localStorage.setItem('token', payload.accessToken);
        localStorage.setItem('refreshToken', payload.refreshToken);
        localStorage.setItem('user', JSON.stringify(payload.user));
        setUser(payload.user);
        return payload;
    };

    const verify2FA = async (email, code) => {
        const res = await api.post('/auth/verify-2fa', { email, code });
        const payload = res.data?.data || res.data;
        localStorage.setItem('token', payload.accessToken);
        localStorage.setItem('refreshToken', payload.refreshToken);
        localStorage.setItem('user', JSON.stringify(payload.user));
        setUser(payload.user);
        return payload;
    };

    const register = async (userData) => {
        const res = await api.post('/auth/register', userData);
        return res.data?.data || res.data;
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, verify2FA, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
