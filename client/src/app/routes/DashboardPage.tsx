import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Heading, Loader, Stack } from '@voltstack/bravais';
import { usePageTitle } from '@/shared/presentation/hooks/use-page-title';
import { whoami } from '@/lib/api';
import { getToken } from '@/lib/token';

const DashboardPage = () => {
    usePageTitle('Dashboard');

    const token = getToken();
    const [username, setUsername] = useState<string | null>(null);
    const [authed, setAuthed] = useState(Boolean(token));

    useEffect(() => {
        if (!token) {
            return;
        }
        whoami(token)
            .then((me) => setUsername(me.username))
            .catch(() => setAuthed(false));
    }, [token]);

    if (!authed) {
        return <Navigate to='/login' replace />;
    }

    return (
        <Stack justify='center' align='start' height='vh-max' p='2'>
            {username ? (
                <Heading level={1} size='xl' weight='bold'>Welcome, {username}!</Heading>
            ) : (
                <Loader scale={1} />
            )}
        </Stack>
    );
};

export default DashboardPage;
