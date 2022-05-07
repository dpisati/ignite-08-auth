import { GetServerSideProps } from 'next';
import { useContext, useEffect } from 'react';
import { Can } from '../components/Can';
import { AuthContext } from '../contexts/AuthContext';
import { useCan } from '../hooks/useCan';
import { setupAPIClinet } from '../services/api';
import { api } from '../services/apiClient';

import { withSSRAuth } from '../utils/withSSRAuth';

export default function Dashboard() {
    const { user, signOut } = useContext(AuthContext);
    const userCanSeeMetrics = useCan({
        roles: ['editor', 'administrator'],
    });

    useEffect(() => {
        api.get('me')
            .then((res) => console.log('dashboard component - ', res))
            .catch((err) => console.log('dashboard component - ', err));
    }, []);

    return (
        <>
            <h1>Dashboard: {user?.email}</h1>
            <Can permissions={['metrics.list']}>
                <div>Metrics</div>
            </Can>
            <button onClick={signOut}>Sign Out</button>
        </>
    );
}

export const getServerSideProps: GetServerSideProps = withSSRAuth(
    async (ctx) => {
        const apiClient = setupAPIClinet(ctx);
        const response = await apiClient.get('me');
        console.log('🚀 ~response', response);

        return {
            props: {},
        };
    }
);
