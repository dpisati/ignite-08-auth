import Router from 'next/router';
import { createContext, ReactNode, useEffect, useState } from 'react';
import { api } from '../services/api';
import { setCookie, parseCookies, destroyCookie } from 'nookies';

type SignInCredentials = {
    email: string;
    password: string;
};

type AuthContextData = {
    signIn(credentials: SignInCredentials): Promise<void>;
    isAuthenticated: boolean;
    user: User;
};

type User = {
    email: string;
    permissions: string[];
    roles: string[];
};

interface AuthProviderProps {
    children: ReactNode;
    user: User;
}

export const AuthContext = createContext({} as AuthContextData);

export function signOut() {
    destroyCookie(undefined, 'nextauth.token');
    destroyCookie(undefined, 'nextauth.refreshToken');
    Router.push('/');
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User>();

    const isAuthenticated = !!user;

    useEffect(() => {
        const { 'nextauth.token': token } = parseCookies();

        if (token) {
            api.get('/me')
                .then((res) => {
                    const { email, permissions, roles } = res.data;
                    setUser({ email, permissions, roles });
                })
                .catch(() => {
                    // signOut();
                });
        }
    }, []);

    async function signIn({ email, password }: SignInCredentials) {
        try {
            const response = await api.post('/sessions', {
                email,
                password,
            });

            const { token, refreshToken, permissions, roles } = response.data;

            setCookie(undefined, 'nextauth.token', token, {
                maxAge: 60 * 60 * 24 * 30, // 30 days
                path: '/',
            });

            setCookie(undefined, 'nextauth.refreshToken', refreshToken, {
                maxAge: 60 * 60 * 24 * 30, // 30 days
                path: '/',
            });

            setUser({
                email,
                permissions,
                roles,
            });

            // @ts-ignore
            api.defaults.headers['Authorization'] = `Bearer ${token}`;

            Router.push('/dashboard');
        } catch (err) {
            console.error('Something went wrong on auth', err);
        }
    }
    // @ts-ignore
    return <AuthContext.Provider value={{ user, signIn, isAuthenticated }}>{children}</AuthContext.Provider>;
}
