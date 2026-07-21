import React, { useState, useEffect } from 'react';
import { Table, Button, Card, Typography, Tag, message } from 'antd';
import { SafetyCertificateOutlined } from '@ant-design/icons';
import api from '../../api/axiosConfig';
import Can from '../../components/Can';
import UserPermissionModal from '../../components/modals/settings/UserPermissionModal';

const { Title } = Typography;

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  
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
      sorter: (a, b) => a.username.localeCompare(b.username),
    },
    {
      title: 'Nama Lengkap',
      key: 'full_name',
      render: (_, record) => `${record.first_name} ${record.last_name}`,
      sorter: (a, b) => `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`),
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
      sorter: (a, b) => (a.role_name || '').localeCompare(b.role_name || ''),
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
        <Can access="settings.manage_users">
          <Button 
            type="primary" 
            icon={<SafetyCertificateOutlined />} 
            onClick={() => handleEditPermissions(record)}
          >
            Edit Akses
          </Button>
        </Can>
      ),
    },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <Title level={2}>Manajemen Pengguna & Hak Akses</Title>
        <p>Atur izin spesifik (User-Level Permissions) untuk masing-masing pengguna di sistem.</p>
      </div>

      <Card>
        <Table 
          columns={columns} 
          dataSource={users} 
          rowKey="id" 
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

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
