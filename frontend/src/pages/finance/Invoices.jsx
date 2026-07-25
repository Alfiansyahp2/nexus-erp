import React, { useState, useEffect } from 'react';
import { Table, Card, Typography, Tag, Button, Space, message } from 'antd';
import { SyncOutlined, PlusOutlined, FileTextOutlined } from '@ant-design/icons';
import api from '../../api/axiosConfig';
import InvoiceModal from '../../components/modals/finance/InvoiceModal';
import Can from '../../components/Can';
import TableSearch, { filterTableData } from '../../components/TableSearch';

const { Title } = Typography;

const Invoices = () => {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [searchText, setSearchText] = useState("");

    const filteredInvoices = filterTableData(invoices, searchText);

    const fetchInvoices = async () => {
        setLoading(true);
        try {
            const response = await api.get('finance/invoices/');
            setInvoices(response.data);
        } catch (error) {
            message.error('Gagal mengambil data tagihan (invoices)');
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchInvoices();
    }, []);

    const columns = [
        {
            title: 'Nomor Dokumen',
            dataIndex: 'document_number',
            key: 'document_number',
            render: (text) => <strong>{text}</strong>
        },
        {
            title: 'Tipe Tagihan',
            dataIndex: 'invoice_type',
            key: 'invoice_type',
            render: (type) => (
                <Tag color={type === 'VENDOR_BILL' ? 'volcano' : 'blue'}>
                    {type === 'VENDOR_BILL' ? 'Hutang (AP)' : 'Piutang (AR)'}
                </Tag>
            )
        },
        {
            title: 'Mitra Bisnis',
            dataIndex: 'partner_name',
            key: 'partner_name',
        },
        {
            title: 'Tanggal',
            dataIndex: 'date',
            key: 'date',
        },
        {
            title: 'Total Tagihan',
            dataIndex: 'total_amount',
            key: 'total_amount',
            render: (val) => `Rp ${parseFloat(val).toLocaleString('id-ID')}`
        },
        {
            title: 'Sisa Pembayaran',
            dataIndex: 'amount_due',
            key: 'amount_due',
            render: (val) => <span style={{ color: val > 0 ? 'red' : 'green' }}>Rp {parseFloat(val).toLocaleString('id-ID')}</span>
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                const colors = { DRAFT: 'default', OPEN: 'processing', PAID: 'success', CANCELLED: 'error' };
                return <Tag color={colors[status] || 'default'}>{status}</Tag>;
            }
        }
    ];

    return (
        <div>
            <div className="table-toolbar">
                <Title level={3} style={{ margin: 0 }}>
                    <FileTextOutlined style={{ marginRight: 8 }} />
                    Invoices (Hutang & Piutang)
                </Title>
                <div className="table-toolbar-actions">
                    <Button icon={<SyncOutlined />} onClick={fetchInvoices} loading={loading}>
                        Refresh
                    </Button>
                    <Can access="finance.invoice.create">
                        <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalVisible(true)}>
                            Tambah Tagihan Baru
                        </Button>
                    </Can>
                </div>
            </div>

            <Card className="card-custom">
                <div className="table-search-row">
                    <TableSearch value={searchText} onChange={(e) => setSearchText(e.target.value)} placeholder="Cari invoice, partner..." />
                </div>
                <Table 
                    columns={columns} 
                    dataSource={filteredInvoices} 
                    rowKey="id" 
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                />
            </Card>

            <InvoiceModal 
                visible={isModalVisible} 
                onClose={() => setIsModalVisible(false)}
                onSuccess={() => {
                    setIsModalVisible(false);
                    fetchInvoices();
                }}
            />
        </div>
    );
};

export default Invoices;
