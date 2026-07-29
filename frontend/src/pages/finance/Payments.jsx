import React, { useState, useEffect } from 'react';
import { Tag, message } from 'antd';
import api from '../../api/axiosConfig';
import PaymentModal from '../../components/modals/finance/PaymentModal';
import { DataTable, TableActions } from '../../components/common';

const Payments = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [searchText, setSearchText] = useState("");

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
        <>
            <DataTable
                title="Payments (Kas & Bank)"
                addText="Catat Pembayaran"
                onAdd={() => setIsModalVisible(true)}
                addPermission="finance.payment.create"
                searchText={searchText}
                setSearchText={setSearchText}
                searchPlaceholder="Cari nomor pembayaran, mitra..."
                columns={columns}
                dataSource={payments}
                loading={loading}
                scroll={{ x: 'max-content' }}
            />
            
            <PaymentModal 
                visible={isModalVisible} 
                onClose={() => setIsModalVisible(false)}
                onSuccess={() => {
                    setIsModalVisible(false);
                    fetchPayments();
                }}
            />
        </>
    );
};

export default Payments;
