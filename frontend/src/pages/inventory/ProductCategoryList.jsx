import React, { useState, useEffect } from 'react';
import { Table, Button, Space, message, Typography, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '../../api/axiosConfig';
import CategoryModal from '../../components/modals/inventory/CategoryModal';

const { Title } = Typography;

const ProductCategoryList = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingData, setEditingData] = useState(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await api.get('/inventory/categories/');
            setData(response.data);
        } catch (error) {
            message.error('Gagal mengambil data kategori produk');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleDelete = async (id) => {
        try {
            await api.delete(`/inventory/categories/${id}/`);
            message.success('Data berhasil dihapus');
            fetchData();
        } catch (error) {
            message.error('Gagal menghapus data');
        }
    };

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 80,
        },
        {
            title: 'Nama Kategori',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Deskripsi',
            dataIndex: 'description',
            key: 'description',
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
                        title="Hapus Kategori?"
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
                <Title level={4} className="margin-0">Kategori Produk</Title>
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

            <CategoryModal
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

export default ProductCategoryList;
