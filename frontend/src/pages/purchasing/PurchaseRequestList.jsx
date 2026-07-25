import React, { useState, useEffect } from 'react';
import { Table, Button, Space, message, Typography, Popconfirm, Tag, Tooltip, Badge } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, CheckOutlined, CloseOutlined, SendOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import api from '../../api/axiosConfig';
import PurchaseRequestModal from '../../components/modals/purchasing/PurchaseRequestModal';
import PurchaseOrderModal from '../../components/modals/purchasing/PurchaseOrderModal';
import Can from '../../components/Can';
import TableSearch, { filterTableData } from '../../components/TableSearch';

const { Title } = Typography;

const PurchaseRequestList = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingData, setEditingData] = useState(null);
    const [poModalVisible, setPoModalVisible] = useState(false);
    const [selectedPrForPo, setSelectedPrForPo] = useState(null);
    const [searchText, setSearchText] = useState("");

    const filteredData = filterTableData(data, searchText);

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await api.get('/purchasing/requests/');
            setData(response.data.results || response.data || []);
        } catch (error) {
            message.error('Gagal mengambil data Purchase Request');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleDelete = async (id) => {
        try {
            await api.delete(`/purchasing/requests/${id}/`);
            message.success('PR berhasil dihapus');
            fetchData();
        } catch (error) {
            message.error('Gagal menghapus PR');
        }
    };

    const handleAction = async (id, actionType) => {
        try {
            await api.post(`/purchasing/requests/${id}/${actionType}/`);
            message.success(`Status PR berhasil diperbarui (${actionType.toUpperCase()})`);
            fetchData();
        } catch (error) {
            message.error('Gagal memperbarui status PR: ' + (error.response?.data?.error || 'Error'));
        }
    };

    const getStatusTag = (status) => {
        switch (status) {
            case 'DRAFT':
                return <Tag color="default">Draft</Tag>;
            case 'SUBMITTED':
                return <Tag color="processing">Submitted (Waiting Approval)</Tag>;
            case 'APPROVED':
                return <Tag color="success">Approved</Tag>;
            case 'REJECTED':
                return <Tag color="error">Rejected</Tag>;
            case 'PO_CREATED':
                return <Tag color="purple">PO Created</Tag>;
            default:
                return <Tag>{status}</Tag>;
        }
    };

    const columns = [
        {
            title: 'No. Dokumen PR',
            dataIndex: 'document_number',
            key: 'doc',
            width: 170,
            sorter: (a, b) => String(a.document_number || '').localeCompare(String(b.document_number || '')),
            render: (text) => <Tag color="blue">{text}</Tag>
        },
        {
            title: 'Tanggal & Est. Kirim',
            key: 'dates',
            width: 170,
            render: (_, record) => (
                <div style={{ fontSize: 13 }}>
                    <div>📅 Req: {record.request_date || '-'}</div>
                    {record.expected_delivery_date && <div style={{ color: '#fa8c16' }}>⏳ Est: {record.expected_delivery_date}</div>}
                </div>
            )
        },
        {
            title: 'Departemen & Pemohon',
            key: 'dept_user',
            render: (_, record) => (
                <div>
                    <div style={{ fontWeight: 600 }}>{record.department_name || 'Umum'}</div>
                    <div style={{ fontSize: 12, color: '#666' }}>Oleh: {record.requested_by_name || '-'}</div>
                </div>
            )
        },
        {
            title: 'Jumlah Item',
            key: 'items',
            width: 120,
            render: (_, record) => <Badge count={(record.lines || []).length} showZero style={{ backgroundColor: '#1890ff' }} />
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
            width: 250,
            render: (_, record) => (
                <Space size="small" wrap>
                    {record.status === 'DRAFT' && (
                        <>
                            <Can perform="purchasing.pr.update">
                                <Tooltip title="Ajukan untuk Disetujui (Submit)">
                                    <Button
                                        type="primary"
                                        size="small"
                                        icon={<SendOutlined />}
                                        onClick={() => handleAction(record.id, 'submit')}
                                    >
                                        Ajukan
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
                            <Can perform="purchasing.pr.delete">
                                <Popconfirm
                                    title="Hapus PR Ini?"
                                    onConfirm={() => handleDelete(record.id)}
                                    okText="Ya"
                                    cancelText="Batal"
                                >
                                    <Button type="primary" danger icon={<DeleteOutlined />} size="small" />
                                </Popconfirm>
                            </Can>
                        </>
                    )}

                    {record.status === 'SUBMITTED' && (
                        <Can perform="purchasing.pr.approve">
                            <Tooltip title="Setujui PR">
                                <Button
                                    type="primary"
                                    style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                                    icon={<CheckOutlined />}
                                    size="small"
                                    onClick={() => handleAction(record.id, 'approve')}
                                >
                                    Setujui
                                </Button>
                            </Tooltip>
                            <Tooltip title="Tolak PR">
                                <Button
                                    type="primary"
                                    danger
                                    icon={<CloseOutlined />}
                                    size="small"
                                    onClick={() => handleAction(record.id, 'reject')}
                                >
                                    Tolak
                                </Button>
                            </Tooltip>
                        </Can>
                    )}

                    {record.status === 'APPROVED' && (
                        <Can perform="purchasing.po.create">
                            <Button
                                type="primary"
                                style={{ backgroundColor: '#722ed1', borderColor: '#722ed1' }}
                                icon={<ShoppingCartOutlined />}
                                size="small"
                                onClick={() => {
                                    setSelectedPrForPo(record);
                                    setPoModalVisible(true);
                                }}
                            >
                                Buat PO
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
                    <Title level={3} style={{ margin: 0 }}>Purchase Requests (PR)</Title>
                    <Typography.Text type="secondary">Permintaan pengadaan barang dari departemen internal dengan alur persetujuan.</Typography.Text>
                </div>
                <Can perform="purchasing.pr.create">
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => {
                            setEditingData(null);
                            setModalVisible(true);
                        }}
                    >
                        Buat PR Baru
                    </Button>
                </Can>
            </div>

            <TableSearch searchText={searchText} setSearchText={setSearchText} placeholder="Cari nomor dokumen PR, departemen, pemohon..." />

            <Table
                columns={columns}
                dataSource={filteredData}
                rowKey="id"
                loading={loading}
                pagination={{ pageSize: 10, showSizeChanger: true }}
                expandable={{
                    expandedRowRender: (record) => (
                        <div style={{ padding: '8px 16px', background: '#fbfbfb', borderRadius: 6, border: '1px solid #eee' }}>
                            <div style={{ fontWeight: 600, marginBottom: 8, color: '#333' }}>📦 Item yang Diminta:</div>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                                <thead>
                                    <tr style={{ background: '#f0f0f0', borderBottom: '1px solid #ccc' }}>
                                        <th style={{ padding: 6, textAlign: 'left' }}>Produk</th>
                                        <th style={{ padding: 6, textAlign: 'right' }}>Qty</th>
                                        <th style={{ padding: 6, textAlign: 'right' }}>Est. Biaya Satuan</th>
                                        <th style={{ padding: 6, textAlign: 'right' }}>Est. Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(record.lines || []).map((l, i) => (
                                        <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                                            <td style={{ padding: 6 }}>{l.product_code} - {l.product_name}</td>
                                            <td style={{ padding: 6, textAlign: 'right' }}>{l.quantity} {l.uom_name}</td>
                                            <td style={{ padding: 6, textAlign: 'right' }}>Rp {parseFloat(l.estimated_unit_cost || 0).toLocaleString('id-ID')}</td>
                                            <td style={{ padding: 6, textAlign: 'right', fontWeight: 600 }}>Rp {(parseFloat(l.quantity || 0) * parseFloat(l.estimated_unit_cost || 0)).toLocaleString('id-ID')}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {record.notes && <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>📝 Catatan: {record.notes}</div>}
                        </div>
                    )
                }}
            />

            <PurchaseRequestModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onSuccess={() => {
                    setModalVisible(false);
                    fetchData();
                }}
                editingData={editingData}
            />

            <PurchaseOrderModal
                visible={poModalVisible}
                onClose={() => {
                    setPoModalVisible(false);
                    setSelectedPrForPo(null);
                }}
                onSuccess={() => {
                    setPoModalVisible(false);
                    setSelectedPrForPo(null);
                    fetchData();
                }}
                fromPrData={selectedPrForPo}
            />
        </div>
    );
};

export default PurchaseRequestList;
