import React, { useState, useEffect } from 'react';
import { Card, Button, Typography, Row, Col, Statistic, message, Table, Tag } from 'antd';
import { CheckCircleOutlined, ClockCircleOutlined, FormOutlined } from '@ant-design/icons';
import api from '../api/axiosConfig';

const { Title, Text } = Typography;

const Dashboard = () => {
    const [loading, setLoading] = useState(false);
    const [isCheckedIn, setIsCheckedIn] = useState(false);
    const [recentAttendances, setRecentAttendances] = useState([]);
    
    // In a real app, this should fetch today's attendance status from the backend
    const fetchStatus = async () => {
        // Mocking behavior for now since API might not have check-in status endpoint
        // You would typically call api.get('hr/attendances/today/')
    };

    const fetchRecentAttendances = async () => {
        try {
            const res = await api.get('hr/attendances/');
            setRecentAttendances(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchStatus();
        fetchRecentAttendances();
    }, []);

    const handleCheckIn = async () => {
        setLoading(true);
        try {
            await api.post('hr/attendances/', {
                // employee would be implicitly set by backend based on JWT user
                // or we pass employee ID if required by serializer. For now:
                // Assuming backend sets it.
            });
            message.success('Successfully checked in!');
            setIsCheckedIn(true);
            fetchRecentAttendances();
        } catch (error) {
            message.error('Failed to check in');
        } finally {
            setLoading(false);
        }
    };

    const handleCheckOut = async () => {
        setLoading(true);
        try {
            // Usually a PATCH request to the today's attendance record
            message.success('Successfully checked out!');
            setIsCheckedIn(false);
            fetchRecentAttendances();
        } catch (error) {
            message.error('Failed to check out');
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        {
            title: 'Date',
            dataIndex: 'date',
            key: 'date',
        },
        {
            title: 'Check In',
            dataIndex: 'check_in',
            key: 'check_in',
            render: (text) => text ? new Date(text).toLocaleTimeString() : '-',
        },
        {
            title: 'Check Out',
            dataIndex: 'check_out',
            key: 'check_out',
            render: (text) => text ? new Date(text).toLocaleTimeString() : '-',
        },
    ];

    return (
        <div>
            <Title level={3}>Employee Dashboard</Title>
            
            <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col span={12}>
                    <Card>
                        <Statistic
                            title="Status Kehadiran Hari Ini"
                            value={isCheckedIn ? "Checked In" : "Not Checked In"}
                            prefix={isCheckedIn ? <CheckCircleOutlined className="icon-success" /> : <ClockCircleOutlined className="icon-warning" />}
                        />
                        <div style={{ marginTop: 16, display: 'flex', gap: 16 }}>
                            <Button 
                                type="primary" 
                                size="large" 
                                disabled={isCheckedIn}
                                onClick={handleCheckIn}
                                loading={loading}
                            >
                                Check In
                            </Button>
                            <Button 
                                type="default" 
                                size="large" 
                                disabled={!isCheckedIn}
                                onClick={handleCheckOut}
                                loading={loading}
                                danger
                            >
                                Check Out
                            </Button>
                        </div>
                    </Card>
                </Col>
                <Col span={12}>
                    <Card style={{ height: '100%' }}>
                        <Title level={5}>Aksi Cepat</Title>
                        <Button type="dashed" block icon={<FormOutlined />} style={{ marginBottom: 8 }} href="/leave-requests">
                            Ajukan Cuti / Izin
                        </Button>
                        <Text type="secondary">Gunakan menu ini untuk mengajukan ketidakhadiran dengan alasan sakit, cuti tahunan, atau izin lainnya.</Text>
                    </Card>
                </Col>
            </Row>

            <Card title="Riwayat Absensi Terakhir">
                <Table 
                    dataSource={recentAttendances} 
                    columns={columns} 
                    rowKey="id"
                    pagination={{ pageSize: 5 }}
                />
            </Card>
        </div>
    );
};

export default Dashboard;
