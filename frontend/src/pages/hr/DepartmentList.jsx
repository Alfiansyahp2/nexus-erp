import React, { useEffect, useState } from 'react';
import { message } from 'antd';
import api from '../../api/axiosConfig';
import DepartmentModal from '../../components/modals/hr/DepartmentModal';
import { DataTable, TableActions } from '../../components/common';



const DepartmentList = () => {
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingData, setEditingData] = useState(null);
    const [searchText, setSearchText] = useState("");

    const fetchDepartments = async () => {
        setLoading(true);
        try {
            const response = await api.get('hr/departments/');
            setDepartments(response.data);
        } catch (error) {
            message.error('Failed to fetch departments');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDepartments();
    }, []);

    const handleModalSuccess = () => {
        setIsModalVisible(false);
        fetchDepartments();
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`hr/departments/${id}/`);
            message.success('Department deleted successfully');
            fetchDepartments();
        } catch (error) {
            message.error('Failed to delete department');
        }
    };

    const openModal = (record = null) => {
        setEditingData(record);
        setIsModalVisible(true);
    };

    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
        },
        {
            title: 'Action',
            key: 'action',
            render: (_, record) => (
                <TableActions 
                    onEdit={() => openModal(record)}
                    editPermission="hr.department.update"
                    onDelete={() => handleDelete(record.id)}
                    deletePermission="hr.department.delete"
                />
            ),
        },
    ];

    return (
        <>
            <DataTable
                title="Department Master"
                addText="Add Department"
                onAdd={() => openModal()}
                addPermission="hr.department.create"
                searchText={searchText}
                setSearchText={setSearchText}
                searchPlaceholder="Cari nama departemen, deskripsi..."
                columns={columns}
                dataSource={departments}
                rowKey="id"
                loading={loading}
            />

            <DepartmentModal 
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                onSuccess={handleModalSuccess}
                editingData={editingData}
            />
        </>
    );
};

export default DepartmentList;
