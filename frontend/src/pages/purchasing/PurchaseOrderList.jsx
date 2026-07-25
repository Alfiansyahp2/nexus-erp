import React, { useState, useEffect } from 'react';
import { Table, Button, Space, message, Typography, Popconfirm, Tag, Tooltip, Badge } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, CheckOutlined, SendOutlined, InboxOutlined } from '@ant-design/icons';
import api from '../../api/axiosConfig';
import PurchaseOrderModal from '../../components/modals/purchasing/PurchaseOrderModal';
import GoodsReceiptModal from '../../components/modals/purchasing/GoodsReceiptModal';
import Can from '../../components/Can';
import TableSearch, { filterTableData } from '../../components/TableSearch';

const { Title } = Typography;

const PurchaseOrderList = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingData, setEditingData] = useState(null);
    const [grModalVisible, setGrModalVisible] = useState(false);
    const [selectedPoForGr, setSelectedPoForGr] = useState(null);
    const [searchText, setSearchText] = useState("");

    const filteredData = filterTableData(data, searchText);

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await api.get('/purchasing/orders/');
            setData(response.data.results || response.data || []);
        } catch (error) {
            message.error('Gagal mengambil data Purchase Order');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleDelete = async (id) => {
        try {
            await api.delete(`/purchasing/orders/${id}/`);
            message.success('PO berhasil dihapus');
            fetchData();
        } catch (error) {
            message.error('Gagal menghapus PO');
        }
    };

    const handleAction = async (id, actionType) => {
        try {
            await api.post(`/purchasing/orders/${id}/${actionType}/`);
            message.success(`Status PO berhasil diperbarui (${actionType.toUpperCase()})`);
            fetchData();
        } catch (error) {
            message.error('Gagal memperbarui status PO: ' + (error.response?.data?.error || 'Error'));
        }
    };

    const getStatusTag = (status) => {
        switch (status) {
            case 'DRAFT':
                return <Tag color="default">Draft</Tag>;
            case 'SENT':
                return <Tag color="processing">Sent to Vendor</Tag>;
            case 'CONFIRMED':
                return <Tag color="cyan">Confirmed (Waiting GRN)</Tag>;
            case 'COMPLETED':
                return <Tag color="success">Completed (Received)</Tag>;
            case 'CANCELLED':
                return <Tag color="error">Cancelled</Tag>;
            default:
                return <Tag>{status}</Tag>;
        }
    };

    const columns = [
        {
            title: 'No. Dokumen PO',
            dataIndex: 'document_number',
            key: 'doc',
            width: 170,
            sorter: (a, b) => String(a.document_number || '').localeCompare(String(b.document_number || '')),
            render: (text, record) => (
                <div>
                    <Tag color="purple">{text}</Tag>
                    {record.pr_number && <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>Ref PR: {record.pr_number}</div>}
                </div>
            )
        },
        {
            title: 'Vendor / Supplier',
            key: 'vendor',
            sorter: (a, b) => String(a.vendor_name || '').localeCompare(String(b.vendor_name || '')),
            render: (_, record) => (
                <div>
                    <div style={{ fontWeight: 600 }}>{record.vendor_name || '-'}</div>
                    <div style={{ fontSize: 12, color: '#666' }}>Kode: {record.vendor_code}</div>
                </div>
            )
        },
        {
            title: 'Tanggal Order',
            key: 'dates',
            width: 160,
            render: (_, record) => (
                <div style={{ fontSize: 13 }}>
                    <div>📅 PO: {record.order_date || '-'}</div>
                    {record.expected_delivery_date && <div style={{ color: '#fa8c16' }}>⏳ Kirim: {record.expected_delivery_date}</div>}
                </div>
            )
        },
        {
            title: 'Total Nilai PO',
            dataIndex: 'total_amount',
            key: 'amount',
            width: 160,
            render: (val) => <span style={{ fontWeight: 600, color: '#2f54eb' }}>Rp {parseFloat(val || 0).toLocaleString('id-ID')}</span>
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            width: 180,
            render: (val) => getStatusTag(val)
        },
        {
            title: 'Aksi',
            key: 'action',
            width: 260,
            render: (_, record) => (
                <Space size="small" wrap>
                    {record.status === 'DRAFT' && (
                        <>
                            <Can perform="purchasing.po.update">
                                <Tooltip title="Kirim ke Vendor (Sent)">
                                    <Button
                                        type="primary"
                                        size="small"
                                        icon={<SendOutlined />}
                                        onClick={() => handleAction(record.id, 'send_to_vendor')}
                                    >
                                        Kirim
                                    </Button>
                                </Tooltip>
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
                            <Can perform="purchasing.po.delete">
                                <Popconfirm
                                    title="Hapus PO Ini?"
                                    onConfirm={() => handleDelete(record.id)}
                                    okText="Ya"
                                    cancelText="Batal"
                                >
                                    <Button type="primary" danger icon={<DeleteOutlined />} size="small" />
                                </Popconfirm>
                            </Can>
                        </>
                    )}

                    {(record.status === 'DRAFT' || record.status === 'SENT') && (
                        <Can perform="purchasing.po.confirm">
                            <Tooltip title="Konfirmasi PO (Vendor Setuju)">
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
                        <Can perform="purchasing.gr.create">
                            <Button
                                type="primary"
                                style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                                icon={<InboxOutlined />}
                                size="small"
                                onClick={() => {
                                    setSelectedPoForGr(record);
                                    setGrModalVisible(true);
                                }}
                            >
                                Terima Barang (GRN)
                            </Button>
                        </Can>
                    )}
                </Space>
            ),
        },
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                    <Title level={3} style={{ margin: 0 }}>Purchase Orders (PO)</Title>
                    <Typography.Text type="secondary">Surat pesanan resmi kepada supplier dan manajemen progres penerimaan barang.</Typography.Text>
                </div>
                <Can perform="purchasing.po.create">
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => {
                            setEditingData(null);
                            setModalVisible(true);
                        }}
                    >
                        Buat PO Baru
                    </Button>
                </Can>
            </div>

            <TableSearch searchText={searchText} setSearchText={setSearchText} placeholder="Cari nomor dokumen PO, vendor, nomor PR, catatan..." />

            <Table
                columns={columns}
                dataSource={filteredData}
                rowKey="id"
                loading={loading}
                pagination={{ pageSize: 10, showSizeChanger: true }}
                expandable={{
                    expandedRowRender: (record) => (
                        <div style={{ padding: '8px 16px', background: '#fbfbfb', borderRadius: 6, border: '1px solid #eee' }}>
                            <div style={{ fontWeight: 600, marginBottom: 8, color: '#333' }}>🛒 Rincian Item PO:</div>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                                <thead>
                                    <tr style={{ background: '#f0f0f0', borderBottom: '1px solid #ccc' }}>
                                        <th style={{ padding: 6, textAlign: 'left' }}>Produk</th>
                                        <th style={{ padding: 6, textAlign: 'right' }}>Qty Dipesan</th>
                                        <th style={{ padding: 6, textAlign: 'right' }}>Qty Diterima (GRN)</th>
                                        <th style={{ padding: 6, textAlign: 'right' }}>Harga Satuan</th>
                                        <th style={{ padding: 6, textAlign: 'right' }}>Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(record.lines || []).map((l, i) => (
                                        <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                                            <td style={{ padding: 6 }}>{l.product_code} - {l.product_name}</td>
                                            <td style={{ padding: 6, textAlign: 'right' }}><Tag color="blue">{l.quantity} {l.uom_name}</Tag></td>
                                            <td style={{ padding: 6, textAlign: 'right' }}>
                                                <Tag color={parseFloat(l.received_qty) >= parseFloat(l.quantity) ? 'green' : (parseFloat(l.received_qty) > 0 ? 'orange' : 'default')}>
                                                    {l.received_qty} {l.uom_name}
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

            <PurchaseOrderModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onSuccess={() => {
                    setModalVisible(false);
                    fetchData();
                }}
                editingData={editingData}
            />

            <GoodsReceiptModal
                visible={grModalVisible}
                onClose={() => {
                    setGrModalVisible(false);
                    setSelectedPoForGr(null);
                }}
                onSuccess={() => {
                    setGrModalVisible(false);
                    setSelectedPoForGr(null);
                    fetchData();
                }}
                fromPoData={selectedPoForGr}
            />
        </div>
    );
};

export default PurchaseOrderList;
