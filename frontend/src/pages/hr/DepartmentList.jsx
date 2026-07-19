import React, { useEffect, useState } from 'react';
import { Table, Button, Card, Typography, message, Space, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '../../api/axiosConfig';
import DepartmentModal from '../../components/modals/hr/DepartmentModal';

const { Title } = Typography;

const DepartmentList = () => {
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingData, setEditingData] = useState(null);

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
                <Space size="middle">
                    <Button 
                        type="primary" 
                        icon={<EditOutlined />} 
                        onClick={() => openModal(record)} 
                    />
                    <Popconfirm 
                        title="Are you sure to delete this department?" 
                        onConfirm={() => handleDelete(record.id)}
                    >
                        <Button type="primary" danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <Title level={4} style={{ margin: 0 }}>Department Master</Title>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>
                    Add Department
                </Button>
            </div>
            <Table
                columns={columns}
                dataSource={departments}
                rowKey="id"
                loading={loading}
                pagination={{ pageSize: 10 }}
            />

            <DepartmentModal 
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                onSuccess={handleModalSuccess}
                editingData={editingData}
            />
        </Card>
    );
};

export default DepartmentList;
