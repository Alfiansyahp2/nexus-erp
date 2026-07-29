import React from 'react';
import { Layout, Button, Dropdown, Avatar, message, Tooltip } from 'antd';
import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    UserOutlined,
    LogoutOutlined,
    SafetyCertificateOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import Can from '../components/common/Can';

const { Header } = Layout;

const AppHeader = ({ collapsed, setCollapsed }) => {
    const navigate = useNavigate();

    const handleMenuClick = ({ key }) => {
        if (key === 'logout') {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            navigate('/login');
        } else {
            navigate(key);
        }
    };

    const userMenu = {
        items: [
            {
                key: 'profile',
                label: 'Profile',
                icon: <UserOutlined />
            },
            {
                key: 'logout',
                label: 'Logout',
                icon: <LogoutOutlined />,
                danger: true
            }
        ],
        onClick: handleMenuClick
    };

    return (
        <Header className="layout-header">
            <Button
                type="text"
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => setCollapsed(!collapsed)}
                style={{
                    fontSize: '16px',
                    width: 64,
                    height: 64,
                }}
            />
            <div style={{ marginRight: 24, display: 'flex', alignItems: 'center', gap: '16px' }}>
                <Can access="settings.manage_users">
                    <Tooltip title="Manajemen Pengguna & RBAC">
                        <Button
                            type="text"
                            shape="circle"
                            icon={<SafetyCertificateOutlined style={{ fontSize: '18px', color: '#1890ff' }} />}
                            onClick={() => navigate('/settings/users')}
                            className="hover-scale"
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        />
                    </Tooltip>
                </Can>
                <Dropdown menu={userMenu} placement="bottomRight">
                    <span style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Avatar icon={<UserOutlined />} />
                        <span>Admin</span>
                    </span>
                </Dropdown>
            </div>
        </Header>
    );
};

export default AppHeader;
