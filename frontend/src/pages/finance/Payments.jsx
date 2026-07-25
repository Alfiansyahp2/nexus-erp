import React, { useState, useEffect } from 'react';
import { Table, Card, Typography, Tag, Button, Space, message } from 'antd';
import { SyncOutlined, WalletOutlined, PlusOutlined } from '@ant-design/icons';
import api from '../../api/axiosConfig';
import PaymentModal from '../../components/modals/finance/PaymentModal';
import Can from '../../components/Can';

const { Title } = Typography;

const Payments = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);

    const fetchPayments = async () => {
        setLoading(true);
        try {
            const response = await api.get('finance/payments/');
            setPayments(response.data);
        } catch (error) {
            message.error('Gagal mengambil data pembayaran');
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchPayments();
    }, []);

    const columns = [
        {
            title: 'Nomor Pembayaran',
            dataIndex: 'payment_number',
            key: 'payment_number',
            render: (text) => <strong>{text}</strong>
        },
        {
            title: 'Tipe',
            dataIndex: 'payment_type',
            key: 'payment_type',
            render: (type) => (
                <Tag color={type === 'OUTBOUND' ? 'red' : 'green'}>
                    {type === 'OUTBOUND' ? 'Kas Keluar (Kirim)' : 'Kas Masuk (Terima)'}
                </Tag>
            )
        },
        {
            title: 'Mitra',
            dataIndex: 'partner_name',
            key: 'partner_name',
        },
        {
            title: 'Tanggal',
            dataIndex: 'date',
            key: 'date',
        },
        {
            title: 'Nominal',
            dataIndex: 'amount',
            key: 'amount',
            render: (val) => `Rp ${parseFloat(val).toLocaleString('id-ID')}`
        },
        {
            title: 'Terkoneksi Invoice',
            dataIndex: 'invoice_number',
            key: 'invoice_number',
            render: (inv) => inv ? <Tag color="blue">{inv}</Tag> : '-'
        },
        {
            title: 'Metode Pembayaran',
            dataIndex: 'payment_method_name',
            key: 'payment_method_name',
        }
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Title level={3} style={{ margin: 0 }}>
                    <WalletOutlined style={{ marginRight: 8 }} />
                    Payments (Kas & Bank)
                </Title>
                <Space>
                    <Button icon={<SyncOutlined />} onClick={fetchPayments} loading={loading}>
                        Refresh
                    </Button>
                    <Can access="finance.payment.create">
                        <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalVisible(true)}>
                            Catat Pembayaran
                        </Button>
                    </Can>
                </Space>
            </div>

            <Card className="card-custom">
                <Table 
                    columns={columns} 
                    dataSource={payments} 
                    rowKey="id" 
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                />
            </Card>
            
            <PaymentModal 
                visible={isModalVisible} 
                onClose={() => setIsModalVisible(false)}
                onSuccess={() => {
                    setIsModalVisible(false);
                    fetchPayments();
                }}
            />
        </div>
    );
};

export default Payments;
