import { consoleUrl } from '@/lib/config';

export class ApiError extends Error {
    status: number;

    constructor(status: number, message: string) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
    }
}

export interface LoginResponse {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    tokenType: string;
}

export interface WhoamiResponse {
    accountId: string;
    email: string;
    username: string;
}

interface RequestOptions {
    method?: string;
    body?: unknown;
    token?: string;
}

const request = async (path: string, options: RequestOptions = {}): Promise<Response> => {
    const headers: Record<string, string> = {};

    if (options.body !== undefined) {
        headers['Content-Type'] = 'application/json';
    }
    if (options.token) {
        headers['Authorization'] = `Bearer ${options.token}`;
    }

    let response: Response;
    try {
        response = await fetch(`${consoleUrl}${path}`, {
            method: options.method ?? 'GET',
            headers,
            body: options.body !== undefined ? JSON.stringify(options.body) : undefined
        });
    } catch {
        throw new ApiError(0, 'Network error. Please check your connection and try again.');
    }

    if (!response.ok) {
        let message = `Request failed with status ${response.status}.`;
        try {
            const data = await response.json();
            if (data && typeof data === 'object') {
                message = (data.message as string) || (data.error as string) || message;
            }
        } catch {
            // non-JSON error body, keep the default message
        }
        throw new ApiError(response.status, message);
    }

    return response;
};

export interface CheckEmailResponse {
    exists: boolean;
}

export interface SignupResponse {
    accountId: string;
    username: string;
}

export const checkEmail = async (email: string): Promise<CheckEmailResponse> => {
    const response = await request('/auth/check-email', {
        method: 'POST',
        body: { email }
    });
    return response.json() as Promise<CheckEmailResponse>;
};

export const login = async (email: string, password: string): Promise<LoginResponse> => {
    const response = await request('/auth/login', {
        method: 'POST',
        body: { email, password }
    });
    return response.json() as Promise<LoginResponse>;
};

export const signup = async (
    email: string,
    username: string,
    password: string
): Promise<SignupResponse> => {
    const response = await request('/auth/signup', {
        method: 'POST',
        body: { email, username, password }
    });
    return response.json() as Promise<SignupResponse>;
};

export const whoami = async (token: string): Promise<WhoamiResponse> => {
    const response = await request('/auth/whoami', { token });
    return response.json() as Promise<WhoamiResponse>;
};

export const approveDevice = async (userCode: string, token: string): Promise<void> => {
    await request('/auth/device/approve', {
        method: 'POST',
        body: { userCode },
        token
    });
};

export const denyDevice = async (userCode: string, token: string): Promise<void> => {
    await request('/auth/device/deny', {
        method: 'POST',
        body: { userCode },
        token
    });
};
