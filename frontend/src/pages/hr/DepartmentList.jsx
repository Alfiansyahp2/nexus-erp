import React, { useEffect, useState } from 'react';
import { Table, Button, Card, Typography, message, Space, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '../../api/axiosConfig';
import DepartmentModal from '../../components/modals/hr/DepartmentModal';
import Can from '../../components/Can';

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
            dataIndex: 'name', sorter: (a, b) => { const vA = a['name'] ?? ''; const vB = b['name'] ?? ''; if (typeof vA === 'number' && typeof vB === 'number') return vA - vB; return String(vA).localeCompare(String(vB)); },
            key: 'name',
        },
        {
            title: 'Description',
            dataIndex: 'description', sorter: (a, b) => { const vA = a['description'] ?? ''; const vB = b['description'] ?? ''; if (typeof vA === 'number' && typeof vB === 'number') return vA - vB; return String(vA).localeCompare(String(vB)); },
            key: 'description',
        },
        {
            title: 'Action',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Can access="hr.department.update">
                        <Button 
                            type="primary" 
                            icon={<EditOutlined />} 
                            onClick={() => openModal(record)} 
                        />
                    </Can>
                    <Can access="hr.department.delete">
                        <Popconfirm 
                            title="Are you sure to delete this department?" 
                            onConfirm={() => handleDelete(record.id)}
                        >
                            <Button type="primary" danger icon={<DeleteOutlined />} />
                        </Popconfirm>
                    </Can>
                </Space>
            ),
        },
    ];

    return (
        <Card>
            <div className="page-header">
                <Title level={4} className="margin-0">Department Master</Title>
                <Can access="hr.department.create">
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>
                        Add Department
                    </Button>
                </Can>
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
