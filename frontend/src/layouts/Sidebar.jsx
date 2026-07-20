import React from 'react';
import { Layout, Menu } from 'antd';
import { hasPermission } from '../utils/rbac';
import {
    DashboardOutlined,
    TeamOutlined,
    UserOutlined,
    ClusterOutlined,
    IdcardOutlined,
    FormOutlined,
    DollarOutlined,
    BankOutlined,
    AccountBookOutlined,
    AppstoreOutlined,
    InboxOutlined,
    SwapOutlined,
    ShopOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';

const { Sider } = Layout;

const Sidebar = ({ collapsed }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const handleMenuClick = ({ key }) => {
        navigate(key);
    };

    const rawMenuItems = [
        {
            key: '/dashboard',
            icon: <DashboardOutlined />,
            label: 'Dashboard',
            permission: 'dashboard.view'
        },
        {
            key: 'hr_master',
            icon: <TeamOutlined />,
            label: 'HR Master',
            children: [
                {
                    key: '/hr/employees',
                    icon: <UserOutlined />,
                    label: 'Employees',
                    permission: 'hr.employee.view'
                },
                {
                    key: '/hr/departments',
                    icon: <ClusterOutlined />,
                    label: 'Departments',
                    permission: 'hr.department.view'
                },
                {
                    key: '/hr/positions',
                    icon: <IdcardOutlined />,
                    label: 'Positions',
                    permission: 'hr.position.view'
                }
            ]
        },
        {
            key: '/leave-requests',
            icon: <FormOutlined />,
            label: 'Leave Requests',
            permission: 'hr.leave.view'
        },
        {
            key: '/payroll',
            icon: <DollarOutlined />,
            label: 'Payroll',
            permission: 'hr.payroll.view'
        },
        {
            key: 'finance',
            icon: <BankOutlined />,
            label: 'Finance',
            children: [
                {
                    key: '/finance/accounts',
                    icon: <AccountBookOutlined />,
                    label: 'Chart of Accounts',
                    permission: 'finance.account.view'
                },
                {
                    key: '/finance/journals',
                    icon: <FormOutlined />,
                    label: 'Journal Entries',
                    permission: 'finance.journal.view'
                }
            ]
        },
        {
            key: 'inventory',
            icon: <AppstoreOutlined />,
            label: 'Inventory',
            children: [
                {
                    key: '/inventory/categories',
                    icon: <AppstoreOutlined />,
                    label: 'Product Categories',
                    permission: 'inventory.category.view'
                },
                {
                    key: '/inventory/products',
                    icon: <InboxOutlined />,
                    label: 'Products',
                    permission: 'inventory.product.view'
                },
                {
                    key: '/inventory/warehouses',
                    icon: <ShopOutlined />,
                    label: 'Warehouses',
                    permission: 'inventory.warehouse.view'
                },
                {
                    key: '/inventory/stock-balances',
                    icon: <AppstoreOutlined />,
                    label: 'Stock Balances',
                    permission: 'inventory.stock.view'
                },
                {
                    key: '/inventory/stock-movements',
                    icon: <SwapOutlined />,
                    label: 'Stock Movements',
                    permission: 'inventory.movement.view'
                }
            ]
        }
    ];

    const menuItems = rawMenuItems.map(item => {
        if (item.children) {
            return {
                ...item,
                children: item.children.filter(child => !child.permission || hasPermission(child.permission))
            };
        }
        return item;
    }).filter(item => {
        if (item.children) return item.children.length > 0;
        return !item.permission || hasPermission(item.permission);
    });

    return (
        <Sider trigger={null} collapsible collapsed={collapsed} theme="light" style={{ overflow: 'auto', boxShadow: '2px 0 8px 0 rgba(29,35,41,.05)' }}>
            <div className="sidebar-logo-container">
                {collapsed ? 'ERP' : 'Modern ERP'}
            </div>
            <Menu
                theme="light"
                mode="inline"
                selectedKeys={[location.pathname]}
                items={menuItems}
                onClick={handleMenuClick}
            />
        </Sider>
    );
};

export default Sidebar;
