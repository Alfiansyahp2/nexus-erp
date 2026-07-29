import React, { useState, useEffect } from 'react';
import { Typography, Tag, message } from 'antd';
import api from '../../api/axiosConfig';
import UserPermissionModal from '../../components/modals/settings/UserPermissionModal';
import { DataTable, TableActions } from '../../components/common';



const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  
  // States for Phase 4 Modal
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get('rbac/users/');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      message.error('Gagal mengambil data pengguna');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleEditPermissions = (user) => {
    setSelectedUser(user);
    setIsModalVisible(true);
  };

  const columns = [
    {
      title: 'Username',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: 'Nama Lengkap',
      key: 'full_name',
      render: (_, record) => `${record.first_name} ${record.last_name}`,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Jabatan (Role / Template)',
      dataIndex: 'role_name',
      key: 'role_name',
      render: (role) => (
        <Tag color={role === 'Super Admin' ? 'red' : 'blue'}>
          {role || 'Custom / No Role'}
        </Tag>
      ),
    },
    {
      title: 'Total Izin',
      key: 'permissions_count',
      render: (_, record) => (
        <Tag color="green">{record.permissions ? record.permissions.length : 0} Izin</Tag>
      ),
    },
    {
      title: 'Aksi',
      key: 'action',
      render: (_, record) => (
        <TableActions 
          onEdit={() => handleEditPermissions(record)}
          editPermission="settings.manage_users"
        />
      ),
    },
  ];

  return (
    <div className="page-container">
      <DataTable
        title="Manajemen Pengguna & Hak Akses"
        description="Atur izin spesifik (User-Level Permissions) untuk masing-masing pengguna di sistem."
        searchText={searchText}
        setSearchText={setSearchText}
        searchPlaceholder="Cari nama pengguna, email, role..."
        columns={columns}
        dataSource={users}
        rowKey="id"
        loading={loading}
      />

      <UserPermissionModal 
        visible={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setSelectedUser(null);
        }}
        onSuccess={() => {
          setIsModalVisible(false);
          setSelectedUser(null);
          fetchUsers();
        }}
        user={selectedUser}
      />
    </div>
  );
};

export default UserManagement;
