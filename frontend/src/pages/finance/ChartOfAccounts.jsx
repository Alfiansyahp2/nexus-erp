import { useState, useEffect } from 'react';
import { Table, Button, message, Tag } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import axios from 'axios';
import AccountModal from '../../components/modals/finance/AccountModal';
import Can from '../../components/Can';
import TableSearch, { filterTableData } from '../../components/TableSearch';

const ChartOfAccounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchText, setSearchText] = useState("");

  const filteredAccounts = filterTableData(accounts, searchText);

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
    { title: 'Kode Akun', dataIndex: 'account_code', sorter: (a, b) => { const vA = a['account_code'] ?? ''; const vB = b['account_code'] ?? ''; if (typeof vA === 'number' && typeof vB === 'number') return vA - vB; return String(vA).localeCompare(String(vB)); }, key: 'account_code' },
    { title: 'Nama Akun', dataIndex: 'name', sorter: (a, b) => { const vA = a['name'] ?? ''; const vB = b['name'] ?? ''; if (typeof vA === 'number' && typeof vB === 'number') return vA - vB; return String(vA).localeCompare(String(vB)); }, key: 'name' },
    { 
      title: 'Tipe', 
      dataIndex: 'account_type', sorter: (a, b) => { const vA = a['account_type'] ?? ''; const vB = b['account_type'] ?? ''; if (typeof vA === 'number' && typeof vB === 'number') return vA - vB; return String(vA).localeCompare(String(vB)); }, 
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
    { title: 'Status', dataIndex: 'is_active', sorter: (a, b) => { const vA = a['is_active'] ?? ''; const vB = b['is_active'] ?? ''; if (typeof vA === 'number' && typeof vB === 'number') return vA - vB; return String(vA).localeCompare(String(vB)); }, key: 'is_active', render: (active) => active ? 'Aktif' : 'Non-Aktif' },
  ];

  return (
    <div className="page-container">
      <div className="table-toolbar">
        <h2 style={{ margin: 0 }}>Chart of Accounts (Bagan Akun)</h2>
        <div className="table-toolbar-actions">
          <Can access="finance.account.create">
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalVisible(true)}>
              Tambah Akun
            </Button>
          </Can>
        </div>
      </div>

      <div className="table-search-row">
        <TableSearch value={searchText} onChange={(e) => setSearchText(e.target.value)} placeholder="Cari kode atau nama akun..." />
      </div>

      <Table 
        columns={columns} 
        dataSource={filteredAccounts} 
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
