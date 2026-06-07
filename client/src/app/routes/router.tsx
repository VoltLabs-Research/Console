import { createBrowserRouter, Navigate } from 'react-router-dom';
import NotFoundPage from '@/app/routes/NotFoundPage';
import SignInPage from '@/modules/auth/components/SignInPage';
import DevicePage from '@/modules/device/components/DevicePage';

export const router = createBrowserRouter([
    {
        path: '/',
        element: <Navigate to='/device' replace />
    },
    {
        path: '/login',
        element: <SignInPage />
    },
    {
        path: '/device',
        element: <DevicePage />
    },
    {
        path: '*',
        element: <NotFoundPage />
    }
]);
