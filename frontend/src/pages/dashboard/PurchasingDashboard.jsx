import React, { useState, useEffect } from 'react';
import { Typography, Row, Col, message, Badge } from 'antd';
import { ShopOutlined, ShoppingOutlined, SyncOutlined, FileTextOutlined } from '@ant-design/icons';
import api from '../../api/axiosConfig';
import DashboardMetricCard from '../../components/common/dashboard/DashboardMetricCard';
import DashboardLineChart from '../../components/common/dashboard/DashboardLineChart';
import DashboardPieChart from '../../components/common/dashboard/DashboardPieChart';
import RecentActivityTable from '../../components/common/dashboard/RecentActivityTable';

const { Title, Text } = Typography;

const PurchasingDashboard = ({ isNested = false }) => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchStats = async (isBackground = false) => {
        try {
            if (!isBackground) setLoading(true);
            const response = await api.get('purchasing/dashboard-stats/');
            setStats(response.data);
        } catch (error) {
            if (!isBackground) message.error('Gagal memuat statistik Purchasing');
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
        { title: 'Vendor', dataIndex: 'vendor', key: 'vendor' },
        { title: 'Amount', dataIndex: 'amount', key: 'amount' },
        { 
            title: 'Status', 
            dataIndex: 'status', 
            key: 'status',
            render: (val) => {
                let color = 'default';
                if (val === 'Draft') color = 'default';
                else if (val === 'Sent to Vendor') color = 'processing';
                else if (val === 'Confirmed') color = 'warning';
                else if (val === 'Completed (Received)') color = 'success';
                else if (val === 'Cancelled') color = 'error';
                return <Badge status={color} text={val} />;
            }
        },
    ];

    return (
        <div>
            {!isNested && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <Title level={3} style={{ margin: 0 }}>Purchasing Dashboard</Title>
                    <Text type="secondary"><Badge status="processing" text="Live 30s" /></Text>
                </div>
            )}
            
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={12} md={6}>
                    <DashboardMetricCard 
                        title="Total Vendor" 
                        value={metrics.total_vendors || 0} 
                        prefix={<ShopOutlined />} 
                        color="#1677ff"
                        loading={loading}
                    />
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <DashboardMetricCard 
                        title="Total Purchase Orders" 
                        value={metrics.total_purchase_orders || 0} 
                        prefix={<ShoppingOutlined />} 
                        color="#722ed1"
                        loading={loading}
                    />
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <DashboardMetricCard 
                        title="PO Pending" 
                        value={metrics.pending_po || 0} 
                        prefix={<SyncOutlined spin />} 
                        color="#faad14"
                        loading={loading}
                    />
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <DashboardMetricCard 
                        title="PR Aktif" 
                        value={metrics.active_pr || 0} 
                        prefix={<FileTextOutlined />} 
                        color="#13c2c2"
                        loading={loading}
                    />
                </Col>
            </Row>

            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} lg={16}>
                    <DashboardLineChart 
                        title="Tren Pembelian (7 Hari Terakhir)"
                        data={charts.purchase_trends || []}
                        dataKeyX="date"
                        lines={[
                            { key: 'orders', name: 'Purchase Orders', color: '#722ed1' }
                        ]}
                        loading={loading}
                        height={320}
                    />
                </Col>
                <Col xs={24} lg={8}>
                    <DashboardPieChart 
                        title="Distribusi Status PO"
                        data={charts.status_distribution || []}
                        loading={loading}
                        height={320}
                    />
                </Col>
            </Row>

            <Row gutter={[16, 16]}>
                <Col xs={24}>
                    <RecentActivityTable 
                        title="Purchase Orders Terkini"
                        columns={activityColumns}
                        data={recentActivity}
                        loading={loading}
                    />
                </Col>
            </Row>
        </div>
    );
};

export default PurchasingDashboard;
