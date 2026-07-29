import React, { useState, useEffect } from 'react';
import { Typography, Row, Col, message, Badge } from 'antd';
import { BankOutlined, FileDoneOutlined, ContainerOutlined, HddOutlined } from '@ant-design/icons';
import api from '../../api/axiosConfig';
import DashboardMetricCard from '../../components/common/dashboard/DashboardMetricCard';
import DashboardBarChart from '../../components/common/dashboard/DashboardBarChart';

const { Title, Text } = Typography;

const FinanceDashboard = ({ isNested = false }) => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchStats = async (isBackground = false) => {
        try {
            if (!isBackground) setLoading(true);
            const response = await api.get('finance/dashboard-stats/');
            setStats(response.data);
        } catch (error) {
            if (!isBackground) message.error('Gagal memuat statistik Finance');
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

    const chartData = [
        { name: 'Accounts', value: stats?.total_accounts || 0 },
        { name: 'Invoices', value: stats?.total_invoices || 0 },
        { name: 'Assets', value: stats?.total_assets || 0 },
        { name: 'Journals', value: stats?.total_journals || 0 },
    ];

    return (
        <div>
            {!isNested && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <Title level={3} style={{ margin: 0 }}>Finance Dashboard</Title>
                    <Text type="secondary"><Badge status="processing" text="Live 30s" /></Text>
                </div>
            )}
            
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={12} md={6}>
                    <DashboardMetricCard 
                        title="Daftar Akun (COA)" 
                        value={stats?.total_accounts || 0} 
                        prefix={<BankOutlined />} 
                        color="#1677ff"
                        loading={loading}
                    />
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <DashboardMetricCard 
                        title="Total Invoice" 
                        value={stats?.total_invoices || 0} 
                        prefix={<FileDoneOutlined />} 
                        color="#faad14"
                        loading={loading}
                    />
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <DashboardMetricCard 
                        title="Aset Tetap" 
                        value={stats?.total_assets || 0} 
                        prefix={<HddOutlined />} 
                        color="#52c41a"
                        loading={loading}
                    />
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <DashboardMetricCard 
                        title="Jurnal Masuk" 
                        value={stats?.total_journals || 0} 
                        prefix={<ContainerOutlined />} 
                        color="#722ed1"
                        loading={loading}
                    />
                </Col>
            </Row>

            <Row gutter={[16, 16]}>
                <Col xs={24}>
                    <DashboardBarChart 
                        title="Statistik Entitas Keuangan"
                        data={chartData}
                        dataKeyX="name"
                        dataBars={[{ key: 'value', name: 'Total Count', color: '#faad14' }]}
                        loading={loading}
                        height={350}
                    />
                </Col>
            </Row>
        </div>
    );
};

export default FinanceDashboard;
