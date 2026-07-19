import React, { useEffect, useState } from 'react';
import { Table, Button, Card, Typography, message, Space, Popconfirm, Select } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '../../api/axiosConfig';
import PositionModal from '../../components/modals/PositionModal';

const { Title } = Typography;
const { Option } = Select;

const PositionList = () => {
    const [positions, setPositions] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingData, setEditingData] = useState(null);

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
                <Space size="middle">
                    <Button 
                        type="primary" 
                        icon={<EditOutlined />} 
                        onClick={() => openModal(record)} 
                    />
                    <Popconfirm 
                        title="Are you sure to delete this position?" 
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
                <Title level={4} style={{ margin: 0 }}>Position Master</Title>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>
                    Add Position
                </Button>
            </div>
            <Table
                columns={columns}
                dataSource={positions}
                rowKey="id"
                loading={loading}
                pagination={{ pageSize: 10 }}
            />

            <PositionModal 
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                onSuccess={handleModalSuccess}
                editingData={editingData}
                departments={departments}
            />
        </Card>
    );
};

export default PositionList;
