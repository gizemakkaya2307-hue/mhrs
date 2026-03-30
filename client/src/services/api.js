import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3000/api',
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`; // Authorization header düzeltildi (Bearer eklendi)
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        const status = error?.response?.status;

        // 401 hatası ve henüz retry yapılmadıysa
        if (status === 401 && originalRequest && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('refreshToken');
                if (!refreshToken) {
                    // Refresh token yoksa logout
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    window.location.href = '/login';
                    return Promise.reject(error);
                }

                const res = await axios.post('http://localhost:3000/api/auth/refresh-token', {
                    token: refreshToken,
                });

                if (res.status === 200) {
                    const newAccessToken = res.data?.data?.accessToken || res.data?.accessToken;
                    if (!newAccessToken) throw new Error('Access token not found');
                    localStorage.setItem('token', newAccessToken);
                    api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
                    return api(originalRequest);
                }
            } catch (_err) {
                // Refresh token da geçersizse login'e at
                localStorage.removeItem('token');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('user');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
