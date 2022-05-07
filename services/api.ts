import axios, { AxiosError } from 'axios';
import { parseCookies, setCookie } from 'nookies';
import { signOut } from '../contexts/AuthContext';
import { AuthTokenError } from './errors/AuthTokenError';

let isRefreshing = false;
let failedRequestQueue: any = [];

export function setupAPIClinet(ctx: any = undefined) {
    let cookies = parseCookies(ctx);

    const api = axios.create({
        baseURL: 'http://localhost:3333',
        headers: {
            Authorization: `Bearer ${cookies['nextauth.token']}`,
        },
    });

    api.interceptors.response.use(
        (response) => {
            return response;
        },
        (error: AxiosError) => {
            // @ts-ignore
            if (error.response.status === 401) {
                // @ts-ignore
                if (error.response.data?.code === 'token.expired') {
                    cookies = parseCookies(ctx);

                    const { 'nextauth.refreshToken': refreshToken } = cookies;

                    const originalConfig = error.config;

                    if (!isRefreshing) {
                        isRefreshing = true;

                        api.post('/refresh', {
                            refreshToken,
                        })
                            .then((response) => {
                                const { token } = response.data;

                                setCookie(ctx, 'nextauth.token', token, {
                                    maxAge: 60 * 60 * 24 * 30, // 30 days
                                    path: '/',
                                });

                                setCookie(
                                    ctx,
                                    'nextauth.refreshToken',
                                    response.data.refreshToken,
                                    {
                                        maxAge: 60 * 60 * 24 * 30, // 30 days
                                        path: '/',
                                    }
                                );

                                // @ts-ignore
                                api.defaults.headers[
                                    'Authorization'
                                ] = `Bearer ${token}`;

                                failedRequestQueue.forEach((req: any) =>
                                    req.onSuccess(token)
                                );
                                failedRequestQueue = [];
                            })
                            .catch((error) => {
                                failedRequestQueue.forEach((req: any) =>
                                    req.onFailure(error)
                                );
                                failedRequestQueue = [];

                                if (process.browser) {
                                    signOut();
                                } else {
                                    return Promise.reject(new AuthTokenError());
                                }
                            })
                            .finally(() => {
                                isRefreshing = false;
                            });
                    }

                    return new Promise((resolve, reject) => {
                        failedRequestQueue.push({
                            onSuccess: (token: string) => {
                                // @ts-ignore
                                originalConfig.headers[
                                    'Authorization'
                                ] = `Bearer ${token}`;
                                resolve(api(originalConfig));
                            },
                            onFailure: (error: AxiosError) => reject(error),
                        });
                    });
                } else {
                    if (process.browser) {
                        signOut();
                    } else {
                        return Promise.reject(new AuthTokenError());
                    }
                }
            }

            return Promise.reject(error);
        }
    );

    return api;
}
