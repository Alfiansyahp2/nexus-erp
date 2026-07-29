import React, { useState, useEffect } from 'react';
import { Table, Button, Space, message, Typography, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '../../api/axiosConfig';
import CategoryModal from '../../components/modals/inventory/CategoryModal';
import { DataTable, TableActions } from '../../components/common';



const ProductCategoryList = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingData, setEditingData] = useState(null);
    const [searchText, setSearchText] = useState("");

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
                <TableActions 
                    onEdit={() => {
                        setEditingData(record);
                        setModalVisible(true);
                    }}
                    editPermission="inventory.category.update"
                    onDelete={() => handleDelete(record.id)}
                    deletePermission="inventory.category.delete"
                />
            ),
        },
    ];

    return (
        <div className="page-container">
            <DataTable
                title="Kategori Produk"
                addText="Tambah"
                onAdd={() => {
                    setEditingData(null);
                    setModalVisible(true);
                }}
                addPermission="inventory.category.create"
                searchText={searchText}
                setSearchText={setSearchText}
                searchPlaceholder="Cari nama kategori, deskripsi..."
                columns={columns}
                dataSource={data}
                loading={loading}
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
