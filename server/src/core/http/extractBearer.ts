export const extractBearer = (header: string | undefined): string | null => {
    if (!header) {
        return null;
    }
    const match = /^Bearer\s+(.+)$/i.exec(header.trim());
    return match && match[1] ? match[1].trim() : null;
};
