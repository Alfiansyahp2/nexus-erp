import { useState, useEffect } from 'react';
import { Table, Button, message, Tag } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import axios from 'axios';
import AccountModal from '../../components/modals/finance/AccountModal';

const ChartOfAccounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:8000/api/finance/accounts/', {
        headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
      });
      setAccounts(response.data);
    } catch (error) {
      message.error('Gagal mengambil data akun buku besar');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleModalSuccess = () => {
    setIsModalVisible(false);
    fetchAccounts();
  };

  const columns = [
    { title: 'Kode Akun', dataIndex: 'account_code', key: 'account_code' },
    { title: 'Nama Akun', dataIndex: 'name', key: 'name' },
    { 
      title: 'Tipe', 
      dataIndex: 'account_type', 
      key: 'account_type',
      render: (type) => {
        const colorMap = {
          ASSET: 'blue',
          LIABILITY: 'red',
          EQUITY: 'purple',
          REVENUE: 'green',
          EXPENSE: 'orange'
        };
        return <Tag color={colorMap[type]}>{type}</Tag>;
      }
    },
    { title: 'Status', dataIndex: 'is_active', key: 'is_active', render: (active) => active ? 'Aktif' : 'Non-Aktif' },
  ];

  return (
    <div style={{ padding: '24px', background: '#fff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2>Chart of Accounts (Bagan Akun)</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalVisible(true)}>
          Tambah Akun
        </Button>
      </div>

      <Table 
        columns={columns} 
        dataSource={accounts} 
        rowKey="id" 
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      <AccountModal 
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
};

export default ChartOfAccounts;
