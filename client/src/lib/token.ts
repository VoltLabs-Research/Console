const TOKEN_KEY = 'console.token';

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

export const clearToken = (): void => {
    try {
        window.localStorage.removeItem(TOKEN_KEY);
    } catch {
        // ignore storage failures
    }
};
