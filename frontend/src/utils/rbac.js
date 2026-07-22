import { jwtDecode } from 'jwt-decode';

export const getUserPermissions = () => {
    const token = localStorage.getItem('access_token');
    if (!token) return { permissions: [], role: null };

    try {
        const decoded = jwtDecode(token);
        return { 
            permissions: decoded.permissions || [],
            role: decoded.role || null
        };
    } catch (error) {
        console.error("Invalid token", error);
        return { permissions: [], role: null };
    }
};

export const hasPermission = (slug) => {
    const { permissions, role } = getUserPermissions();
    if (role === 'SUPER_ADMIN') return true;
    return permissions.includes(slug);
};
