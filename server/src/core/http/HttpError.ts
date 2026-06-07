export interface HttpErrorBody {
    error: string;
    message?: string;
    [key: string]: unknown;
}

export class HttpError extends Error {
    public readonly status: number;
    public readonly code: string;
    public readonly extra: Record<string, unknown>;

    constructor(status: number, code: string, message?: string, extra: Record<string, unknown> = {}) {
        super(message ?? code);
        this.status = status;
        this.code = code;
        this.extra = extra;
    }

    toBody(): HttpErrorBody {
        return {
            error: this.code,
            ...(this.message && this.message !== this.code ? { message: this.message } : {}),
            ...this.extra
        };
    }

    static badRequest(message?: string, extra?: Record<string, unknown>): HttpError {
        return new HttpError(400, 'bad_request', message, extra);
    }

    static unauthorized(message?: string): HttpError {
        return new HttpError(401, 'unauthorized', message);
    }

    static forbidden(message?: string): HttpError {
        return new HttpError(403, 'forbidden', message);
    }

    static notFound(message?: string): HttpError {
        return new HttpError(404, 'not_found', message);
    }

    static conflict(message?: string): HttpError {
        return new HttpError(409, 'conflict', message);
    }

    static notImplemented(message?: string): HttpError {
        return new HttpError(501, 'not_implemented', message);
    }
}
