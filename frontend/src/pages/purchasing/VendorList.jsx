import React, { useState, useEffect } from 'react';
import { message, Tag } from 'antd';
import api from '../../api/axiosConfig';
import VendorModal from '../../components/modals/purchasing/VendorModal';
import { DataTable, StatusTag, TableActions } from '../../components/common';

const VendorList = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingData, setEditingData] = useState(null);
    const [searchText, setSearchText] = useState("");

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await api.get('/purchasing/vendors/');
            setData(response.data.results || response.data || []);
        } catch (error) {
            message.error('Gagal mengambil data vendor');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleDelete = async (id) => {
        try {
            await api.delete(`/purchasing/vendors/${id}/`);
            message.success('Data vendor berhasil dihapus');
            fetchData();
        } catch (error) {
            message.error('Gagal menghapus data vendor');
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
            title: 'Nama Vendor / Perusahaan',
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
            title: 'Partner Finansial (AP)',
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
                    editPermission="purchasing.vendor.update"
                    deletePermission="purchasing.vendor.delete"
                    deleteTitle="Hapus Vendor Ini?"
                />
            ),
        },
    ];

    return (
        <div>
            <DataTable
                title="Daftar Vendor / Supplier"
                description="Manajemen data mitra pengadaan barang dan sinkronisasi otomatis AP Keuangan."
                onAdd={() => {
                    setEditingData(null);
                    setModalVisible(true);
                }}
                addText="Tambah Vendor Baru"
                addPermission="purchasing.vendor.create"
                columns={columns}
                dataSource={data}
                loading={loading}
                searchText={searchText}
                setSearchText={setSearchText}
            />

            <VendorModal
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

export default VendorList;
