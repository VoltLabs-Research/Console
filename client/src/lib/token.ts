const TOKEN_KEY = 'console.token';
const REFRESH_KEY = 'console.refresh';

export const getToken = (): string | null => {
    try {
        return window.localStorage.getItem(TOKEN_KEY);
    } catch {
        return null;
    }
};

export const setToken = (token: string): void => {
    try {
        window.localStorage.setItem(TOKEN_KEY, token);
    } catch {
        // ignore storage failures (e.g. private mode)
    }
};

export const getRefreshToken = (): string | null => {
    try {
        return window.localStorage.getItem(REFRESH_KEY);
    } catch {
        return null;
    }
};

export const setRefreshToken = (token: string): void => {
    try {
        window.localStorage.setItem(REFRESH_KEY, token);
    } catch {
        // ignore storage failures
    }
};

export const clearToken = (): void => {
    try {
        window.localStorage.removeItem(TOKEN_KEY);
        window.localStorage.removeItem(REFRESH_KEY);
    } catch {
        // ignore storage failures
    }
};
