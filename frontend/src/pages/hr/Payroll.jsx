import React, { useState, useEffect } from 'react';
import { Table, Button, Card, Typography, Tag, Space, message, Modal } from 'antd';
import { DollarOutlined, FilePdfOutlined } from '@ant-design/icons';
import api from '../../api/axiosConfig';

const { Title } = Typography;

const Payroll = () => {
    const [payrolls, setPayrolls] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchPayrolls = async () => {
        setLoading(true);
        try {
            const response = await api.get('hr/payrolls/');
            setPayrolls(response.data);
        } catch (error) {
            console.error('Failed to fetch payrolls', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPayrolls();
    }, []);

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR'
        }).format(value);
    };

    const handleGenerate = () => {
        // Modal for generating payroll could go here
        message.info('Fitur generate payroll massal akan segera hadir!');
    };

    const columns = [
        {
            title: 'Karyawan',
            dataIndex: 'employee_name', sorter: (a, b) => { const vA = a['employee_name'] ?? ''; const vB = b['employee_name'] ?? ''; if (typeof vA === 'number' && typeof vB === 'number') return vA - vB; return String(vA).localeCompare(String(vB)); },
            key: 'employee_name',
        },
        {
            title: 'Periode',
            key: 'period',
            render: (_, record) => `${record.period_month}/${record.period_year}`
        },
        {
            title: 'Gaji Pokok',
            dataIndex: 'base_salary', sorter: (a, b) => { const vA = a['base_salary'] ?? ''; const vB = b['base_salary'] ?? ''; if (typeof vA === 'number' && typeof vB === 'number') return vA - vB; return String(vA).localeCompare(String(vB)); },
            key: 'base_salary',
            render: (val) => formatCurrency(val)
        },
        {
            title: 'Tunjangan',
            dataIndex: 'total_allowance', sorter: (a, b) => { const vA = a['total_allowance'] ?? ''; const vB = b['total_allowance'] ?? ''; if (typeof vA === 'number' && typeof vB === 'number') return vA - vB; return String(vA).localeCompare(String(vB)); },
            key: 'total_allowance',
            render: (val) => formatCurrency(val)
        },
        {
            title: 'Take Home Pay',
            dataIndex: 'net_salary', sorter: (a, b) => { const vA = a['net_salary'] ?? ''; const vB = b['net_salary'] ?? ''; if (typeof vA === 'number' && typeof vB === 'number') return vA - vB; return String(vA).localeCompare(String(vB)); },
            key: 'net_salary',
            render: (val) => <strong>{formatCurrency(val)}</strong>
        },
        {
            title: 'Status',
            dataIndex: 'status', sorter: (a, b) => { const vA = a['status'] ?? ''; const vB = b['status'] ?? ''; if (typeof vA === 'number' && typeof vB === 'number') return vA - vB; return String(vA).localeCompare(String(vB)); },
            key: 'status',
            render: (status) => {
                const color = status === 'PAID' ? 'green' : 'orange';
                return <Tag color={color}>{status}</Tag>;
            }
        },
        {
            title: 'Aksi',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Button type="primary" size="small" icon={<FilePdfOutlined />}>Slip</Button>
                </Space>
            )
        }
    ];

    return (
        <Card>
            <div className="page-header">
                <Title level={4} className="margin-0">Manajemen Penggajian (Payroll)</Title>
                <Button type="primary" icon={<DollarOutlined />} onClick={handleGenerate}>
                    Generate Payroll Bulanan
                </Button>
            </div>
            
            <Table
                columns={columns}
                dataSource={payrolls}
                rowKey="id"
                loading={loading}
                pagination={{ pageSize: 10 }}
            />
        </Card>
    );
};

export default Payroll;
