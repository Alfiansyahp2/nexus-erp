import React, { useState, useEffect, useMemo } from 'react';
import { Table, Button, Card, Typography, Tag, Space, message, Row, Col, Statistic, Tooltip, Popconfirm } from 'antd';
import { 
    DollarOutlined, 
    FilePdfOutlined, 
    CheckCircleOutlined, 
    SyncOutlined,
    WalletOutlined,
    BankOutlined,
    ExceptionOutlined
} from '@ant-design/icons';
import api from '../../api/axiosConfig';
import Can from '../../components/Can';

const { Title, Text } = Typography;

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
            message.error('Gagal mengambil data payroll');
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
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    };

    const handleGenerate = () => {
        message.info('Fitur generate payroll massal akan segera hadir!');
    };

    const handlePay = async (id) => {
        try {
            await api.patch(`hr/payrolls/${id}/`, { status: 'PAID' });
            message.success('Payroll berhasil disetujui dan dibayarkan!');
            fetchPayrolls();
        } catch (error) {
            message.error('Gagal memproses pembayaran');
        }
    };

    const stats = useMemo(() => {
        let totalNet = 0;
        let totalDeductions = 0;
        let pendingCount = 0;
        
        payrolls.forEach(p => {
            totalNet += parseFloat(p.net_salary || 0);
            totalDeductions += (parseFloat(p.tax_deduction || 0) + parseFloat(p.bpjs_deduction || 0) + parseFloat(p.absence_deduction || 0) + parseFloat(p.loan_deduction || 0));
            if (p.status === 'DRAFT') pendingCount++;
        });

        return { totalNet, totalDeductions, pendingCount };
    }, [payrolls]);

    const columns = [
        {
            title: 'Karyawan',
            dataIndex: 'employee_name',
            key: 'employee_name',
            render: (text) => <Text strong>{text}</Text>
        },
        {
            title: 'Periode',
            key: 'period',
            render: (_, record) => <Tag color="blue">{record.period_month}/{record.period_year}</Tag>
        },
        {
            title: 'Gaji Pokok',
            dataIndex: 'base_salary',
            key: 'base_salary',
            align: 'right',
            render: (val) => formatCurrency(val)
        },
        {
            title: 'Tunjangan',
            dataIndex: 'total_allowance',
            key: 'total_allowance',
            align: 'right',
            render: (val) => formatCurrency(val)
        },
        {
            title: 'Take Home Pay',
            dataIndex: 'net_salary',
            key: 'net_salary',
            align: 'right',
            render: (val) => <Text type="success" strong style={{ fontSize: '1.1em' }}>{formatCurrency(val)}</Text>
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            align: 'center',
            render: (status) => {
                const color = status === 'PAID' ? 'success' : 'warning';
                const icon = status === 'PAID' ? <CheckCircleOutlined /> : <SyncOutlined spin />;
                return <Tag icon={icon} color={color} style={{ padding: '4px 10px', borderRadius: '4px' }}>{status}</Tag>;
            }
        },
        {
            title: 'Aksi',
            key: 'action',
            align: 'center',
            render: (_, record) => (
                <Space size="middle">
                    {record.status === 'DRAFT' && (
                        <Tooltip title="Setujui Payroll">
                            <Popconfirm 
                                title="Setujui Payroll?" 
                                description="Tindakan ini akan memotong saldo kasbon (jika ada) dan menandai payroll sebagai terbayar."
                                onConfirm={() => handlePay(record.id)}
                                okText="Ya, Setujui"
                                cancelText="Batal"
                            >
                                <Button type="primary" size="small" icon={<CheckCircleOutlined />} style={{ backgroundColor: '#52c41a' }} />
                            </Popconfirm>
                        </Tooltip>
                    )}
                    <Tooltip title="Unduh Slip Gaji">
                        <Button type="default" size="small" icon={<FilePdfOutlined />} danger />
                    </Tooltip>
                </Space>
            )
        }
    ];

    const expandedRowRender = (record) => {
        const tax = parseFloat(record.tax_deduction || 0);
        const bpjs = parseFloat(record.bpjs_deduction || 0);
        const absence = parseFloat(record.absence_deduction || 0);
        const loan = parseFloat(record.loan_deduction || 0);
        const totalDed = tax + bpjs + absence + loan;
        const gross = parseFloat(record.base_salary || 0) + parseFloat(record.total_allowance || 0);

        return (
            <div style={{ padding: '16px 24px', backgroundColor: '#fafafa', borderRadius: '8px', border: '1px solid #f0f0f0' }}>
                <Row gutter={24}>
                    <Col span={8}>
                        <Card size="small" title="Detail Pendapatan" bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                <Text type="secondary">Gaji Pokok:</Text>
                                <Text>{formatCurrency(record.base_salary)}</Text>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                <Text type="secondary">Total Tunjangan:</Text>
                                <Text>{formatCurrency(record.total_allowance)}</Text>
                            </div>
                            <div style={{ borderTop: '1px solid #f0f0f0', margin: '8px 0' }} />
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Text strong>Gross Salary:</Text>
                                <Text strong>{formatCurrency(gross)}</Text>
                            </div>
                        </Card>
                    </Col>
                    <Col span={8}>
                        <Card size="small" title={<span style={{color: '#cf1322'}}>Rincian Potongan (Deductions)</span>} bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                <Text type="secondary">PPh 21 (Pajak):</Text>
                                <Text type="danger">-{formatCurrency(tax)}</Text>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                <Text type="secondary">BPJS:</Text>
                                <Text type="danger">-{formatCurrency(bpjs)}</Text>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                <Text type="secondary">Penalti Absen:</Text>
                                <Text type="danger">-{formatCurrency(absence)}</Text>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                <Text type="secondary">Cicilan Kasbon:</Text>
                                <Text type="danger">-{formatCurrency(loan)}</Text>
                            </div>
                            <div style={{ borderTop: '1px solid #f0f0f0', margin: '8px 0' }} />
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Text strong>Total Potongan:</Text>
                                <Text strong type="danger">-{formatCurrency(totalDed)}</Text>
                            </div>
                        </Card>
                    </Col>
                    <Col span={8}>
                        <Card size="small" title="Ringkasan Bersih" bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)', backgroundColor: '#f6ffed' }}>
                            <div style={{ textAlign: 'center', padding: '20px 0' }}>
                                <Text type="secondary" style={{ fontSize: '14px', display: 'block', marginBottom: '8px' }}>Take Home Pay</Text>
                                <Text type="success" style={{ fontSize: '28px', fontWeight: 'bold' }}>{formatCurrency(record.net_salary)}</Text>
                            </div>
                        </Card>
                    </Col>
                </Row>
            </div>
        );
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <Title level={2} style={{ margin: 0, fontWeight: 600 }}>Payroll Engine</Title>
                    <Text type="secondary">Otomatisasi perhitungan gaji, pajak, BPJS, dan potongan kasbon.</Text>
                </div>
                <Can access="hr.payroll.create">
                    <Button type="primary" size="large" icon={<WalletOutlined />} onClick={handleGenerate} style={{ borderRadius: '6px', boxShadow: '0 4px 12px rgba(24,144,255,0.3)' }}>
                        Generate Payroll Bulanan
                    </Button>
                </Can>
            </div>

            <Row gutter={24}>
                <Col span={8}>
                    <Card bordered={false} style={{ borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                        <Statistic
                            title={<span style={{ color: '#8c8c8c', fontSize: '14px' }}>Total Take Home Pay (Periode Ini)</span>}
                            value={stats.totalNet}
                            prefix={<BankOutlined style={{ color: '#52c41a' }} />}
                            formatter={formatCurrency}
                            valueStyle={{ color: '#52c41a', fontWeight: 'bold', fontSize: '24px' }}
                        />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card bordered={false} style={{ borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                        <Statistic
                            title={<span style={{ color: '#8c8c8c', fontSize: '14px' }}>Total Potongan Pekerja</span>}
                            value={stats.totalDeductions}
                            prefix={<ExceptionOutlined style={{ color: '#f5222d' }} />}
                            formatter={formatCurrency}
                            valueStyle={{ color: '#f5222d', fontWeight: 'bold', fontSize: '24px' }}
                        />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card bordered={false} style={{ borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                        <Statistic
                            title={<span style={{ color: '#8c8c8c', fontSize: '14px' }}>Menunggu Persetujuan</span>}
                            value={stats.pendingCount}
                            suffix="Karyawan"
                            valueStyle={{ color: '#faad14', fontWeight: 'bold', fontSize: '24px' }}
                        />
                    </Card>
                </Col>
            </Row>

            <Card bordered={false} style={{ borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                <Table
                    columns={columns}
                    dataSource={payrolls}
                    rowKey="id"
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                    expandable={{
                        expandedRowRender,
                        expandRowByClick: true
                    }}
                />
            </Card>
        </div>
    );
};

export default Payroll;
