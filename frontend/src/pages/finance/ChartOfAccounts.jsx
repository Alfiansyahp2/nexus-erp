import { useState, useEffect } from 'react';
import { message, Tag } from 'antd';
import axios from 'axios';
import AccountModal from '../../components/modals/finance/AccountModal';
import { DataTable, TableActions } from '../../components/common';

const ChartOfAccounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchText, setSearchText] = useState("");

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
    <div className="page-container">
      <DataTable
        title="Chart of Accounts (Bagan Akun)"
        addText="Tambah Akun"
        onAdd={() => setIsModalVisible(true)}
        addPermission="finance.account.create"
        searchText={searchText}
        setSearchText={setSearchText}
        searchPlaceholder="Cari kode atau nama akun..."
        columns={columns}
        dataSource={accounts}
        loading={loading}
        scroll={{ x: 'max-content' }}
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
