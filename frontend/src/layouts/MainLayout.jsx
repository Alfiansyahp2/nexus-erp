import React, { useState } from 'react';
import { Layout, Grid } from 'antd';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import AppHeader from './AppHeader';
import AppFooter from './AppFooter';

const { Content } = Layout;
const { useBreakpoint } = Grid;

const MainLayout = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [drawerOpen, setDrawerOpen] = useState(false);
    
    const screens = useBreakpoint();
    // Consider it mobile if screen is smaller than 'md' (768px)
    const isMobile = screens.md === false; 

    return (
        <Layout style={{ height: '100vh', overflow: 'hidden' }}>
            <Sidebar 
                collapsed={collapsed} 
                isMobile={isMobile} 
                drawerOpen={drawerOpen} 
                setDrawerOpen={setDrawerOpen} 
            />
            <Layout style={{ display: 'flex', flexDirection: 'column' }}>
                <AppHeader 
                    collapsed={collapsed} 
                    setCollapsed={setCollapsed}
                    isMobile={isMobile}
                    drawerOpen={drawerOpen}
                    setDrawerOpen={setDrawerOpen}
                />
                <Content className="main-content-wrapper">
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
