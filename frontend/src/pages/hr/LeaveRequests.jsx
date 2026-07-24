import React, { useState, useEffect } from 'react';
import { Table, Button, Card, Typography, Modal, Form, Select, DatePicker, Input, message, Tag, Space, Popconfirm, Tooltip } from 'antd';
import { PlusOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import api from '../../api/axiosConfig';
import Can from '../../components/Can';

const { Title } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const LeaveRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const response = await api.get('hr/leave-requests/');
            setRequests(response.data);
        } catch (error) {
            console.error('Failed to fetch leave requests', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleAdd = () => {
        setIsModalVisible(true);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        form.resetFields();
    };

    const onFinish = async (values) => {
        try {
            const data = {
                leave_type: values.leave_type,
                start_date: values.dates[0].format('YYYY-MM-DD'),
                end_date: values.dates[1].format('YYYY-MM-DD'),
                reason: values.reason,
                // employee field normally inferred in backend via JWT
                // For demonstration:
                employee: 1, 
            };
            await api.post('hr/leave-requests/', data);
            message.success('Pengajuan cuti berhasil dikirim');
            setIsModalVisible(false);
            form.resetFields();
            fetchRequests();
        } catch (error) {
            message.error('Gagal mengirim pengajuan cuti');
        }
    };

    const handleApprove = async (id, stage) => {
        try {
            await api.post(`hr/leave-requests/${id}/approve_${stage}/`);
            message.success('Cuti disetujui');
            fetchRequests();
        } catch (error) {
            message.error(error.response?.data?.error || 'Gagal menyetujui cuti');
        }
    };

    const handleReject = async (id) => {
        try {
            await api.post(`hr/leave-requests/${id}/reject/`);
            message.success('Cuti ditolak');
            fetchRequests();
        } catch (error) {
            message.error(error.response?.data?.error || 'Gagal menolak cuti');
        }
    };

    const columns = [
        {
            title: 'Karyawan',
            dataIndex: 'employee_name', sorter: (a, b) => { const vA = a['employee_name'] ?? ''; const vB = b['employee_name'] ?? ''; if (typeof vA === 'number' && typeof vB === 'number') return vA - vB; return String(vA).localeCompare(String(vB)); },
            key: 'employee_name',
        },
        {
            title: 'Tipe',
            dataIndex: 'leave_type', sorter: (a, b) => { const vA = a['leave_type'] ?? ''; const vB = b['leave_type'] ?? ''; if (typeof vA === 'number' && typeof vB === 'number') return vA - vB; return String(vA).localeCompare(String(vB)); },
            key: 'leave_type',
            render: (text) => {
                const map = {
                    'SICK': 'Sakit',
                    'ANNUAL': 'Cuti Tahunan',
                    'UNPAID': 'Izin'
                };
                return map[text] || text;
            }
        },
        {
            title: 'Mulai',
            dataIndex: 'start_date', sorter: (a, b) => { const vA = a['start_date'] ?? ''; const vB = b['start_date'] ?? ''; if (typeof vA === 'number' && typeof vB === 'number') return vA - vB; return String(vA).localeCompare(String(vB)); },
            key: 'start_date',
        },
        {
            title: 'Selesai',
            dataIndex: 'end_date', sorter: (a, b) => { const vA = a['end_date'] ?? ''; const vB = b['end_date'] ?? ''; if (typeof vA === 'number' && typeof vB === 'number') return vA - vB; return String(vA).localeCompare(String(vB)); },
            key: 'end_date',
        },
        {
            title: 'Status',
            dataIndex: 'status', sorter: (a, b) => { const vA = a['status'] ?? ''; const vB = b['status'] ?? ''; if (typeof vA === 'number' && typeof vB === 'number') return vA - vB; return String(vA).localeCompare(String(vB)); },
            key: 'status',
            render: (status) => {
                let color = status === 'APPROVED' ? 'green' : status === 'REJECTED' ? 'red' : 'orange';
                return <Tag color={color}>{status}</Tag>;
            }
        },
        {
            title: 'Aksi',
            key: 'action',
            render: (_, record) => (
                <Space size="small">
                    {record.status === 'PENDING_SPV' && (
                        <Can access="hr.leave.approve">
                            <Popconfirm title="Setujui sebagai SPV?" onConfirm={() => handleApprove(record.id, 'spv')}>
                                <Tooltip title="Setujui (SPV)">
                                    <Button type="text" shape="circle" icon={<CheckCircleOutlined style={{ color: '#52c41a', fontSize: '18px' }} />} className="hover-scale" />
                                </Tooltip>
                            </Popconfirm>
                            <Popconfirm title="Tolak cuti ini?" onConfirm={() => handleReject(record.id)}>
                                <Tooltip title="Tolak Cuti">
                                    <Button type="text" shape="circle" danger icon={<CloseCircleOutlined style={{ fontSize: '18px' }} />} className="hover-scale" />
                                </Tooltip>
                            </Popconfirm>
                        </Can>
                    )}
                    {record.status === 'PENDING_MANAGER' && (
                        <Can access="hr.leave.approve">
                            <Popconfirm title="Setujui sebagai Atasan?" onConfirm={() => handleApprove(record.id, 'manager')}>
                                <Tooltip title="Setujui (Manager)">
                                    <Button type="text" shape="circle" icon={<CheckCircleOutlined style={{ color: '#52c41a', fontSize: '18px' }} />} className="hover-scale" />
                                </Tooltip>
                            </Popconfirm>
                            <Popconfirm title="Tolak cuti ini?" onConfirm={() => handleReject(record.id)}>
                                <Tooltip title="Tolak Cuti">
                                    <Button type="text" shape="circle" danger icon={<CloseCircleOutlined style={{ fontSize: '18px' }} />} className="hover-scale" />
                                </Tooltip>
                            </Popconfirm>
                        </Can>
                    )}
                    {record.status === 'PENDING_HR' && (
                        <Can access="hr.leave.approve">
                            <Popconfirm title="Setujui sebagai HR?" onConfirm={() => handleApprove(record.id, 'hr')}>
                                <Tooltip title="Setujui (HR)">
                                    <Button type="text" shape="circle" icon={<CheckCircleOutlined style={{ color: '#52c41a', fontSize: '18px' }} />} className="hover-scale" />
                                </Tooltip>
                            </Popconfirm>
                            <Popconfirm title="Tolak cuti ini?" onConfirm={() => handleReject(record.id)}>
                                <Tooltip title="Tolak Cuti">
                                    <Button type="text" shape="circle" danger icon={<CloseCircleOutlined style={{ fontSize: '18px' }} />} className="hover-scale" />
                                </Tooltip>
                            </Popconfirm>
                        </Can>
                    )}
                </Space>
            )
        },
    ];

    return (
        <Card>
            <div className="page-header">
                <Title level={4} className="margin-0">Pengajuan Cuti & Izin</Title>
                <Can access="hr.leave.create">
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                        Ajukan Cuti
                    </Button>
                </Can>
            </div>
            
            <Table
                columns={columns}
                dataSource={requests}
                rowKey="id"
                loading={loading}
                pagination={{ pageSize: 10 }}
            />

            <Modal title="Form Pengajuan Cuti" open={isModalVisible} onCancel={handleCancel} footer={null}>
                <Form form={form} layout="vertical" onFinish={onFinish}>
                    <Form.Item name="leave_type" label="Tipe Cuti" rules={[{ required: true }]}>
                        <Select placeholder="Pilih tipe cuti">
                            <Option value="SICK">Sakit</Option>
                            <Option value="ANNUAL">Cuti Tahunan</Option>
                            <Option value="UNPAID">Izin di Luar Tanggungan</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item name="dates" label="Tanggal" rules={[{ required: true }]}>
                        <RangePicker style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item name="reason" label="Alasan" rules={[{ required: true }]}>
                        <Input.TextArea rows={4} placeholder="Jelaskan alasan pengajuan cuti/izin Anda" />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" block>Ajukan</Button>
                    </Form.Item>
                </Form>
            </Modal>
        </Card>
    );
};

export default LeaveRequests;
