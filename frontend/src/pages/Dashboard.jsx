import React from 'react';
import { getUserPermissions, hasPermission } from '../utils/rbac';

import AdminDashboard from './dashboard/AdminDashboard';
import EmployeeDashboard from './dashboard/EmployeeDashboard';

const Dashboard = () => {
    const { role } = getUserPermissions();

    const dashboardSlugs = [
        'view_global_dashboard',
        'view_hr_dashboard',
        'view_finance_dashboard',
        'view_inventory_dashboard',
        'view_sales_dashboard',
        'view_purchasing_dashboard'
    ];

    // Check if user has AT LEAST one dashboard permission (or is SUPER_ADMIN)
    const hasAnyDashboardPermission = role === 'SUPER_ADMIN' || dashboardSlugs.some(slug => hasPermission(slug));

    // Unified Command Center Rendering
    if (hasAnyDashboardPermission) {
        return <AdminDashboard />;
    }

    // Fallback for regular employees without specific dashboard access
    return <EmployeeDashboard />;
};

export default Dashboard;
