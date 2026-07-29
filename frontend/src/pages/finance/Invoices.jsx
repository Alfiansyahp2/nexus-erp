import React, { useState, useEffect } from 'react';
import { Tag, message } from 'antd';
import api from '../../api/axiosConfig';
import InvoiceModal from '../../components/modals/finance/InvoiceModal';
import { DataTable, TableActions } from '../../components/common';

const Invoices = () => {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [searchText, setSearchText] = useState("");

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
        <>
            <DataTable
                title="Invoices (Hutang & Piutang)"
                addText="Tambah Tagihan Baru"
                onAdd={() => setIsModalVisible(true)}
                addPermission="finance.invoice.create"
                searchText={searchText}
                setSearchText={setSearchText}
                searchPlaceholder="Cari invoice, partner..."
                columns={columns}
                dataSource={invoices}
                loading={loading}
                scroll={{ x: 'max-content' }}
            />

            <InvoiceModal 
                visible={isModalVisible} 
                onClose={() => setIsModalVisible(false)}
                onSuccess={() => {
                    setIsModalVisible(false);
                    fetchInvoices();
                }}
            />
        </>
    );
};

export default Invoices;
