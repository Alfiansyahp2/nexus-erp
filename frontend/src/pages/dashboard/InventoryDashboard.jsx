import React, { useState, useEffect } from 'react';
import { Typography, Row, Col, message, Badge, Tag } from 'antd';
import { AppstoreOutlined, BankOutlined, InboxOutlined, SwapOutlined } from '@ant-design/icons';
import api from '../../api/axiosConfig';
import DashboardMetricCard from '../../components/common/dashboard/DashboardMetricCard';
import DashboardLineChart from '../../components/common/dashboard/DashboardLineChart';
import DashboardPieChart from '../../components/common/dashboard/DashboardPieChart';
import RecentActivityTable from '../../components/common/dashboard/RecentActivityTable';

const { Title, Text } = Typography;

const InventoryDashboard = ({ isNested = false }) => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchStats = async (isBackground = false) => {
        try {
            if (!isBackground) setLoading(true);
            const response = await api.get('inventory/dashboard-stats/');
            setStats(response.data);
        } catch (error) {
            if (!isBackground) message.error('Gagal memuat statistik Inventory');
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
        { title: 'Ref No', dataIndex: 'reference_number', key: 'reference_number' },
        { title: 'Product', dataIndex: 'product', key: 'product' },
        { title: 'Warehouse', dataIndex: 'warehouse', key: 'warehouse' },
        { title: 'Qty', dataIndex: 'quantity', key: 'quantity' },
        { 
            title: 'Type', 
            dataIndex: 'type', 
            key: 'type',
            render: (val) => {
                let color = 'default';
                if (val.includes('In')) color = 'green';
                else if (val.includes('Out')) color = 'red';
                else if (val.includes('Transfer')) color = 'blue';
                return <Tag color={color}>{val}</Tag>;
            }
        },
    ];

    return (
        <div>
            {!isNested && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <Title level={3} style={{ margin: 0 }}>Inventory Dashboard</Title>
                    <Text type="secondary"><Badge status="processing" text="Live 30s" /></Text>
                </div>
            )}
            
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={12} md={6}>
                    <DashboardMetricCard 
                        title="Total Produk" 
                        value={metrics.total_products || 0} 
                        prefix={<AppstoreOutlined />} 
                        color="#1677ff"
                        loading={loading}
                    />
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <DashboardMetricCard 
                        title="Total Gudang" 
                        value={metrics.total_warehouses || 0} 
                        prefix={<BankOutlined />} 
                        color="#52c41a"
                        loading={loading}
                    />
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <DashboardMetricCard 
                        title="Lot Aktif" 
                        value={metrics.active_lots || 0} 
                        prefix={<InboxOutlined />} 
                        color="#722ed1"
                        loading={loading}
                    />
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <DashboardMetricCard 
                        title="Total Pergerakan Stok" 
                        value={metrics.total_movements || 0} 
                        prefix={<SwapOutlined />} 
                        color="#fa8c16"
                        loading={loading}
                    />
                </Col>
            </Row>

            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} lg={16}>
                    <DashboardLineChart 
                        title="Pergerakan Stok (7 Hari Terakhir)"
                        data={charts.movement_trends || []}
                        dataKeyX="date"
                        lines={[
                            { key: 'in', name: 'Barang Masuk', color: '#52c41a' },
                            { key: 'out', name: 'Barang Keluar', color: '#f5222d' }
                        ]}
                        loading={loading}
                        height={320}
                    />
                </Col>
                <Col xs={24} lg={8}>
                    <DashboardPieChart 
                        title="Distribusi Kategori Produk"
                        data={charts.category_distribution || []}
                        loading={loading}
                        height={320}
                    />
                </Col>
            </Row>

            <Row gutter={[16, 16]}>
                <Col xs={24}>
                    <RecentActivityTable 
                        title="Aktivitas Pergerakan Stok Terkini"
                        columns={activityColumns}
                        data={recentActivity}
                        loading={loading}
                    />
                </Col>
            </Row>
        </div>
    );
};

export default InventoryDashboard;
