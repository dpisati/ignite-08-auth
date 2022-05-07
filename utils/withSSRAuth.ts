import {
    GetServerSideProps,
    GetServerSidePropsContext,
    GetServerSidePropsResult,
} from 'next';
import { destroyCookie, parseCookies } from 'nookies';
import { AuthTokenError } from '../services/errors/AuthTokenError';
import decode from 'jwt-decode';
import { validadeUserPermission } from './validadeUserPermissions';

type WithSSRAuthOptions = {
    permissions: string[];
    roles: string[];
};

export function withSSRAuth<P>(
    fn: GetServerSideProps<P>,
    options?: WithSSRAuthOptions
) {
    return async (
        ctx: GetServerSidePropsContext
    ): Promise<GetServerSidePropsResult<P>> => {
        const cookies = parseCookies(ctx);
        const token = cookies['nextauth.token'];

        if (!token) {
            return {
                redirect: {
                    destination: '/',
                    permanent: false,
                },
            };
        }

        if (options) {
            const user = decode<{ permissions: string[]; roles: string[] }>(
                token
            );

            if (user) {
                const { permissions, roles } = options;
                const userHasValidPermission = validadeUserPermission({
                    user,
                    permissions,
                    roles,
                });

                if (!userHasValidPermission) {
                    return {
                        redirect: {
                            destination: '/dashboard',
                            permanent: false,
                        },
                    };
                }
            }
        }

        try {
            return await fn(ctx);
        } catch (err) {
            if (err instanceof AuthTokenError) {
                destroyCookie(ctx, 'nextauth.token');
                destroyCookie(ctx, 'nextauth.refreshToken');

                return {
                    redirect: {
                        destination: '/',
                        permanent: false,
                    },
                };
            }
            return {
                redirect: {
                    destination: '/',
                    permanent: false,
                },
            };
        }
    };
}
