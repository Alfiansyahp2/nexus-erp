import React from 'react';
import { Layout, Menu, Drawer } from 'antd';
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
    ShopOutlined,
    SafetyCertificateOutlined,
    FileTextOutlined,
    WalletOutlined,
    ToolOutlined,
    AuditOutlined,
    ShoppingCartOutlined,
    ContactsOutlined,
    FileDoneOutlined,
    SendOutlined,
    ShoppingOutlined,
    CarOutlined,
    ClockCircleOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';

const { Sider } = Layout;

const Sidebar = ({ collapsed, isMobile, drawerOpen, setDrawerOpen }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const handleMenuClick = ({ key }) => {
        navigate(key);
        if (isMobile && setDrawerOpen) {
            setDrawerOpen(false); // Close drawer after navigation on mobile
        }
    };

    const rawMenuItems = [
        // ... (keep all rawMenuItems as they are) ...
        {
            key: '/dashboard',
            icon: <DashboardOutlined />,
            label: 'Dashboard',
            permission: 'dashboard.view'
        },
        {
            key: 'human_resources',
            icon: <TeamOutlined />,
            label: 'Human Resources',
            children: [
                {
                    key: 'hr_master',
                    icon: <UserOutlined />,
                    label: 'Employee Master',
                    children: [
                        { key: '/hr/employees', label: 'Employees', permission: 'hr.employee.view' },
                        { key: '/hr/departments', label: 'Departments', permission: 'hr.department.view' },
                        { key: '/hr/positions', label: 'Positions', permission: 'hr.position.view' }
                    ]
                },
                { key: '/hr/attendance', icon: <ClockCircleOutlined />, label: 'Attendance', permission: 'hr.attendance.view' },
                { key: '/leave-requests', icon: <FormOutlined />, label: 'Leave Requests', permission: 'hr.leave.view' },
                { key: '/payroll', icon: <DollarOutlined />, label: 'Payroll', permission: 'hr.payroll.view' }
            ]
        },
        {
            key: 'finance',
            icon: <BankOutlined />,
            label: 'Finance',
            children: [
                { key: '/finance/accounts', icon: <AccountBookOutlined />, label: 'Chart of Accounts', permission: 'finance.account.view' },
                { key: '/finance/journals', icon: <FormOutlined />, label: 'Journal Entries', permission: 'finance.journal.view' },
                { key: '/finance/invoices', icon: <FileTextOutlined />, label: 'Invoices', permission: 'finance.invoice.view' },
                { key: '/finance/payments', icon: <WalletOutlined />, label: 'Payments', permission: 'finance.payment.view' },
                { key: '/finance/fixed-assets', icon: <ToolOutlined />, label: 'Fixed Assets', permission: 'finance.asset.view' },
                { key: '/finance/bank-reconciliation', icon: <AuditOutlined />, label: 'Bank Reconciliation', permission: 'finance.bank.view' }
            ]
        },
        {
            key: 'inventory',
            icon: <AppstoreOutlined />,
            label: 'Inventory',
            children: [
                { key: '/inventory/categories', icon: <AppstoreOutlined />, label: 'Product Categories', permission: 'inventory.category.view' },
                { key: '/inventory/products', icon: <InboxOutlined />, label: 'Products', permission: 'inventory.product.view' },
                { key: '/inventory/warehouses', icon: <ShopOutlined />, label: 'Warehouses', permission: 'inventory.warehouse.view' },
                { key: '/inventory/stock-balances', icon: <AppstoreOutlined />, label: 'Stock Balances', permission: 'inventory.stock.view' },
                { key: '/inventory/stock-movements', icon: <SwapOutlined />, label: 'Stock Movements', permission: 'inventory.movement.view' }
            ]
        },
        {
            key: 'purchasing',
            icon: <ShoppingCartOutlined />,
            label: 'Purchasing',
            children: [
                { key: '/purchasing/vendors', icon: <ContactsOutlined />, label: 'Vendors / Suppliers', permission: 'purchasing.vendor.view' },
                { key: '/purchasing/requests', icon: <FileDoneOutlined />, label: 'Purchase Requests', permission: 'purchasing.pr.view' },
                { key: '/purchasing/orders', icon: <SendOutlined />, label: 'Purchase Orders', permission: 'purchasing.po.view' },
                { key: '/purchasing/receipts', icon: <InboxOutlined />, label: 'Goods Receipts', permission: 'purchasing.gr.view' }
            ]
        },
        {
            key: 'sales',
            icon: <ShoppingOutlined />,
            label: 'Sales',
            children: [
                { key: '/sales/customers', icon: <ContactsOutlined />, label: 'Customers', permission: 'sales.customer.view' },
                { key: '/sales/orders', icon: <ShoppingCartOutlined />, label: 'Sales Orders', permission: 'sales.order.view' },
                { key: '/sales/deliveries', icon: <CarOutlined />, label: 'Delivery Orders', permission: 'sales.delivery.view' }
            ]
        }
    ];

    const filterMenuByPermission = (items) => {
        return items.map(item => {
            if (item.children) {
                const filteredChildren = filterMenuByPermission(item.children);
                return { ...item, children: filteredChildren };
            }
            return item;
        }).filter(item => {
            if (item.children) return item.children.length > 0;
            return !item.permission || hasPermission(item.permission);
        });
    };

    const menuItems = filterMenuByPermission(rawMenuItems);

    const sidebarContent = (
        <>
            <div className="sidebar-logo-container">
                {collapsed && !isMobile ? 'ERP' : 'Modern ERP'}
            </div>
            <Menu
                theme="light"
                mode="inline"
                selectedKeys={[location.pathname]}
                items={menuItems}
                onClick={handleMenuClick}
            />
        </>
    );

    if (isMobile) {
        return (
            <Drawer
                placement="left"
                onClose={() => setDrawerOpen(false)}
                open={drawerOpen}
                className="sidebar-drawer"
                styles={{ wrapper: { width: '240px' }, body: { padding: 0 } }}
                closable={false}
            >
                {sidebarContent}
            </Drawer>
        );
    }

    return (
        <Sider trigger={null} collapsible collapsed={collapsed} theme="light" style={{ overflow: 'auto', boxShadow: '2px 0 8px 0 rgba(29,35,41,.05)' }}>
            {sidebarContent}
        </Sider>
    );
};

export default Sidebar;
