import React, { useState, useEffect } from 'react';
import { Button, Space, message, Popconfirm, Tag } from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';
import api from '../../api/axiosConfig';
import DeliveryOrderModal from '../../components/modals/sales/DeliveryOrderModal';
import { DataTable, StatusTag, TableActions, Can } from '../../components/common';

const DeliveryOrderList = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingData, setEditingData] = useState(null);
    const [searchText, setSearchText] = useState("");

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await api.get('/sales/deliveries/');
            setData(response.data.results || response.data || []);
        } catch (error) {
            message.error('Gagal mengambil data Delivery Order (Surat Jalan)');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleDelete = async (id) => {
        try {
            await api.delete(`/sales/deliveries/${id}/`);
            message.success('Surat Jalan berhasil dihapus');
            fetchData();
        } catch (error) {
            message.error('Gagal menghapus Surat Jalan');
        }
    };

    const handleConfirm = async (id) => {
        try {
            await api.post(`/sales/deliveries/${id}/confirm/`);
            message.success('🎉 Pengiriman Berhasil Dikonfirmasi! (Stok Gudang dan Tagihan Piutang AR telah otomatis diperbarui)');
            fetchData();
        } catch (error) {
            message.error('Gagal mengkonfirmasi pengiriman: ' + (error.response?.data?.error || 'Error'));
        }
    };

    const columns = [
        {
            title: 'No. Surat Jalan (DO)',
            dataIndex: 'document_number',
            key: 'doc',
            width: 170,
            render: (text, record) => (
                <div>
                    <Tag color="cyan">{text}</Tag>
                    <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>SO: {record.so_number}</div>
                </div>
            )
        },
        {
            title: 'Pelanggan',
            dataIndex: 'customer_name',
            key: 'customer',
            render: (val) => <div style={{ fontWeight: 600 }}>{val || '-'}</div>
        },
        {
            title: 'Gudang Asal & Tgl',
            dataIndex: 'shipment_date',
            key: 'wh_date',
            width: 180,
            render: (_, record) => (
                <div style={{ fontSize: 13 }}>
                    <div>🏢 Gudang: <Tag color="orange">{record.warehouse_name || '-'}</Tag></div>
                    <div>📅 Tgl: {record.shipment_date || '-'}</div>
                </div>
            )
        },
        {
            title: 'Kurir / Resi Tracking',
            dataIndex: 'courier_tracking',
            key: 'tracking',
            width: 160,
            render: (val) => val ? <Tag color="blue">🚚 {val}</Tag> : <span style={{ color: '#aaa' }}>-</span>
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            width: 210,
            render: (val) => <StatusTag status={val} />
        },
        {
            title: 'Aksi',
            key: 'action',
            width: 220,
            render: (_, record) => (
                <Space size="small" wrap>
                    {record.status === 'DRAFT' && (
                        <>
                            <Can access="sales.delivery.confirm">
                                <Popconfirm
                                    title="Konfirmasi Pengiriman Barang?"
                                    description="Stok gudang akan otomatis BERKURANG dan tagihan pelanggan (AR) akan diterbitkan di Keuangan."
                                    onConfirm={() => handleConfirm(record.id)}
                                    okText="Ya, Konfirmasi Kirim"
                                    cancelText="Batal"
                                >
                                    <Button
                                        type="primary"
                                        style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                                        icon={<CheckCircleOutlined />}
                                        size="small"
                                    >
                                        Konfirmasi Kirim
                                    </Button>
                                </Popconfirm>
                            </Can>
                            <TableActions
                                onEdit={() => {
                                    setEditingData(record);
                                    setModalVisible(true);
                                }}
                                onDelete={() => handleDelete(record.id)}
                                editPermission="sales.delivery.update"
                                deletePermission="sales.delivery.delete"
                                deleteTitle="Hapus DO Ini?"
                            />
                        </>
                    )}
                </Space>
            ),
        },
    ];

    return (
        <div>
            <DataTable
                title="Delivery Orders (DO) - Surat Jalan"
                description="Pencatatan pengiriman barang ke pelanggan, pengeluaran fisik gudang (Stock Out), dan integrasi penagihan AR Finance."
                onAdd={null} // DO usually created from SO, so no direct Add button here
                columns={columns}
                dataSource={data}
                loading={loading}
                searchText={searchText}
                setSearchText={setSearchText}
                expandable={{
                    expandedRowRender: (record) => (
                        <div style={{ padding: '8px 16px', background: '#fbfbfb', borderRadius: 6, border: '1px solid #eee' }}>
                            <div style={{ fontWeight: 600, marginBottom: 8, color: '#333' }}>📦 Rincian Barang yang Dikirim:</div>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                                <thead>
                                    <tr style={{ background: '#f0f0f0', borderBottom: '1px solid #ccc' }}>
                                        <th style={{ padding: 6, textAlign: 'left' }}>Produk</th>
                                        <th style={{ padding: 6, textAlign: 'right' }}>Qty Dikirim</th>
                                        <th style={{ padding: 6, textAlign: 'left' }}>No. Batch / Lot</th>
                                        <th style={{ padding: 6, textAlign: 'left' }}>Catatan</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(record.lines || []).map((l, i) => (
                                        <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                                            <td style={{ padding: 6 }}>{l.product_code} - {l.product_name}</td>
                                            <td style={{ padding: 6, textAlign: 'right' }}><Tag color="green">{l.quantity} {l.uom_name}</Tag></td>
                                            <td style={{ padding: 6 }}>{l.lot_number ? <Tag color="gold">{l.lot_number}</Tag> : '-'}</td>
                                            <td style={{ padding: 6 }}>{l.notes || '-'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {record.notes && <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>📝 Catatan Umum: {record.notes}</div>}
                        </div>
                    )
                }}
            />

            <DeliveryOrderModal
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

export default DeliveryOrderList;
