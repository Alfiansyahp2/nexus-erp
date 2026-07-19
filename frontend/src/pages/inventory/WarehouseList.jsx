import React, { useState, useEffect } from 'react';
import { Table, Button, Space, message, Typography, Popconfirm, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '../../api/axiosConfig';
import WarehouseModal from '../../components/modals/inventory/WarehouseModal';

const { Title } = Typography;

const WarehouseList = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingData, setEditingData] = useState(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await api.get('/inventory/warehouses/');
            setData(response.data);
        } catch (error) {
            message.error('Gagal mengambil data gudang');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleDelete = async (id) => {
        try {
            await api.delete(`/inventory/warehouses/${id}/`);
            message.success('Data berhasil dihapus');
            fetchData();
        } catch (error) {
            message.error('Gagal menghapus data');
        }
    };

    const columns = [
        {
            title: 'Kode',
            dataIndex: 'code',
            key: 'code',
            width: 100,
        },
        {
            title: 'Nama Gudang',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Lokasi',
            dataIndex: 'location',
            key: 'location',
        },
        {
            title: 'Status',
            dataIndex: 'is_active',
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
                        title="Hapus Gudang?"
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
                <Title level={4} className="margin-0">Data Gudang</Title>
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

            <WarehouseModal
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

export default WarehouseList;
