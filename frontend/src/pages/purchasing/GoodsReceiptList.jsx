import React, { useState, useEffect } from 'react';
import { Table, Button, Space, message, Typography, Popconfirm, Tag, Tooltip, Badge } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, CheckCircleOutlined } from '@ant-design/icons';
import api from '../../api/axiosConfig';
import GoodsReceiptModal from '../../components/modals/purchasing/GoodsReceiptModal';
import Can from '../../components/Can';
import TableSearch, { filterTableData } from '../../components/TableSearch';

const { Title } = Typography;

const GoodsReceiptList = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingData, setEditingData] = useState(null);
    const [searchText, setSearchText] = useState("");

    const filteredData = filterTableData(data, searchText);

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

    const getStatusTag = (status) => {
        switch (status) {
            case 'DRAFT':
                return <Tag color="default">Draft (Belum Divalidasi)</Tag>;
            case 'DONE':
                return <Tag color="success">Done (Stok Masuk & AP Tercatat)</Tag>;
            case 'CANCELLED':
                return <Tag color="error">Cancelled</Tag>;
            default:
                return <Tag>{status}</Tag>;
        }
    };

    const columns = [
        {
            title: 'No. Dokumen GRN',
            dataIndex: 'document_number',
            key: 'doc',
            width: 170,
            sorter: (a, b) => String(a.document_number || '').localeCompare(String(b.document_number || '')),
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
            sorter: (a, b) => String(a.vendor_name || '').localeCompare(String(b.vendor_name || '')),
            render: (val) => <div style={{ fontWeight: 600 }}>{val || '-'}</div>
        },
        {
            title: 'Gudang Tujuan & Tgl',
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
            width: 200,
            render: (val) => getStatusTag(val)
        },
        {
            title: 'Aksi',
            key: 'action',
            width: 210,
            render: (_, record) => (
                <Space size="small" wrap>
                    {record.status === 'DRAFT' && (
                        <>
                            <Can perform="purchasing.gr.confirm">
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
                            <Can perform="purchasing.gr.update">
                                <Button
                                    type="primary"
                                    ghost
                                    icon={<EditOutlined />}
                                    size="small"
                                    onClick={() => {
                                        setEditingData(record);
                                        setModalVisible(true);
                                    }}
                                />
                            </Can>
                            <Can perform="purchasing.gr.delete">
                                <Popconfirm
                                    title="Hapus GRN Ini?"
                                    onConfirm={() => handleDelete(record.id)}
                                    okText="Ya"
                                    cancelText="Batal"
                                >
                                    <Button type="primary" danger icon={<DeleteOutlined />} size="small" />
                                </Popconfirm>
                            </Can>
                        </>
                    )}
                </Space>
            ),
        },
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                    <Title level={3} style={{ margin: 0 }}>Goods Receipts (GRN) - Bukti Terima Barang</Title>
                    <Typography.Text type="secondary">Pencatatan barang masuk dari vendor, verifikasi fisik gudang, dan integrasi otomatis ke Inventory & AP Finance.</Typography.Text>
                </div>
                <Can perform="purchasing.gr.create">
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => {
                            setEditingData(null);
                            setModalVisible(true);
                        }}
                    >
                        Buat GRN Baru
                    </Button>
                </Can>
            </div>

            <TableSearch searchText={searchText} setSearchText={setSearchText} placeholder="Cari nomor GRN, PO, vendor, surat jalan supplier, gudang..." />

            <Table
                columns={columns}
                dataSource={filteredData}
                rowKey="id"
                loading={loading}
                pagination={{ pageSize: 10, showSizeChanger: true }}
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
