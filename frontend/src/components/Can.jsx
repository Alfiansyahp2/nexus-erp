import React from 'react';
import { hasPermission } from '../utils/rbac';

/**
 * A wrapper component that conditionally renders its children
 * if the user has the required permission slug.
 * 
 * @param {string} access - The permission slug (e.g., 'finance.journal.create')
 * @param {ReactNode} children - The elements to render if permitted
 */
const Can = ({ access, children }) => {
    // Note: If you want superadmin to bypass everything natively on the frontend,
    // you could check a `role === 'Super Admin'` claim here too.
    if (hasPermission(access)) {
        return <>{children}</>;
    }
    return null;
};

export default Can;
