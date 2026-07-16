import React, { useState, useEffect } from 'react';
import { Table, Button, Card, Typography, Modal, Form, Select, DatePicker, Input, message, Tag } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import api from '../api/axiosConfig';

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

    const columns = [
        {
            title: 'Karyawan',
            dataIndex: 'employee_name',
            key: 'employee_name',
        },
        {
            title: 'Tipe',
            dataIndex: 'leave_type',
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
            dataIndex: 'start_date',
            key: 'start_date',
        },
        {
            title: 'Selesai',
            dataIndex: 'end_date',
            key: 'end_date',
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                let color = status === 'APPROVED' ? 'green' : status === 'REJECTED' ? 'red' : 'orange';
                return <Tag color={color}>{status}</Tag>;
            }
        },
    ];

    return (
        <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <Title level={4} style={{ margin: 0 }}>Pengajuan Cuti & Izin</Title>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                    Ajukan Cuti
                </Button>
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
