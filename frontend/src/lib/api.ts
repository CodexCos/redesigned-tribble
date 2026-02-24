import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1',
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // This allows cookies to be sent
});

// Response interceptor to handle session expiration
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Unset client side user state if unauthorized
            if (typeof window !== 'undefined') {
                // We'll let the AuthProvider handle the redirect/state cleanup
                console.warn('Unauthorized access detected');
            }
        }
        return Promise.reject(error);
    }
);

export default api;
