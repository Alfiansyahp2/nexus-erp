import React, { useState, useEffect } from 'react';
import { Typography, Row, Col, message, Badge } from 'antd';
import { BankOutlined, FileDoneOutlined, ContainerOutlined, HddOutlined } from '@ant-design/icons';
import api from '../../api/axiosConfig';
import DashboardMetricCard from '../../components/common/dashboard/DashboardMetricCard';
import DashboardLineChart from '../../components/common/dashboard/DashboardLineChart';
import DashboardPieChart from '../../components/common/dashboard/DashboardPieChart';
import RecentActivityTable from '../../components/common/dashboard/RecentActivityTable';

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

    const metrics = stats?.metrics || {};
    const charts = stats?.charts || {};
    const recentActivity = stats?.recent_activity || [];

    const invoiceColumns = [
        { title: 'Doc No', dataIndex: 'document_number', key: 'document_number' },
        { title: 'Partner', dataIndex: 'partner', key: 'partner' },
        { title: 'Type', dataIndex: 'type', key: 'type' },
        { title: 'Amount', dataIndex: 'amount', key: 'amount' },
        { 
            title: 'Status', 
            dataIndex: 'status', 
            key: 'status',
            render: (val) => {
                let color = 'default';
                if (val === 'DRAFT') color = 'default';
                else if (val === 'OPEN') color = 'processing';
                else if (val === 'PAID') color = 'success';
                else if (val === 'CANCELLED') color = 'error';
                return <Badge status={color} text={val} />;
            }
        },
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
                        title="Total Akun (COA)" 
                        value={metrics.total_accounts || 0} 
                        prefix={<BankOutlined />} 
                        color="#1677ff"
                        loading={loading}
                    />
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <DashboardMetricCard 
                        title="Invoice Tertunggak" 
                        value={metrics.unpaid_invoices || 0} 
                        prefix={<FileDoneOutlined />} 
                        color="#f5222d"
                        loading={loading}
                    />
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <DashboardMetricCard 
                        title="Total Jurnal" 
                        value={metrics.total_journals || 0} 
                        prefix={<ContainerOutlined />} 
                        color="#faad14"
                        loading={loading}
                    />
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <DashboardMetricCard 
                        title="Total Aset Tetap" 
                        value={metrics.total_assets || 0} 
                        prefix={<HddOutlined />} 
                        color="#13c2c2"
                        loading={loading}
                    />
                </Col>
            </Row>

            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} lg={16}>
                    <DashboardLineChart 
                        title="Tren Invoice (7 Hari Terakhir)"
                        data={charts.invoice_trends || []}
                        dataKeyX="date"
                        lines={[
                            { key: 'customer_invoices', name: 'Penjualan (AR)', color: '#52c41a' },
                            { key: 'vendor_bills', name: 'Pembelian (AP)', color: '#f5222d' }
                        ]}
                        loading={loading}
                        height={320}
                    />
                </Col>
                <Col xs={24} lg={8}>
                    <DashboardPieChart 
                        title="Distribusi Tipe Akun"
                        data={charts.account_distribution || []}
                        loading={loading}
                        height={320}
                    />
                </Col>
            </Row>

            <Row gutter={[16, 16]}>
                <Col xs={24}>
                    <RecentActivityTable 
                        title="Daftar Tagihan & Pembayaran Tertunda"
                        columns={invoiceColumns}
                        data={recentActivity}
                        loading={loading}
                    />
                </Col>
            </Row>
        </div>
    );
};

export default FinanceDashboard;
