import React, { useState, useEffect } from 'react';
import { Table, Button, Space, message, Typography, Popconfirm, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '../../api/axiosConfig';
import WarehouseModal from '../../components/modals/inventory/WarehouseModal';
import { DataTable, TableActions } from '../../components/common';



const WarehouseList = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingData, setEditingData] = useState(null);
    const [searchText, setSearchText] = useState("");

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
                <TableActions 
                    onEdit={() => {
                        setEditingData(record);
                        setModalVisible(true);
                    }}
                    editPermission="inventory.warehouse.update"
                    onDelete={() => handleDelete(record.id)}
                    deletePermission="inventory.warehouse.delete"
                />
            ),
        },
    ];

    return (
        <div className="page-container">
            <DataTable
                title="Data Gudang"
                addText="Tambah"
                onAdd={() => {
                    setEditingData(null);
                    setModalVisible(true);
                }}
                addPermission="inventory.warehouse.create"
                searchText={searchText}
                setSearchText={setSearchText}
                searchPlaceholder="Cari nama gudang, kode, lokasi..."
                columns={columns}
                dataSource={data}
                loading={loading}
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
