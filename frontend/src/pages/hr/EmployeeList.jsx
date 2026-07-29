import React, { useEffect, useState } from 'react';
import { message } from 'antd';
import api from '../../api/axiosConfig';
import { DataTable, TableActions } from '../../components/common';
import EmployeeModal from '../../components/modals/hr/EmployeeModal';

const EmployeeList = () => {
    const [employees, setEmployees] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [positions, setPositions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingRecord, setEditingRecord] = useState(null);
    const [searchText, setSearchText] = useState("");

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
                <TableActions 
                    onEdit={() => openModal(record)}
                    editPermission="hr.employee.update"
                    onDelete={() => handleDelete(record)}
                    deletePermission="hr.employee.delete"
                />
            ),
        }
    ];

    return (
        <>
            <DataTable
                title="Employee Management"
                addText="Add Employee"
                onAdd={() => openModal()}
                addPermission="hr.employee.create"
                searchText={searchText}
                setSearchText={setSearchText}
                searchPlaceholder="Cari nama karyawan, email, NIK, jabatan..."
                columns={columns}
                dataSource={employees}
                loading={loading}
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
        </>
    );
};

export default EmployeeList;
