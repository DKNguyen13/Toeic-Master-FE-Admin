export const config = {
    // Website URLs
    apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
    googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
    userPortalUrl: import.meta.env.VITE_USER_PORTAL_URL || 'http://localhost:3000',
};