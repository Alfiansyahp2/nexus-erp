import React, { useState } from 'react';
import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import AppHeader from './AppHeader';
import AppFooter from './AppFooter';

const { Content } = Layout;

const MainLayout = () => {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <Layout style={{ height: '100vh', overflow: 'hidden' }}>
            <Sidebar collapsed={collapsed} />
            <Layout style={{ display: 'flex', flexDirection: 'column' }}>
                <AppHeader collapsed={collapsed} setCollapsed={setCollapsed} />
                <Content
                    style={{ 
                        overflowY: 'auto', 
                        padding: '24px 16px 0 16px', 
                        flex: 1, 
                        display: 'flex', 
                        flexDirection: 'column',
                        justifyContent: 'space-between'
                    }}
                >
                    <div className="page-container" style={{ flex: '1 0 auto' }}>
                        <Outlet />
                    </div>
                    <AppFooter />
                </Content>
            </Layout>
        </Layout>
    );
};

export default MainLayout;
