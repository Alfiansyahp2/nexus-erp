import React, { useState, useEffect } from 'react';
import { message, Tag } from 'antd';
import api from '../../api/axiosConfig';
import CustomerModal from '../../components/modals/sales/CustomerModal';
import { DataTable, StatusTag, TableActions } from '../../components/common';

const CustomerList = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingData, setEditingData] = useState(null);
    const [searchText, setSearchText] = useState("");

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await api.get('/sales/customers/');
            setData(response.data.results || response.data || []);
        } catch (error) {
            message.error('Gagal mengambil data pelanggan');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleDelete = async (id) => {
        try {
            await api.delete(`/sales/customers/${id}/`);
            message.success('Data pelanggan berhasil dihapus');
            fetchData();
        } catch (error) {
            message.error('Gagal menghapus data pelanggan');
        }
    };

    const columns = [
        {
            title: 'Kode',
            dataIndex: 'code',
            key: 'code',
            width: 110,
            render: (text) => <Tag color="blue">{text}</Tag>
        },
        {
            title: 'Nama Pelanggan',
            dataIndex: 'name',
            key: 'name',
            render: (val, record) => (
                <div>
                    <div style={{ fontWeight: 600 }}>{val}</div>
                    {record.npwp && <div style={{ fontSize: 12, color: '#888' }}>NPWP: {record.npwp}</div>}
                </div>
            )
        },
        {
            title: 'Kontak',
            dataIndex: 'phone',
            key: 'contact',
            render: (_, record) => (
                <div style={{ fontSize: 13 }}>
                    <div>📞 {record.phone || '-'}</div>
                    <div>✉️ {record.email || '-'}</div>
                </div>
            )
        },
        {
            title: 'Term Bayar',
            dataIndex: 'payment_terms_days',
            key: 'terms',
            width: 120,
            render: (val) => `${val} Hari`
        },
        {
            title: 'Limit Kredit',
            dataIndex: 'credit_limit',
            key: 'limit',
            width: 150,
            render: (val) => <span style={{ color: '#52c41a', fontWeight: 600 }}>Rp {parseFloat(val || 0).toLocaleString('id-ID')}</span>
        },
        {
            title: 'Customer AR',
            dataIndex: 'business_partner_name',
            key: 'bp',
            render: (val) => val ? <Tag color="purple">✓ {val}</Tag> : <Tag color="default">Belum Sinkron</Tag>
        },
        {
            title: 'Status',
            dataIndex: 'is_active',
            key: 'status',
            width: 110,
            render: (val) => <StatusTag status={val} type="badge" />
        },
        {
            title: 'Aksi',
            key: 'action',
            width: 110,
            render: (_, record) => (
                <TableActions
                    onEdit={() => {
                        setEditingData(record);
                        setModalVisible(true);
                    }}
                    onDelete={() => handleDelete(record.id)}
                    editPermission="sales.customer.update"
                    deletePermission="sales.customer.delete"
                    deleteTitle="Hapus Pelanggan Ini?"
                />
            ),
        },
    ];

    return (
        <div>
            <DataTable
                title="Daftar Pelanggan (Customers)"
                description="Manajemen data pelanggan dan sinkronisasi otomatis Piutang (AR) Keuangan."
                onAdd={() => {
                    setEditingData(null);
                    setModalVisible(true);
                }}
                addText="Tambah Pelanggan Baru"
                addPermission="sales.customer.create"
                columns={columns}
                dataSource={data}
                loading={loading}
                searchText={searchText}
                setSearchText={setSearchText}
            />

            <CustomerModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onSuccess={() => {
                    setModalVisible(false);
                    fetchData();
                }}
                editingData={editingData}
            />
        </div>
    );
};

export default CustomerList;
