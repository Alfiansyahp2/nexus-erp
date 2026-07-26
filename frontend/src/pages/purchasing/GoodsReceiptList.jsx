import React, { useState, useEffect } from 'react';
import { Button, Space, message, Popconfirm, Tag } from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';
import api from '../../api/axiosConfig';
import GoodsReceiptModal from '../../components/modals/purchasing/GoodsReceiptModal';
import { DataTable, StatusTag, TableActions, Can } from '../../components/common';

const GoodsReceiptList = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingData, setEditingData] = useState(null);
    const [searchText, setSearchText] = useState("");

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await api.get('/purchasing/receipts/');
            setData(response.data.results || response.data || []);
        } catch (error) {
            message.error('Gagal mengambil data Goods Receipt (GRN)');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleDelete = async (id) => {
        try {
            await api.delete(`/purchasing/receipts/${id}/`);
            message.success('GRN berhasil dihapus');
            fetchData();
        } catch (error) {
            message.error('Gagal menghapus GRN');
        }
    };

    const handleConfirm = async (id) => {
        try {
            await api.post(`/purchasing/receipts/${id}/confirm/`);
            message.success('🎉 Barang Berhasil Dikonfirmasi Diterima! (Stok Inventory dan Tagihan Vendor AP telah otomatis diperbarui)');
            fetchData();
        } catch (error) {
            message.error('Gagal mengkonfirmasi penerimaan: ' + (error.response?.data?.error || 'Error'));
        }
    };

    const columns = [
        {
            title: 'No. Dokumen GRN',
            dataIndex: 'document_number',
            key: 'doc',
            width: 170,
            render: (text, record) => (
                <div>
                    <Tag color="cyan">{text}</Tag>
                    <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>PO: {record.po_number}</div>
                </div>
            )
        },
        {
            title: 'Vendor / Supplier',
            dataIndex: 'vendor_name',
            key: 'vendor',
            render: (val) => <div style={{ fontWeight: 600 }}>{val || '-'}</div>
        },
        {
            title: 'Gudang Tujuan & Tgl',
            dataIndex: 'receipt_date',
            key: 'wh_date',
            width: 180,
            render: (_, record) => (
                <div style={{ fontSize: 13 }}>
                    <div>🏢 Gudang: <Tag color="orange">{record.warehouse_name || '-'}</Tag></div>
                    <div>📅 Tgl: {record.receipt_date || '-'}</div>
                </div>
            )
        },
        {
            title: 'Surat Jalan Supplier',
            dataIndex: 'delivery_note_number',
            key: 'sj',
            width: 160,
            render: (val) => val ? <Tag color="blue">📑 {val}</Tag> : <span style={{ color: '#aaa' }}>-</span>
        },
        {
            title: 'Penerima',
            dataIndex: 'received_by_name',
            key: 'receiver',
            width: 140,
            render: (val) => val || 'System'
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
                            <Can access="purchasing.gr.confirm">
                                <Popconfirm
                                    title="Konfirmasi Terima Barang?"
                                    description="Stok gudang akan otomatis bertambah dan tagihan vendor (AP) akan diterbitkan di Keuangan."
                                    onConfirm={() => handleConfirm(record.id)}
                                    okText="Ya, Konfirmasi"
                                    cancelText="Batal"
                                >
                                    <Button
                                        type="primary"
                                        style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                                        icon={<CheckCircleOutlined />}
                                        size="small"
                                    >
                                        Konfirmasi Terima
                                    </Button>
                                </Popconfirm>
                            </Can>
                            <TableActions
                                onEdit={() => {
                                    setEditingData(record);
                                    setModalVisible(true);
                                }}
                                onDelete={() => handleDelete(record.id)}
                                editPermission="purchasing.gr.update"
                                deletePermission="purchasing.gr.delete"
                                deleteTitle="Hapus GRN Ini?"
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
                title="Goods Receipts (GRN) - Bukti Terima Barang"
                description="Pencatatan barang masuk dari vendor, verifikasi fisik gudang, dan integrasi otomatis ke Inventory & AP Finance."
                onAdd={() => {
                    setEditingData(null);
                    setModalVisible(true);
                }}
                addText="Buat GRN Baru"
                addPermission="purchasing.gr.create"
                columns={columns}
                dataSource={data}
                loading={loading}
                searchText={searchText}
                setSearchText={setSearchText}
                searchPlaceholder="Cari nomor GRN, PO, vendor, surat jalan supplier, gudang..."
                expandable={{
                    expandedRowRender: (record) => (
                        <div style={{ padding: '8px 16px', background: '#fbfbfb', borderRadius: 6, border: '1px solid #eee' }}>
                            <div style={{ fontWeight: 600, marginBottom: 8, color: '#333' }}>📦 Rincian Barang yang Diterima:</div>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                                <thead>
                                    <tr style={{ background: '#f0f0f0', borderBottom: '1px solid #ccc' }}>
                                        <th style={{ padding: 6, textAlign: 'left' }}>Produk</th>
                                        <th style={{ padding: 6, textAlign: 'right' }}>Qty Diterima</th>
                                        <th style={{ padding: 6, textAlign: 'left' }}>No. Batch / Lot</th>
                                        <th style={{ padding: 6, textAlign: 'left' }}>Tgl Kadaluarsa (Exp)</th>
                                        <th style={{ padding: 6, textAlign: 'left' }}>Catatan</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(record.lines || []).map((l, i) => (
                                        <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                                            <td style={{ padding: 6 }}>{l.product_code} - {l.product_name}</td>
                                            <td style={{ padding: 6, textAlign: 'right' }}><Tag color="green">{l.quantity} {l.uom_name}</Tag></td>
                                            <td style={{ padding: 6 }}>{l.lot_number ? <Tag color="gold">{l.lot_number}</Tag> : '-'}</td>
                                            <td style={{ padding: 6 }}>{l.expiry_date || '-'}</td>
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

            <GoodsReceiptModal
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

export default GoodsReceiptList;
