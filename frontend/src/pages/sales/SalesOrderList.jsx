import React, { useState, useEffect } from 'react';
import { Button, Space, message, Tag, Tooltip, Badge } from 'antd';
import { SendOutlined, CheckOutlined, CarOutlined } from '@ant-design/icons';
import api from '../../api/axiosConfig';
import SalesOrderModal from '../../components/modals/sales/SalesOrderModal';
import DeliveryOrderModal from '../../components/modals/sales/DeliveryOrderModal';
import { DataTable, StatusTag, TableActions, Can } from '../../components/common';

const SalesOrderList = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingData, setEditingData] = useState(null);
    const [doModalVisible, setDoModalVisible] = useState(false);
    const [selectedSoForDo, setSelectedSoForDo] = useState(null);
    const [searchText, setSearchText] = useState("");

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await api.get('/sales/orders/');
            setData(response.data.results || response.data || []);
        } catch (error) {
            message.error('Gagal mengambil data Sales Order');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleDelete = async (id) => {
        try {
            await api.delete(`/sales/orders/${id}/`);
            message.success('SO berhasil dihapus');
            fetchData();
        } catch (error) {
            message.error('Gagal menghapus SO');
        }
    };

    const handleAction = async (id, actionType) => {
        try {
            await api.post(`/sales/orders/${id}/${actionType}/`);
            message.success(`Status SO berhasil diperbarui (${actionType.toUpperCase()})`);
            fetchData();
        } catch (error) {
            message.error('Gagal memperbarui status SO: ' + (error.response?.data?.error || 'Error'));
        }
    };

    const columns = [
        {
            title: 'No. Dokumen SO',
            dataIndex: 'document_number',
            key: 'doc',
            width: 170,
            render: (text) => <Tag color="blue">{text}</Tag>
        },
        {
            title: 'Pelanggan',
            dataIndex: 'customer_name',
            key: 'customer',
            render: (_, record) => (
                <div>
                    <div style={{ fontWeight: 600 }}>{record.customer_name || '-'}</div>
                    <div style={{ fontSize: 12, color: '#666' }}>Kode: {record.customer_code}</div>
                </div>
            )
        },
        {
            title: 'Tanggal Order',
            dataIndex: 'order_date',
            key: 'dates',
            width: 160,
            render: (_, record) => (
                <div style={{ fontSize: 13 }}>
                    <div>📅 SO: {record.order_date || '-'}</div>
                    {record.expected_delivery_date && <div style={{ color: '#fa8c16' }}>⏳ Kirim: {record.expected_delivery_date}</div>}
                </div>
            )
        },
        {
            title: 'Total Nilai SO',
            dataIndex: 'total_amount',
            key: 'amount',
            width: 160,
            render: (val) => <span style={{ fontWeight: 600, color: '#2f54eb' }}>Rp {parseFloat(val || 0).toLocaleString('id-ID')}</span>
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            width: 200,
            render: (val) => <StatusTag status={val} />
        },
        {
            title: 'Aksi',
            key: 'action',
            width: 260,
            render: (_, record) => (
                <Space size="small" wrap>
                    {record.status === 'DRAFT' && (
                        <>
                            <Can access="sales.order.update">
                                <Tooltip title="Kirim ke Pelanggan / Quoted">
                                    <Button
                                        type="primary"
                                        size="small"
                                        icon={<SendOutlined />}
                                        onClick={() => handleAction(record.id, 'send')}
                                    >
                                        Kirim
                                    </Button>
                                </Tooltip>
                            </Can>
                            <TableActions
                                onEdit={() => {
                                    setEditingData(record);
                                    setModalVisible(true);
                                }}
                                onDelete={() => handleDelete(record.id)}
                                editPermission="sales.order.update"
                                deletePermission="sales.order.delete"
                                deleteTitle="Hapus SO Ini?"
                            />
                        </>
                    )}

                    {(record.status === 'DRAFT' || record.status === 'SENT') && (
                        <Can access="sales.order.confirm">
                            <Tooltip title="Konfirmasi SO (Pelanggan Deal / Bayar DP)">
                                <Button
                                    type="primary"
                                    style={{ backgroundColor: '#13c2c2', borderColor: '#13c2c2' }}
                                    icon={<CheckOutlined />}
                                    size="small"
                                    onClick={() => handleAction(record.id, 'confirm')}
                                >
                                    Konfirmasi
                                </Button>
                            </Tooltip>
                        </Can>
                    )}

                    {record.status === 'CONFIRMED' && (
                        <Can access="sales.delivery.create">
                            <Button
                                type="primary"
                                style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                                icon={<CarOutlined />}
                                size="small"
                                onClick={() => {
                                    setSelectedSoForDo(record);
                                    setDoModalVisible(true);
                                }}
                            >
                                Kirim Barang (DO)
                            </Button>
                        </Can>
                    )}
                </Space>
            ),
        },
    ];

    return (
        <div>
            <DataTable
                title="Sales Orders (SO)"
                description="Pesanan resmi pelanggan dan manajemen progres pengiriman barang keluar."
                onAdd={() => {
                    setEditingData(null);
                    setModalVisible(true);
                }}
                addText="Buat SO Baru"
                addPermission="sales.order.create"
                columns={columns}
                dataSource={data}
                loading={loading}
                searchText={searchText}
                setSearchText={setSearchText}
                expandable={{
                    expandedRowRender: (record) => (
                        <div style={{ padding: '8px 16px', background: '#fbfbfb', borderRadius: 6, border: '1px solid #eee' }}>
                            <div style={{ fontWeight: 600, marginBottom: 8, color: '#333' }}>🛒 Rincian Item SO:</div>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                                <thead>
                                    <tr style={{ background: '#f0f0f0', borderBottom: '1px solid #ccc' }}>
                                        <th style={{ padding: 6, textAlign: 'left' }}>Produk</th>
                                        <th style={{ padding: 6, textAlign: 'right' }}>Qty Dipesan</th>
                                        <th style={{ padding: 6, textAlign: 'right' }}>Qty Dikirim (DO)</th>
                                        <th style={{ padding: 6, textAlign: 'right' }}>Harga Satuan</th>
                                        <th style={{ padding: 6, textAlign: 'right' }}>Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(record.lines || []).map((l, i) => (
                                        <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                                            <td style={{ padding: 6 }}>{l.product_code} - {l.product_name}</td>
                                            <td style={{ padding: 6, textAlign: 'right' }}><Tag color="blue">{l.quantity} {l.uom}</Tag></td>
                                            <td style={{ padding: 6, textAlign: 'right' }}>
                                                <Tag color={parseFloat(l.shipped_qty) >= parseFloat(l.quantity) ? 'green' : (parseFloat(l.shipped_qty) > 0 ? 'orange' : 'default')}>
                                                    {l.shipped_qty} {l.uom}
                                                </Tag>
                                            </td>
                                            <td style={{ padding: 6, textAlign: 'right' }}>Rp {parseFloat(l.unit_price || 0).toLocaleString('id-ID')}</td>
                                            <td style={{ padding: 6, textAlign: 'right', fontWeight: 600 }}>Rp {parseFloat(l.subtotal || 0).toLocaleString('id-ID')}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {record.notes && <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>📝 Catatan: {record.notes}</div>}
                        </div>
                    )
                }}
            />

            <SalesOrderModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onSuccess={() => {
                    setModalVisible(false);
                    fetchData();
                }}
                editingData={editingData}
            />

            <DeliveryOrderModal
                visible={doModalVisible}
                onClose={() => {
                    setDoModalVisible(false);
                    setSelectedSoForDo(null);
                }}
                onSuccess={() => {
                    setDoModalVisible(false);
                    setSelectedSoForDo(null);
                    fetchData();
                }}
                fromSoData={selectedSoForDo}
            />
        </div>
    );
};

export default SalesOrderList;
