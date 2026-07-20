import React, { useEffect, useState } from 'react';
import { Table, Button, Card, Typography, message, Space, Popconfirm, Select } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '../../api/axiosConfig';
import PositionModal from '../../components/modals/hr/PositionModal';
import Can from '../../components/Can';

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
            dataIndex: 'name', sorter: (a, b) => { const vA = a['name'] ?? ''; const vB = b['name'] ?? ''; if (typeof vA === 'number' && typeof vB === 'number') return vA - vB; return String(vA).localeCompare(String(vB)); },
            key: 'name',
        },
        {
            title: 'Department',
            dataIndex: 'department_name', sorter: (a, b) => { const vA = a['department_name'] ?? ''; const vB = b['department_name'] ?? ''; if (typeof vA === 'number' && typeof vB === 'number') return vA - vB; return String(vA).localeCompare(String(vB)); },
            key: 'department_name',
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
                    <Can access="hr.position.update">
                        <Button 
                            type="primary" 
                            icon={<EditOutlined />} 
                            onClick={() => openModal(record)} 
                        />
                    </Can>
                    <Can access="hr.position.delete">
                        <Popconfirm 
                            title="Are you sure to delete this position?" 
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
                <Title level={4} className="margin-0">Position Master</Title>
                <Can access="hr.position.create">
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>
                        Add Position
                    </Button>
                </Can>
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
