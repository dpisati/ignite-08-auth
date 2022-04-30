import axios, { AxiosError } from 'axios';
import { parseCookies, setCookie } from 'nookies';
import { signOut } from '../contexts/AuthContext';

let cookies = parseCookies();

let isRefreshing = false;
let failedRequestQueue: any = [];

export const api = axios.create({
    baseURL: 'http://localhost:3333',
    headers: {
        Authorization: `Bearer ${cookies['nextauth.token']}`,
    },
});

api.interceptors.response.use(
    (response) => {
        console.log('response successfully', response);
        return response;
    },
    (error: AxiosError) => {
        // @ts-ignore
        if (error.response.status === 401) {
            // @ts-ignore
            if (error.response.data?.code === 'token.expired') {
                cookies = parseCookies();

                const { 'nextauth.refreshToken': refreshToken } = cookies;

                const originalConfig = error.config;

                if (!isRefreshing) {
                    isRefreshing = true;

                    api.post('/refresh', {
                        refreshToken,
                    })
                        .then((response) => {
                            const { token } = response.data;

                            setCookie(undefined, 'nextauth.token', token, {
                                maxAge: 60 * 60 * 24 * 30, // 30 days
                                path: '/',
                            });

                            if (response.data.refreshtoken) {
                                console.log('🚀  newToken', response.data.refreshtoken);
                                setCookie(undefined, 'nextauth.refreshToken', response.data.refreshtoken, {
                                    maxAge: 60 * 60 * 24 * 30, // 30 days
                                    path: '/',
                                });
                            }

                            // @ts-ignore
                            api.defaults.headers['Authorization'] = `Bearer ${token}`;

                            failedRequestQueue.forEach((req: any) => req.onSuccess(token));
                            failedRequestQueue = [];
                        })
                        .catch((error) => {
                            failedRequestQueue.forEach((req: any) => req.onFailure(error));
                            failedRequestQueue = [];
                        })
                        .finally(() => {
                            isRefreshing = false;
                        });
                }

                return new Promise((resolve, reject) => {
                    failedRequestQueue.push({
                        onSuccess: (token: string) => {
                            // @ts-ignore
                            originalConfig.headers['Authorization'] = `Bearer ${token}`;
                            resolve(api(originalConfig));
                        },
                        onFailure: (error: AxiosError) => reject(error),
                    });
                });
            } else {
                // signOut();
            }
        }

        return Promise.reject(error);
    }
);
