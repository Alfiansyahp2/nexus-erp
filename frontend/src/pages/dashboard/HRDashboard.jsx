import React, { useState, useEffect } from 'react';
import { Typography, Row, Col, message, Badge } from 'antd';
import { TeamOutlined, CheckCircleOutlined, FileSyncOutlined } from '@ant-design/icons';
import api from '../../api/axiosConfig';
import DashboardMetricCard from '../../components/common/dashboard/DashboardMetricCard';
import DashboardBarChart from '../../components/common/dashboard/DashboardBarChart';

const { Title, Text } = Typography;

const HRDashboard = ({ isNested = false }) => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchStats = async (isBackground = false) => {
        try {
            if (!isBackground) setLoading(true);
            const response = await api.get('hr/dashboard-stats/');
            setStats(response.data);
        } catch (error) {
            if (!isBackground) message.error('Gagal memuat statistik HR');
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
        { name: 'Karyawan', value: stats?.total_employees || 0 },
        { name: 'Hadir Hari Ini', value: stats?.present_today || 0 },
        { name: 'Cuti Menunggu', value: stats?.pending_leaves || 0 },
    ];

    return (
        <div>
            {!isNested && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <Title level={3} style={{ margin: 0 }}>Human Resources Dashboard</Title>
                    <Text type="secondary"><Badge status="processing" text="Live 30s" /></Text>
                </div>
            )}
            
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={12} md={8}>
                    <DashboardMetricCard 
                        title="Total Karyawan" 
                        value={stats?.total_employees || 0} 
                        prefix={<TeamOutlined />} 
                        color="#1677ff"
                        loading={loading}
                    />
                </Col>
                <Col xs={24} sm={12} md={8}>
                    <DashboardMetricCard 
                        title="Hadir Hari Ini" 
                        value={stats?.present_today || 0} 
                        prefix={<CheckCircleOutlined />} 
                        color="#52c41a"
                        loading={loading}
                    />
                </Col>
                <Col xs={24} sm={12} md={8}>
                    <DashboardMetricCard 
                        title="Cuti Pending" 
                        value={stats?.pending_leaves || 0} 
                        prefix={<FileSyncOutlined />} 
                        color="#faad14"
                        loading={loading}
                    />
                </Col>
            </Row>

            <Row gutter={[16, 16]}>
                <Col xs={24}>
                    <DashboardBarChart 
                        title="Statistik Kehadiran & Cuti"
                        data={chartData}
                        dataKeyX="name"
                        dataBars={[{ key: 'value', name: 'Total Count', color: '#52c41a' }]}
                        loading={loading}
                        height={350}
                    />
                </Col>
            </Row>
        </div>
    );
};

export default HRDashboard;
