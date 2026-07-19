import React, { useState, useEffect } from 'react';
import { Table, Button, Space, message, Typography, Popconfirm, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '../../api/axiosConfig';
import ProductModal from '../../components/modals/inventory/ProductModal';

const { Title } = Typography;

const ProductList = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingData, setEditingData] = useState(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await api.get('/inventory/products/');
            setData(response.data);
        } catch (error) {
            message.error('Gagal mengambil data produk');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleDelete = async (id) => {
        try {
            await api.delete(`/inventory/products/${id}/`);
            message.success('Data berhasil dihapus');
            fetchData();
        } catch (error) {
            message.error('Gagal menghapus data');
        }
    };

    const columns = [
        {
            title: 'Kode',
            dataIndex: 'code', sorter: (a, b) => { const vA = a['code'] ?? ''; const vB = b['code'] ?? ''; if (typeof vA === 'number' && typeof vB === 'number') return vA - vB; return String(vA).localeCompare(String(vB)); },
            key: 'code',
            width: 100,
        },
        {
            title: 'Nama Produk',
            dataIndex: 'name', sorter: (a, b) => { const vA = a['name'] ?? ''; const vB = b['name'] ?? ''; if (typeof vA === 'number' && typeof vB === 'number') return vA - vB; return String(vA).localeCompare(String(vB)); },
            key: 'name',
        },
        {
            title: 'Kategori',
            dataIndex: 'category_name', sorter: (a, b) => { const vA = a['category_name'] ?? ''; const vB = b['category_name'] ?? ''; if (typeof vA === 'number' && typeof vB === 'number') return vA - vB; return String(vA).localeCompare(String(vB)); },
            key: 'category_name',
        },
        {
            title: 'Satuan',
            dataIndex: 'unit_of_measure', sorter: (a, b) => { const vA = a['unit_of_measure'] ?? ''; const vB = b['unit_of_measure'] ?? ''; if (typeof vA === 'number' && typeof vB === 'number') return vA - vB; return String(vA).localeCompare(String(vB)); },
            key: 'unit_of_measure',
            width: 100,
        },
        {
            title: 'Harga Jual',
            dataIndex: 'unit_price', sorter: (a, b) => { const vA = a['unit_price'] ?? ''; const vB = b['unit_price'] ?? ''; if (typeof vA === 'number' && typeof vB === 'number') return vA - vB; return String(vA).localeCompare(String(vB)); },
            key: 'unit_price',
            render: (val) => `Rp ${parseFloat(val).toLocaleString('id-ID')}`
        },
        {
            title: 'Status',
            dataIndex: 'is_active', sorter: (a, b) => { const vA = a['is_active'] ?? ''; const vB = b['is_active'] ?? ''; if (typeof vA === 'number' && typeof vB === 'number') return vA - vB; return String(vA).localeCompare(String(vB)); },
            key: 'is_active',
            render: (isActive) => (
                <Tag color={isActive ? 'green' : 'red'}>
                    {isActive ? 'Aktif' : 'Non-Aktif'}
                </Tag>
            ),
        },
        {
            title: 'Aksi',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Button 
                        type="text" 
                        icon={<EditOutlined className="icon-primary" />} 
                        onClick={() => {
                            setEditingData(record);
                            setModalVisible(true);
                        }} 
                    />
                    <Popconfirm
                        title="Hapus Produk?"
                        description="Apakah Anda yakin ingin menghapus data ini?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Ya"
                        cancelText="Tidak"
                    >
                        <Button type="text" danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div className="page-container">
            <div className="page-header">
                <Title level={4} className="margin-0">Data Produk</Title>
                <Button 
                    type="primary" 
                    icon={<PlusOutlined />} 
                    onClick={() => {
                        setEditingData(null);
                        setModalVisible(true);
                    }}
                >
                    Tambah
                </Button>
            </div>
            
            <Table 
                columns={columns} 
                dataSource={data} 
                rowKey="id" 
                loading={loading}
                pagination={{ defaultPageSize: 10 }}
            />

            <ProductModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onSuccess={() => {
                    setModalVisible(false);
                    message.success('Data berhasil disimpan');
                    fetchData();
                }}
                editingData={editingData}
            />
        </div>
    );
};

export default ProductList;
