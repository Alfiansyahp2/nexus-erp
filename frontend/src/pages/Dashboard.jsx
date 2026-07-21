import React, { useState, useEffect } from 'react';
import { Card, Button, Typography, Row, Col, Statistic, message, Table, Tag, Space, Modal, Image } from 'antd';
import { CheckCircleOutlined, ClockCircleOutlined, FormOutlined, EnvironmentOutlined } from '@ant-design/icons';
import api from '../api/axiosConfig';
import AttendanceCameraModal from '../components/modals/hr/AttendanceCameraModal';

const { Title, Text } = Typography;

const Dashboard = () => {
    const [loading, setLoading] = useState(false);
    const [isCheckedIn, setIsCheckedIn] = useState(false);
    const [recentAttendances, setRecentAttendances] = useState([]);
    const [cameraModalVisible, setCameraModalVisible] = useState(false);
    const [attendanceType, setAttendanceType] = useState('in'); // 'in' or 'out'
    
    const fetchStatus = async () => {
        try {
            const res = await api.get('hr/attendances/today_status/');
            setIsCheckedIn(res.data.status === 'CHECKED_IN');
            // If CHECKED_OUT, we could also track that to disable the Check In button entirely
        } catch (error) {
            console.error('Failed to fetch attendance status');
        }
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

    const handleCheckInClick = () => {
        setAttendanceType('in');
        setCameraModalVisible(true);
    };

    const handleCheckOutClick = () => {
        setAttendanceType('out');
        setCameraModalVisible(true);
    };

    const handleCameraConfirm = async (lat, lng, photoFile) => {
        setLoading(true);
        const formData = new FormData();
        formData.append('latitude', lat);
        formData.append('longitude', lng);
        formData.append('photo', photoFile);

        try {
            if (attendanceType === 'in') {
                await api.post('hr/attendances/check_in/', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                message.success('Berhasil Check-In!');
            } else {
                await api.post('hr/attendances/check_out/', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                message.success('Berhasil Check-Out!');
            }
            setCameraModalVisible(false);
            fetchStatus();
            fetchRecentAttendances();
        } catch (error) {
            if (error.response && error.response.data && error.response.data.error) {
                message.error(error.response.data.error);
            } else {
                message.error(`Gagal melakukan ${attendanceType === 'in' ? 'Check-In' : 'Check-Out'}`);
            }
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        {
            title: 'Date',
            dataIndex: 'date', sorter: (a, b) => { const vA = a['date'] ?? ''; const vB = b['date'] ?? ''; if (typeof vA === 'number' && typeof vB === 'number') return vA - vB; return String(vA).localeCompare(String(vB)); },
            key: 'date',
        },
        {
            title: 'Check In',
            dataIndex: 'check_in', sorter: (a, b) => { const vA = a['check_in'] ?? ''; const vB = b['check_in'] ?? ''; if (typeof vA === 'number' && typeof vB === 'number') return vA - vB; return String(vA).localeCompare(String(vB)); },
            key: 'check_in',
            render: (text, record) => (
                <Space direction="vertical" size="small">
                    <Text>{text ? new Date(text).toLocaleTimeString() : '-'}</Text>
                    {record.check_in_lat && (
                        <Space>
                            {record.check_in_photo && (
                                <Image src={`http://localhost:8000${record.check_in_photo}`} width={40} height={40} style={{ objectFit: 'cover', borderRadius: '4px' }} />
                            )}
                            <a href={`https://www.google.com/maps/search/?api=1&query=${record.check_in_lat},${record.check_in_long}`} target="_blank" rel="noreferrer">
                                <EnvironmentOutlined /> Peta
                            </a>
                        </Space>
                    )}
                </Space>
            ),
        },
        {
            title: 'Check Out',
            dataIndex: 'check_out', sorter: (a, b) => { const vA = a['check_out'] ?? ''; const vB = b['check_out'] ?? ''; if (typeof vA === 'number' && typeof vB === 'number') return vA - vB; return String(vA).localeCompare(String(vB)); },
            key: 'check_out',
            render: (text, record) => (
                <Space direction="vertical" size="small">
                    <Text>{text ? new Date(text).toLocaleTimeString() : '-'}</Text>
                    {record.check_out_lat && (
                        <Space>
                            {record.check_out_photo && (
                                <Image src={`http://localhost:8000${record.check_out_photo}`} width={40} height={40} style={{ objectFit: 'cover', borderRadius: '4px' }} />
                            )}
                            <a href={`https://www.google.com/maps/search/?api=1&query=${record.check_out_lat},${record.check_out_long}`} target="_blank" rel="noreferrer">
                                <EnvironmentOutlined /> Peta
                            </a>
                        </Space>
                    )}
                </Space>
            ),
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
                                onClick={handleCheckInClick}
                            >
                                Check In
                            </Button>
                            <Button 
                                type="default" 
                                size="large" 
                                disabled={!isCheckedIn}
                                onClick={handleCheckOutClick}
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
            <AttendanceCameraModal 
                visible={cameraModalVisible}
                onCancel={() => setCameraModalVisible(false)}
                onConfirm={handleCameraConfirm}
                loading={loading}
                type={attendanceType}
            />
        </div>
    );
};

export default Dashboard;
