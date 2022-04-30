import { useContext, useLayoutEffect } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { api } from '../services/api';

export default function Dashboard() {
    const { user } = useContext(AuthContext);

    useLayoutEffect(() => {
        api.get('me')
            .then((res) => console.log('dashboard', res))
            .catch((err) => console.log('dashboard', err));
    }, []);

    return <h1>Dashboard: {user?.email}</h1>;
}
