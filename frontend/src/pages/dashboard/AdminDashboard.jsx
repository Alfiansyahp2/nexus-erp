import React, { useState, useEffect } from 'react';
import { Typography, Row, Col, message } from 'antd';
import { UserOutlined, ShoppingOutlined, FileTextOutlined, ShoppingCartOutlined, AppstoreOutlined } from '@ant-design/icons';
import api from '../../api/axiosConfig';
import DashboardMetricCard from '../../components/common/dashboard/DashboardMetricCard';
import DashboardBarChart from '../../components/common/dashboard/DashboardBarChart';

const { Title } = Typography;

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get('dashboard-stats/');
                setStats(response.data);
            } catch (error) {
                message.error('Gagal memuat statistik global');
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const chartData = [
        { name: 'Employees', value: stats?.total_employees || 0 },
        { name: 'Products', value: stats?.total_products || 0 },
        { name: 'Invoices', value: stats?.total_invoices || 0 },
        { name: 'Sales Orders', value: stats?.total_sales_orders || 0 },
        { name: 'Purchase Orders', value: stats?.total_purchase_orders || 0 },
    ];

    return (
        <div>
            <Title level={3} style={{ marginBottom: 24 }}>Admin Global Dashboard</Title>
            
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={12} md={8} lg={6}>
                    <DashboardMetricCard 
                        title="Total Karyawan" 
                        value={stats?.total_employees || 0} 
                        prefix={<UserOutlined />} 
                        color="#1677ff"
                        loading={loading}
                    />
                </Col>
                <Col xs={24} sm={12} md={8} lg={6}>
                    <DashboardMetricCard 
                        title="Total Produk" 
                        value={stats?.total_products || 0} 
                        prefix={<AppstoreOutlined />} 
                        color="#52c41a"
                        loading={loading}
                    />
                </Col>
                <Col xs={24} sm={12} md={8} lg={6}>
                    <DashboardMetricCard 
                        title="Sales Orders" 
                        value={stats?.total_sales_orders || 0} 
                        prefix={<ShoppingOutlined />} 
                        color="#722ed1"
                        loading={loading}
                    />
                </Col>
                <Col xs={24} sm={12} md={8} lg={6}>
                    <DashboardMetricCard 
                        title="Purchase Orders" 
                        value={stats?.total_purchase_orders || 0} 
                        prefix={<ShoppingCartOutlined />} 
                        color="#fa8c16"
                        loading={loading}
                    />
                </Col>
            </Row>

            <Row gutter={[16, 16]}>
                <Col xs={24}>
                    <DashboardBarChart 
                        title="Distribusi Entitas Global"
                        data={chartData}
                        dataKeyX="name"
                        dataBars={[{ key: 'value', name: 'Total Count', color: '#1677ff' }]}
                        loading={loading}
                        height={350}
                    />
                </Col>
            </Row>
        </div>
    );
};

export default AdminDashboard;
