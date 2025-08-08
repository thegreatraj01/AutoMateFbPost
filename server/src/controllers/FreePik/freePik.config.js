import axios from "axios";

export const FREEPIK_API = axios.create({
    baseURL: 'https://api.freepik.com/v1/ai',
    headers: {
        'Content-Type': 'application/json',
        'x-freepik-api-key': process.env.FREEPIK_API_KEY
    },
    timeout: 30000 // 30 seconds timeout
});