import { useContext, useEffect } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { api } from '../services/api';

export default function Dashboard() {
    const { user } = useContext(AuthContext);

    useEffect(() => {
        api.get('me')
            .then((res) => console.log('dashboard component - ', res))
            .catch((err) => console.log('dashboard component - ', err));
    }, []);

    return (
        <>
            <h1>Dashboard: {user?.email}</h1>
        </>
    );
}
