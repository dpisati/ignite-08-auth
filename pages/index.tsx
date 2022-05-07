import type { GetServerSideProps } from 'next';
import { parseCookies } from 'nookies';
import { FormEvent, useContext, useState } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { withSSRGuest } from '../utils/withSSRGuest';

export default function Home() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const { signIn } = useContext(AuthContext);

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();

        const data = {
            email,
            password,
        };

        await signIn(data);
    }

    return (
        <form onSubmit={handleSubmit}>
            <input
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value as string)}
            />
            <input
                type="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value as string)}
            />

            <button type="submit">Submit</button>
        </form>
    );
}

export const getServerSideProps: GetServerSideProps = withSSRGuest(
    async (ctx) => {
        return {
            props: {},
        };
    }
);
