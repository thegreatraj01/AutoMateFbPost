import axios from 'axios';


const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    withCredentials: true,
});

// Request interceptor (optional, for adding headers, logging, etc.)
api.interceptors.request.use((config) => {
    // You can log or modify config here
    return config;
});


// Response interceptor
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        // console.log('api interceptor error', error);
        const originalRequest = error.config;
        // If token expired (e.g., 401) and retry not yet attempted
        if (error.response?.data?.statusCode === 401
            && error.response?.data?.message === "Token expired. Please refresh your token."
            && !originalRequest._retry
        ) {
            originalRequest._retry = true;
            try {

                const res = await api.post('/user/refresh-token');
                console.log('refresh token api res', res);
                if (res.data.success) {
                    return api(originalRequest);
                }
            } catch (refreshError) {
                console.log(refreshError);
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
)

export default api;