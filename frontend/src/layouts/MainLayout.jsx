import React, { useState } from 'react';
import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import AppHeader from './AppHeader';

const { Content } = Layout;

const MainLayout = () => {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <Layout style={{ height: '100vh', overflow: 'hidden' }}>
            <Sidebar collapsed={collapsed} />
            <Layout style={{ display: 'flex', flexDirection: 'column' }}>
                <AppHeader collapsed={collapsed} setCollapsed={setCollapsed} />
                <Content
                    style={{ overflowY: 'auto', padding: '24px 16px', flex: 1 }}
                >
                    <div className="page-container" style={{ minHeight: '100%' }}>
                        <Outlet />
                    </div>
                </Content>
            </Layout>
        </Layout>
    );
};

export default MainLayout;
