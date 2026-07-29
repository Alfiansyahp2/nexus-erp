import React, { useState, useEffect } from 'react';
import { Typography, Row, Col, message, Badge } from 'antd';
import { TeamOutlined, CheckCircleOutlined, FileSyncOutlined } from '@ant-design/icons';
import api from '../../api/axiosConfig';
import DashboardMetricCard from '../../components/common/dashboard/DashboardMetricCard';
import DashboardLineChart from '../../components/common/dashboard/DashboardLineChart';
import DashboardPieChart from '../../components/common/dashboard/DashboardPieChart';
import RecentActivityTable from '../../components/common/dashboard/RecentActivityTable';

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

    const metrics = stats?.metrics || {};
    const charts = stats?.charts || {};
    const recentActivity = stats?.recent_activity || [];

    const leaveColumns = [
        { title: 'Employee', dataIndex: 'employee_name', key: 'employee_name' },
        { title: 'Type', dataIndex: 'leave_type', key: 'leave_type' },
        { title: 'Duration', dataIndex: 'duration', key: 'duration' },
        { 
            title: 'Status', 
            dataIndex: 'status', 
            key: 'status',
            render: (val) => {
                let color = 'default';
                if (val.includes('PENDING')) color = 'gold';
                else if (val === 'APPROVED') color = 'green';
                else if (val === 'REJECTED') color = 'red';
                return <Badge status={color === 'gold' ? 'warning' : (color === 'green' ? 'success' : 'error')} text={val} />;
            }
        },
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
                <Col xs={24} sm={12} md={6}>
                    <DashboardMetricCard 
                        title="Total Karyawan" 
                        value={metrics.total_employees || 0} 
                        prefix={<TeamOutlined />} 
                        color="#1677ff"
                        loading={loading}
                    />
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <DashboardMetricCard 
                        title="Hadir Hari Ini" 
                        value={metrics.present_today || 0} 
                        prefix={<CheckCircleOutlined />} 
                        color="#52c41a"
                        loading={loading}
                    />
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <DashboardMetricCard 
                        title="Terlambat Hari Ini" 
                        value={metrics.late_today || 0} 
                        prefix={<FileSyncOutlined />} 
                        color="#faad14"
                        loading={loading}
                    />
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <DashboardMetricCard 
                        title="Cuti Menunggu Persetujuan" 
                        value={metrics.pending_leaves || 0} 
                        prefix={<FileSyncOutlined />} 
                        color="#fa8c16"
                        loading={loading}
                    />
                </Col>
            </Row>

            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} lg={16}>
                    <DashboardLineChart 
                        title="Tren Kehadiran (7 Hari Terakhir)"
                        data={charts.attendance_trends || []}
                        dataKeyX="date"
                        lines={[
                            { key: 'present', name: 'Hadir', color: '#52c41a' },
                            { key: 'late', name: 'Terlambat', color: '#faad14' }
                        ]}
                        loading={loading}
                        height={320}
                    />
                </Col>
                <Col xs={24} lg={8}>
                    <DashboardPieChart 
                        title="Status Kepegawaian"
                        data={charts.employment_status_distribution || []}
                        loading={loading}
                        height={320}
                    />
                </Col>
            </Row>

            <Row gutter={[16, 16]}>
                <Col xs={24}>
                    <RecentActivityTable 
                        title="Pengajuan Cuti Terkini"
                        columns={leaveColumns}
                        data={recentActivity}
                        loading={loading}
                    />
                </Col>
            </Row>
        </div>
    );
};

export default HRDashboard;
