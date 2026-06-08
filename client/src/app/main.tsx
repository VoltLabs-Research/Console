import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from '@/app/App';
import AppToaster from '@/shared/presentation/components/AppToaster';

import '@voltstack/bravais/styles.css';
import '@voltstack/bravais/components.css';
import '@/shared/presentation/assets/stylesheets/fonts.css';
import '@/shared/presentation/assets/stylesheets/base.css';

const container = document.getElementById('root');
if (!container) {
    throw new Error('Root container not found');
}

createRoot(container).render(
    <StrictMode>
        <App />
        <AppToaster />
    </StrictMode>
);
