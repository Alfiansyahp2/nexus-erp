import React, { useState, useEffect } from 'react';
import { Typography, Row, Col, message, Badge, Tag } from 'antd';
import { TeamOutlined, ShoppingCartOutlined, SyncOutlined, CheckCircleOutlined } from '@ant-design/icons';
import api from '../../api/axiosConfig';
import DashboardMetricCard from '../../components/common/dashboard/DashboardMetricCard';
import DashboardLineChart from '../../components/common/dashboard/DashboardLineChart';
import DashboardPieChart from '../../components/common/dashboard/DashboardPieChart';
import RecentActivityTable from '../../components/common/dashboard/RecentActivityTable';

const { Title, Text } = Typography;

const SalesDashboard = ({ isNested = false }) => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchStats = async (isBackground = false) => {
        try {
            if (!isBackground) setLoading(true);
            const response = await api.get('sales/dashboard-stats/');
            setStats(response.data);
        } catch (error) {
            if (!isBackground) message.error('Gagal memuat statistik Sales');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
        
        const intervalId = setInterval(() => {
            fetchStats(true);
        }, 30000);
        
        return () => clearInterval(intervalId);
    }, []);

    const metrics = stats?.metrics || {};
    const charts = stats?.charts || {};
    const recentActivity = stats?.recent_activity || [];

    const activityColumns = [
        { title: 'Doc No', dataIndex: 'document_number', key: 'document_number' },
        { title: 'Customer', dataIndex: 'customer', key: 'customer' },
        { title: 'Amount', dataIndex: 'amount', key: 'amount' },
        { 
            title: 'Status', 
            dataIndex: 'status', 
            key: 'status',
            render: (val) => {
                let color = 'default';
                if (val === 'Draft') color = 'default';
                else if (val === 'Sent/Quoted') color = 'processing';
                else if (val === 'Confirmed') color = 'warning';
                else if (val === 'Completed (Shipped)') color = 'success';
                else if (val === 'Cancelled') color = 'error';
                return <Badge status={color} text={val} />;
            }
        },
    ];

    return (
        <div>
            {!isNested && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <Title level={3} style={{ margin: 0 }}>Sales Dashboard</Title>
                    <Text type="secondary"><Badge status="processing" text="Live 30s" /></Text>
                </div>
            )}
            
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={12} md={6}>
                    <DashboardMetricCard 
                        title="Total Pelanggan" 
                        value={metrics.total_customers || 0} 
                        prefix={<TeamOutlined />} 
                        color="#1677ff"
                        loading={loading}
                    />
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <DashboardMetricCard 
                        title="Total Sales Orders" 
                        value={metrics.total_sales_orders || 0} 
                        prefix={<ShoppingCartOutlined />} 
                        color="#faad14"
                        loading={loading}
                    />
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <DashboardMetricCard 
                        title="SO Pending" 
                        value={metrics.pending_so || 0} 
                        prefix={<SyncOutlined spin />} 
                        color="#f5222d"
                        loading={loading}
                    />
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <DashboardMetricCard 
                        title="Pengiriman Selesai" 
                        value={metrics.completed_deliveries || 0} 
                        prefix={<CheckCircleOutlined />} 
                        color="#52c41a"
                        loading={loading}
                    />
                </Col>
            </Row>

            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} lg={16}>
                    <DashboardLineChart 
                        title="Tren Penjualan (7 Hari Terakhir)"
                        data={charts.sales_trends || []}
                        dataKeyX="date"
                        lines={[
                            { key: 'orders', name: 'Sales Orders', color: '#1677ff' }
                        ]}
                        loading={loading}
                        height={320}
                    />
                </Col>
                <Col xs={24} lg={8}>
                    <DashboardPieChart 
                        title="Distribusi Status SO"
                        data={charts.status_distribution || []}
                        loading={loading}
                        height={320}
                    />
                </Col>
            </Row>

            <Row gutter={[16, 16]}>
                <Col xs={24}>
                    <RecentActivityTable 
                        title="Sales Orders Terkini"
                        columns={activityColumns}
                        data={recentActivity}
                        loading={loading}
                    />
                </Col>
            </Row>
        </div>
    );
};

export default SalesDashboard;
