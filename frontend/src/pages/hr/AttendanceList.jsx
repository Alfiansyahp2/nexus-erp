import React, { useState, useEffect } from 'react';
import { Table, Card, Input, Button, Space, Typography, Tag, Tooltip, Row, Col, DatePicker } from 'antd';
import { SearchOutlined, ReloadOutlined, ClockCircleOutlined, CheckCircleOutlined, WarningOutlined } from '@ant-design/icons';
import api from '../../api/axiosConfig';
import dayjs from 'dayjs';

const { Title } = Typography;
const { RangePicker } = DatePicker;

const AttendanceList = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

    const fetchAttendances = async (page = 1, pageSize = 10, search = '') => {
        setLoading(true);
        try {
            // Note: Add appropriate query parameters if backend supports them.
            // For now, we simulate pagination/search if the backend is standard DRF ViewSet.
            const response = await api.get('/hr/attendances/', {
                params: {
                    page,
                    page_size: pageSize,
                    search: search
                }
            });
            // Handle both paginated and non-paginated responses
            if (response.data.results) {
                setData(response.data.results);
                setPagination({
                    ...pagination,
                    current: page,
                    pageSize,
                    total: response.data.count
                });
            } else {
                setData(response.data);
                setPagination(false); // Disable pagination if API doesn't support it
            }
        } catch (error) {
            console.error("Error fetching attendances:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAttendances();
    }, []);

    const handleTableChange = (newPagination) => {
        fetchAttendances(newPagination.current, newPagination.pageSize, searchText);
    };

    const handleSearch = (value) => {
        setSearchText(value);
        fetchAttendances(1, pagination.pageSize, value);
    };

    const columns = [
        {
            title: 'Karyawan',
            dataIndex: 'employee_name', // Needs to map from backend employee serialization
            key: 'employee',
            render: (text, record) => (
                <div style={{ fontWeight: 500 }}>
                    {record.employee ? (record.employee.full_name || record.employee.employee_id) : 'Unknown Employee'}
                </div>
            )
        },
        {
            title: 'Tanggal',
            dataIndex: 'date',
            key: 'date',
            render: (text) => dayjs(text).format('DD MMM YYYY')
        },
        {
            title: 'Check In',
            dataIndex: 'check_in',
            key: 'check_in',
            render: (text, record) => {
                if (!text) return '-';
                const timeStr = dayjs(text).format('HH:mm');
                return (
                    <Space>
                        <span>{timeStr}</span>
                        {record.is_late && (
                            <Tooltip title={`Terlambat ${record.late_minutes} menit`}>
                                <Tag color="error" icon={<WarningOutlined />}>Terlambat</Tag>
                            </Tooltip>
                        )}
                    </Space>
                );
            }
        },
        {
            title: 'Check Out',
            dataIndex: 'check_out',
            key: 'check_out',
            render: (text) => text ? dayjs(text).format('HH:mm') : <Tag color="warning">Belum Check Out</Tag>
        },
        {
            title: 'Lokasi',
            key: 'location',
            render: (text, record) => {
                if (record.check_in_lat && record.check_in_long) {
                    return (
                        <a 
                            href={`https://maps.google.com/?q=${record.check_in_lat},${record.check_in_long}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                        >
                            Lihat Maps
                        </a>
                    );
                }
                return '-';
            }
        },
        {
            title: 'Status',
            key: 'status',
            render: (text, record) => {
                if (record.check_out) {
                    return <Tag color="success" icon={<CheckCircleOutlined />}>Selesai</Tag>;
                } else if (record.check_in) {
                    return <Tag color="processing" icon={<ClockCircleOutlined />}>Sedang Bekerja</Tag>;
                }
                return <Tag>Belum Hadir</Tag>;
            }
        }
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Title level={3} style={{ margin: 0 }}>Data Absensi Karyawan</Title>
                <Button type="primary" icon={<ReloadOutlined />} onClick={() => fetchAttendances()}>
                    Segarkan
                </Button>
            </div>

            <Card style={{ marginBottom: 16 }}>
                <Row gutter={16}>
                    <Col xs={24} md={8}>
                        <Input.Search
                            placeholder="Cari nama karyawan..."
                            allowClear
                            onSearch={handleSearch}
                            style={{ width: '100%' }}
                        />
                    </Col>
                    <Col xs={24} md={8}>
                        <RangePicker style={{ width: '100%' }} />
                    </Col>
                </Row>
            </Card>

            <Card styles={{ body: { padding: 0 } }}>
                <Table
                    columns={columns}
                    dataSource={data}
                    rowKey="id"
                    pagination={pagination}
                    loading={loading}
                    onChange={handleTableChange}
                />
            </Card>
        </div>
    );
};

export default AttendanceList;
