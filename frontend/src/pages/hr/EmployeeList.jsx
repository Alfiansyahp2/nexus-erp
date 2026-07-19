import React, { useEffect, useState } from 'react';
import { Table, Button, Card, Typography, message, Space, Popconfirm, Select } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '../../api/axiosConfig';
import EmployeeModal from '../../components/modals/hr/EmployeeModal';

const { Title } = Typography;
const { Option } = Select;

const EmployeeList = () => {
    const [employees, setEmployees] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [positions, setPositions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingRecord, setEditingRecord] = useState(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [empRes, deptRes, posRes] = await Promise.all([
                api.get('hr/employees/'),
                api.get('hr/departments/'),
                api.get('hr/positions/')
            ]);
            setEmployees(empRes.data);
            setDepartments(deptRes.data);
            setPositions(posRes.data);
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

    const handleDelete = async (record) => {
        try {
            // Delete employee profile, the user is generally kept or deleted via cascade
            // But we will delete the User directly to wipe both if CASCADE is set.
            await api.delete(`hr/users/${record.user.id}/`);
            message.success('Employee deleted successfully');
            fetchData();
        } catch (error) {
            message.error('Failed to delete employee');
        }
    };

    const openModal = (record = null) => {
        setEditingRecord(record);
        setIsModalVisible(true);
    };

    const columns = [
        {
            title: 'NIP',
            dataIndex: 'employee_id',
            key: 'employee_id',
        },
        {
            title: 'Full Name',
            dataIndex: 'full_name',
            key: 'full_name',
        },
        {
            title: 'Department',
            dataIndex: 'department_name',
            key: 'department_name',
        },
        {
            title: 'Position',
            dataIndex: 'position_name',
            key: 'position_name',
        },
        {
            title: 'Status',
            dataIndex: 'employment_status',
            key: 'employment_status',
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
                        title="Are you sure to delete this employee?" 
                        onConfirm={() => handleDelete(record)}
                    >
                        <Button type="primary" danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                </Space>
            ),
        }
    ];

    return (
        <Card>
            <div className="page-header">
                <Title level={4} className="margin-0">Employee Management</Title>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>
                    Add Employee
                </Button>
            </div>
            <Table
                columns={columns}
                dataSource={employees}
                rowKey="id"
                loading={loading}
                pagination={{ pageSize: 10 }}
                scroll={{ x: 'max-content' }}
            />

            <EmployeeModal 
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                onSuccess={handleModalSuccess}
                editingRecord={editingRecord}
                departments={departments}
                positions={positions}
            />
        </Card>
    );
};

export default EmployeeList;
