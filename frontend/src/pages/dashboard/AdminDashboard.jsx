import React, { useState, useEffect } from 'react';
import { Typography, Row, Col, message, Tabs, Badge, Tag, Empty } from 'antd';
import { UserOutlined, ShoppingOutlined, ShoppingCartOutlined, AppstoreOutlined, GlobalOutlined, TeamOutlined, BankOutlined, InboxOutlined, TagOutlined, TruckOutlined } from '@ant-design/icons';
import api from '../../api/axiosConfig';
import DashboardMetricCard from '../../components/common/dashboard/DashboardMetricCard';
import DashboardLineChart from '../../components/common/dashboard/DashboardLineChart';
import DashboardPieChart from '../../components/common/dashboard/DashboardPieChart';
import RecentActivityTable from '../../components/common/dashboard/RecentActivityTable';
import { hasPermission } from '../../utils/rbac';

import HRDashboard from './HRDashboard';
import FinanceDashboard from './FinanceDashboard';
import InventoryDashboard from './InventoryDashboard';
import SalesDashboard from './SalesDashboard';
import PurchasingDashboard from './PurchasingDashboard';

const { Title, Text } = Typography;

const GlobalStats = ({ stats, loading }) => {
    const metrics = stats?.metrics || {};
    const charts = stats?.charts || {};
    const recentActivity = stats?.recent_activity || [];

    const activityColumns = [
        { title: 'Doc No', dataIndex: 'document_number', key: 'document_number' },
        { title: 'Customer', dataIndex: 'customer', key: 'customer' },
        { title: 'Status', dataIndex: 'status', key: 'status', render: (val) => <Tag color={val === 'PAID' ? 'green' : 'blue'}>{val}</Tag> },
        { title: 'Date', dataIndex: 'date', key: 'date' },
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <Title level={4} style={{ margin: 0 }}>Ringkasan Global</Title>
                <Text type="secondary"><Badge status="processing" text="Live 30s" /></Text>
            </div>
            
            {/* Top Row: Key Metrics */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={12} md={6}>
                    <DashboardMetricCard 
                        title="Total Karyawan" 
                        value={metrics.total_employees || 0} 
                        prefix={<UserOutlined />} 
                        color="#1677ff"
                        loading={loading}
                    />
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <DashboardMetricCard 
                        title="Total Produk" 
                        value={metrics.total_products || 0} 
                        prefix={<AppstoreOutlined />} 
                        color="#52c41a"
                        loading={loading}
                    />
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <DashboardMetricCard 
                        title="Sales Orders" 
                        value={metrics.sales_orders?.value || 0} 
                        trend={metrics.sales_orders?.trend}
                        trendLabel="vs 30 hari lalu"
                        prefix={<ShoppingOutlined />} 
                        color="#722ed1"
                        loading={loading}
                    />
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <DashboardMetricCard 
                        title="Purchase Orders" 
                        value={metrics.purchase_orders?.value || 0} 
                        trend={metrics.purchase_orders?.trend}
                        trendLabel="vs 30 hari lalu"
                        prefix={<ShoppingCartOutlined />} 
                        color="#fa8c16"
                        loading={loading}
                    />
                </Col>
            </Row>

            {/* Middle Row: Charts */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} lg={16}>
                    <DashboardLineChart 
                        title="Tren Penjualan & Pembelian (7 Hari Terakhir)"
                        data={charts.order_trends || []}
                        dataKeyX="date"
                        lines={[
                            { key: 'sales', name: 'Sales Orders', color: '#722ed1' },
                            { key: 'purchases', name: 'Purchase Orders', color: '#fa8c16' }
                        ]}
                        loading={loading}
                        height={320}
                    />
                </Col>
                <Col xs={24} lg={8}>
                    <DashboardPieChart 
                        title="Distribusi Departemen"
                        data={charts.department_distribution || []}
                        loading={loading}
                        height={320}
                    />
                </Col>
            </Row>

            {/* Bottom Row: Tables */}
            <Row gutter={[16, 16]}>
                <Col xs={24}>
                    <RecentActivityTable 
                        title="Aktivitas Penjualan Terkini"
                        columns={activityColumns}
                        data={recentActivity}
                        loading={loading}
                    />
                </Col>
            </Row>
        </div>
    );
};

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchStats = async (isBackground = false) => {
        try {
            if (!isBackground) setLoading(true);
            const response = await api.get('dashboard-stats/');
            setStats(response.data);
        } catch (error) {
            if (!isBackground) message.error('Gagal memuat statistik global');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Only fetch global stats if the user has permission for the global dashboard
        if (hasPermission('view_global_dashboard')) {
            fetchStats();
            const intervalId = setInterval(() => {
                fetchStats(true);
            }, 30000);
            return () => clearInterval(intervalId);
        } else {
            setLoading(false);
        }
    }, []);

    const chartData = [
        { name: 'Employees', value: stats?.total_employees || 0 },
        { name: 'Products', value: stats?.total_products || 0 },
        { name: 'Invoices', value: stats?.total_invoices || 0 },
        { name: 'Sales Orders', value: stats?.total_sales_orders || 0 },
        { name: 'Purchase Orders', value: stats?.total_purchase_orders || 0 },
    ];

    const tabItems = [];

    if (hasPermission('view_global_dashboard')) {
        tabItems.push({
            key: '1',
            label: <span><GlobalOutlined /> Global</span>,
            children: <GlobalStats stats={stats} loading={loading} chartData={chartData} />,
        });
    }

    if (hasPermission('view_hr_dashboard')) {
        tabItems.push({
            key: '2',
            label: <span><TeamOutlined /> HR</span>,
            children: <HRDashboard isNested={true} />,
        });
    }

    if (hasPermission('view_finance_dashboard')) {
        tabItems.push({
            key: '3',
            label: <span><BankOutlined /> Finance</span>,
            children: <FinanceDashboard isNested={true} />,
        });
    }

    if (hasPermission('view_inventory_dashboard')) {
        tabItems.push({
            key: '4',
            label: <span><InboxOutlined /> Inventory</span>,
            children: <InventoryDashboard isNested={true} />,
        });
    }

    if (hasPermission('view_sales_dashboard')) {
        tabItems.push({
            key: '5',
            label: <span><TagOutlined /> Sales</span>,
            children: <SalesDashboard isNested={true} />,
        });
    }

    if (hasPermission('view_purchasing_dashboard')) {
        tabItems.push({
            key: '6',
            label: <span><TruckOutlined /> Purchasing</span>,
            children: <PurchasingDashboard isNested={true} />,
        });
    }

    return (
        <div>
            <Title level={3} style={{ marginBottom: 16 }}>Pusat Komando (Command Center)</Title>
            {tabItems.length > 0 ? (
                <Tabs defaultActiveKey={tabItems[0].key} items={tabItems} size="large" />
            ) : (
                <Empty description="Anda tidak memiliki izin untuk melihat dasbor apa pun." />
            )}
        </div>
    );
};

export default AdminDashboard;
