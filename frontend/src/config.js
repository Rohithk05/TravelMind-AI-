// API Configuration
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const config = {
    apiUrl: API_URL,
    endpoints: {
        auth: {
            login: `${API_URL}/api/auth/login`,
            register: `${API_URL}/api/auth/register`,
            me: `${API_URL}/api/auth/me`,
            logout: `${API_URL}/api/auth/logout`,
        },
        ai: {
            chat: `${API_URL}/api/ai/chat`,
            plan: `${API_URL}/api/ai/plan`,
            insight: `${API_URL}/api/ai/insight`,
        },
        media: {
            videos: `${API_URL}/api/media/videos`,
        },
    },
};

export default config;
