import React from 'react';
import { Layout, Menu } from 'antd';
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

    const menuItems = [
        {
            key: '/dashboard',
            icon: <DashboardOutlined />,
            label: 'Dashboard',
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
                },
                {
                    key: '/hr/departments',
                    icon: <ClusterOutlined />,
                    label: 'Departments',
                },
                {
                    key: '/hr/positions',
                    icon: <IdcardOutlined />,
                    label: 'Positions',
                }
            ]
        },
        {
            key: '/leave-requests',
            icon: <FormOutlined />,
            label: 'Leave Requests',
        },
        {
            key: '/payroll',
            icon: <DollarOutlined />,
            label: 'Payroll',
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
                },
                {
                    key: '/finance/journals',
                    icon: <FormOutlined />,
                    label: 'Journal Entries',
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
                },
                {
                    key: '/inventory/products',
                    icon: <InboxOutlined />,
                    label: 'Products',
                },
                {
                    key: '/inventory/warehouses',
                    icon: <ShopOutlined />,
                    label: 'Warehouses',
                },
                {
                    key: '/inventory/stock-balances',
                    icon: <AppstoreOutlined />,
                    label: 'Stock Balances',
                },
                {
                    key: '/inventory/stock-movements',
                    icon: <SwapOutlined />,
                    label: 'Stock Movements',
                }
            ]
        }
    ];

    return (
        <Sider trigger={null} collapsible collapsed={collapsed} theme="light" style={{ boxShadow: '2px 0 8px 0 rgba(29,35,41,.05)' }}>
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
