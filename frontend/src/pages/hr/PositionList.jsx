import React, { useEffect, useState } from 'react';
import { message } from 'antd';
import api from '../../api/axiosConfig';
import PositionModal from '../../components/modals/hr/PositionModal';
import { DataTable, TableActions } from '../../components/common';




const PositionList = () => {
    const [positions, setPositions] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingData, setEditingData] = useState(null);
    const [searchText, setSearchText] = useState("");

    const fetchData = async () => {
        setLoading(true);
        try {
            const [posRes, deptRes] = await Promise.all([
                api.get('hr/positions/'),
                api.get('hr/departments/')
            ]);
            setPositions(posRes.data);
            setDepartments(deptRes.data);
        } catch (error) {
            message.error('Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleModalSuccess = () => {
        setIsModalVisible(false);
        fetchData();
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`hr/positions/${id}/`);
            message.success('Position deleted successfully');
            fetchData();
        } catch (error) {
            message.error('Failed to delete position');
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
            title: 'Department',
            dataIndex: 'department_name',
            key: 'department_name',
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
                    editPermission="hr.position.update"
                    onDelete={() => handleDelete(record.id)}
                    deletePermission="hr.position.delete"
                />
            ),
        },
    ];

    return (
        <>
            <DataTable
                title="Position Master"
                addText="Add Position"
                onAdd={() => openModal()}
                addPermission="hr.position.create"
                searchText={searchText}
                setSearchText={setSearchText}
                searchPlaceholder="Cari posisi, departemen..."
                columns={columns}
                dataSource={positions}
                rowKey="id"
                loading={loading}
            />

            <PositionModal 
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                onSuccess={handleModalSuccess}
                editingData={editingData}
                departments={departments}
            />
        </>
    );
};

export default PositionList;
