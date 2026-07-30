import React, { useState, useEffect } from 'react';
import { Card, Button, Typography, Row, Col, Statistic, message, Table, Space, Image, Tag } from 'antd';
import { CheckCircleOutlined, ClockCircleOutlined, FormOutlined, EnvironmentOutlined } from '@ant-design/icons';
import api from '../../api/axiosConfig';
import AttendanceCameraModal from '../../components/modals/hr/AttendanceCameraModal';

const { Title, Text } = Typography;

const EmployeeDashboard = () => {
    const [loading, setLoading] = useState(false);
    const [isCheckedIn, setIsCheckedIn] = useState(false);
    const [recentAttendances, setRecentAttendances] = useState([]);
    const [cameraModalVisible, setCameraModalVisible] = useState(false);
    const [attendanceType, setAttendanceType] = useState('in'); // 'in' or 'out'
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);
    
    const fetchStatus = async () => {
        try {
            const res = await api.get('hr/attendances/today_status/');
            setIsCheckedIn(res.data.status === 'CHECKED_IN');
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
            title: 'Tanggal',
            dataIndex: 'date', 
            sorter: (a, b) => { const vA = a['date'] ?? ''; const vB = b['date'] ?? ''; if (typeof vA === 'number' && typeof vB === 'number') return vA - vB; return String(vA).localeCompare(String(vB)); },
            key: 'date',
            render: (text) => <Text strong>{new Date(text).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</Text>
        },
        {
            title: 'Waktu Check In',
            dataIndex: 'check_in', 
            key: 'check_in',
            render: (text, record) => (
                <Space orientation="vertical" size="small">
                    {text ? <Tag color="success" style={{ fontSize: 14, padding: '4px 8px' }}>{new Date(text).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</Tag> : <Text type="secondary">-</Text>}
                    {record.check_in_lat && (
                        <Space>
                            {record.check_in_photo && (
                                <Image src={record.check_in_photo} width={40} height={40} style={{ objectFit: 'cover', borderRadius: '4px' }} fallback="https://via.placeholder.com/40" />
                            )}
                            <a href={`https://www.google.com/maps/search/?api=1&query=${record.check_in_lat},${record.check_in_long}`} target="_blank" rel="noreferrer">
                                <EnvironmentOutlined /> Lokasi
                            </a>
                        </Space>
                    )}
                </Space>
            ),
        },
        {
            title: 'Waktu Check Out',
            dataIndex: 'check_out', 
            key: 'check_out',
            render: (text, record) => (
                <Space orientation="vertical" size="small">
                    {text ? <Tag color="error" style={{ fontSize: 14, padding: '4px 8px' }}>{new Date(text).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</Tag> : <Tag color="default">Belum Selesai</Tag>}
                    {record.check_out_lat && (
                        <Space>
                            {record.check_out_photo && (
                                <Image src={record.check_out_photo} width={40} height={40} style={{ objectFit: 'cover', borderRadius: '4px' }} fallback="https://via.placeholder.com/40" />
                            )}
                            <a href={`https://www.google.com/maps/search/?api=1&query=${record.check_out_lat},${record.check_out_long}`} target="_blank" rel="noreferrer">
                                <EnvironmentOutlined /> Lokasi
                            </a>
                        </Space>
                    )}
                </Space>
            ),
        },
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <Title level={3} style={{ margin: 0 }}>Portal Absensi Mandiri</Title>
                <div style={{ textAlign: 'right' }}>
                    <Text type="secondary" style={{ fontSize: 16 }}>{currentTime.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</Text>
                    <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
                        {currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </Title>
                </div>
            </div>
            
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} lg={14}>
                    <Card style={{ height: '100%', borderRadius: 12, border: isCheckedIn ? '1px solid #b7eb8f' : '1px solid #ffe58f', backgroundColor: isCheckedIn ? '#f6ffed' : '#fffbe6' }}>
                        <Statistic
                            title={<Text strong style={{ fontSize: 16 }}>Status Kehadiran Hari Ini</Text>}
                            value={isCheckedIn ? "Sudah Check In" : "Belum Check In"}
                            styles={{ content: { color: isCheckedIn ? '#52c41a' : '#faad14', fontWeight: 'bold' } }}
                            prefix={isCheckedIn ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
                        />
                        <div style={{ marginTop: 24, display: 'flex', gap: 16 }}>
                            <Button 
                                type="primary" 
                                size="large" 
                                style={{ flex: 1, height: 50, fontSize: 16, borderRadius: 8, backgroundColor: '#52c41a' }}
                                disabled={isCheckedIn}
                                onClick={handleCheckInClick}
                                icon={<EnvironmentOutlined />}
                            >
                                CHECK IN
                            </Button>
                            <Button 
                                type="primary" 
                                danger
                                size="large" 
                                style={{ flex: 1, height: 50, fontSize: 16, borderRadius: 8 }}
                                disabled={!isCheckedIn}
                                onClick={handleCheckOutClick}
                                icon={<CheckCircleOutlined />}
                            >
                                CHECK OUT
                            </Button>
                        </div>
                    </Card>
                </Col>
                <Col xs={24} lg={10}>
                    <Card style={{ height: '100%', borderRadius: 12 }}>
                        <Title level={5}>Aksi Cepat</Title>
                        <Button type="dashed" block icon={<FormOutlined />} style={{ marginBottom: 12, height: 44, borderRadius: 8 }} href="/leave-requests">
                            Ajukan Cuti / Izin / Sakit
                        </Button>
                        <Text type="secondary" style={{ fontSize: 13 }}>Punya urusan mendadak atau kurang sehat? Gunakan menu ini untuk mengajukan perizinan ketidakhadiran kepada HRD.</Text>
                    </Card>
                </Col>
            </Row>

            <Card title="Riwayat Absensi Terakhir">
                <Table 
                    dataSource={recentAttendances} 
                    columns={columns} 
                    rowKey="id"
                    pagination={{ pageSize: 5 }}
                    scroll={{ x: 'max-content' }}
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

export default EmployeeDashboard;
