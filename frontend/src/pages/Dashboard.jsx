import React from 'react';
import { Typography } from 'antd';
import { getUserPermissions } from '../utils/rbac';

import AdminDashboard from './dashboard/AdminDashboard';
import HRDashboard from './dashboard/HRDashboard';
import FinanceDashboard from './dashboard/FinanceDashboard';
import InventoryDashboard from './dashboard/InventoryDashboard';
import SalesDashboard from './dashboard/SalesDashboard';
import PurchasingDashboard from './dashboard/PurchasingDashboard';
import EmployeeDashboard from './dashboard/EmployeeDashboard';

const Dashboard = () => {
    const { role } = getUserPermissions();

    // Render component based on user role
    switch (role) {
        case 'SUPER_ADMIN':
            return <AdminDashboard />;
        case 'HR_ADMIN':
            return <HRDashboard />;
        case 'FINANCE_ADMIN':
            return <FinanceDashboard />;
        case 'INVENTORY_ADMIN':
            return <InventoryDashboard />;
        case 'SALES_ADMIN':
            return <SalesDashboard />;
        case 'PURCHASING_ADMIN':
            return <PurchasingDashboard />;
        case 'EMPLOYEE':
        default:
            return <EmployeeDashboard />;
    }
};

export default Dashboard;
