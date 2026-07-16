import React, { useEffect, useState } from 'react';
import { Table, Button, Card, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import api from '../api/axiosConfig';

const { Title } = Typography;

const EmployeeList = () => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchEmployees = async () => {
        setLoading(true);
        try {
            const response = await api.get('hr/employees/');
            setEmployees(response.data);
        } catch (error) {
            console.error('Failed to fetch employees', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

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
    ];

    return (
        <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <Title level={4} style={{ margin: 0 }}>Employee Management</Title>
                <Button type="primary" icon={<PlusOutlined />}>
                    Add Employee
                </Button>
            </div>
            <Table
                columns={columns}
                dataSource={employees}
                rowKey="id"
                loading={loading}
                pagination={{ pageSize: 10 }}
            />
        </Card>
    );
};

export default EmployeeList;
