import { GetServerSideProps } from 'next';
import { setupAPIClinet } from '../services/api';
import { withSSRAuth } from '../utils/withSSRAuth';

export default function Metrics() {
    return (
        <>
            <h1>Metrics</h1>
        </>
    );
}

export const getServerSideProps: GetServerSideProps = withSSRAuth(
    async (ctx) => {
        const apiClient = setupAPIClinet(ctx);
        const response = await apiClient.get('me');

        return {
            props: {},
        };
    },
    {
        permissions: ['metrics.list'],
        roles: ['editor', 'administrator'],
    }
);
