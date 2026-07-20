import { jwtDecode } from 'jwt-decode';

export const getUserPermissions = () => {
    const token = localStorage.getItem('access_token');
    if (!token) return [];

    try {
        const decoded = jwtDecode(token);
        return decoded.permissions || [];
    } catch (error) {
        console.error("Invalid token", error);
        return [];
    }
};

export const hasPermission = (slug) => {
    const permissions = getUserPermissions();
    return permissions.includes(slug);
};
