import React, { useState, useEffect } from 'react';
import { Typography, Row, Col, message } from 'antd';
import { TeamOutlined, CheckCircleOutlined, FileSyncOutlined } from '@ant-design/icons';
import api from '../../api/axiosConfig';
import DashboardMetricCard from '../../components/common/dashboard/DashboardMetricCard';
import DashboardBarChart from '../../components/common/dashboard/DashboardBarChart';

const { Title } = Typography;

const HRDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get('hr/dashboard-stats/');
                setStats(response.data);
            } catch (error) {
                message.error('Gagal memuat statistik HR');
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const chartData = [
        { name: 'Karyawan', value: stats?.total_employees || 0 },
        { name: 'Hadir Hari Ini', value: stats?.present_today || 0 },
        { name: 'Cuti Menunggu', value: stats?.pending_leaves || 0 },
    ];

    return (
        <div>
            <Title level={3} style={{ marginBottom: 24 }}>Human Resources Dashboard</Title>
            
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
