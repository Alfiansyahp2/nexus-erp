import { useState, useEffect } from 'react';
import { Table, Button, Space, message, Tag } from 'antd';
import { PlusOutlined, EyeOutlined } from '@ant-design/icons';
import axios from 'axios';
import JournalModal from '../../components/modals/finance/JournalModal';
import JournalDetailModal from '../../components/modals/finance/JournalDetailModal';

const JournalEntries = () => {
  const [journals, setJournals] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [detailData, setDetailData] = useState(null);

  const fetchJournals = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:8000/api/finance/journals/', {
        headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
      });
      setJournals(response.data);
    } catch (error) {
      message.error('Gagal mengambil data jurnal');
    } finally {
      setLoading(false);
    }
  };

  const fetchAccounts = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/finance/accounts/', {
        headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
      });
      setAccounts(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchJournals();
    fetchAccounts();
  }, []);

  const handleModalSuccess = () => {
    setIsModalVisible(false);
    fetchJournals();
  };

  const columns = [
    { title: 'Tanggal', dataIndex: 'date', sorter: (a, b) => { const vA = a['date'] ?? ''; const vB = b['date'] ?? ''; if (typeof vA === 'number' && typeof vB === 'number') return vA - vB; return String(vA).localeCompare(String(vB)); }, key: 'date' },
    { title: 'No. Referensi', dataIndex: 'reference_number', sorter: (a, b) => { const vA = a['reference_number'] ?? ''; const vB = b['reference_number'] ?? ''; if (typeof vA === 'number' && typeof vB === 'number') return vA - vB; return String(vA).localeCompare(String(vB)); }, key: 'reference_number' },
    { 
      title: 'Status', 
      dataIndex: 'status', sorter: (a, b) => { const vA = a['status'] ?? ''; const vB = b['status'] ?? ''; if (typeof vA === 'number' && typeof vB === 'number') return vA - vB; return String(vA).localeCompare(String(vB)); }, 
      key: 'status',
      render: (status) => (
        <Tag color={status === 'POSTED' ? 'green' : 'orange'}>
          {status || 'DRAFT'}
        </Tag>
      )
    },
    { title: 'Deskripsi', dataIndex: 'description', sorter: (a, b) => { const vA = a['description'] ?? ''; const vB = b['description'] ?? ''; if (typeof vA === 'number' && typeof vB === 'number') return vA - vB; return String(vA).localeCompare(String(vB)); }, key: 'description' },
    { 
      title: 'Total Transaksi', 
      key: 'total',
      render: (_, record) => {
        const totalDebit = record.items.reduce((acc, item) => acc + parseFloat(item.debit), 0);
        return `Rp ${totalDebit.toLocaleString('id-ID')}`;
      }
    },
    {
      title: 'Aksi',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="text" 
            icon={<EyeOutlined className="icon-primary" />} 
            onClick={() => {
              setDetailData(record);
              setDetailModalVisible(true);
            }} 
          />
        </Space>
      ),
    }
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Journal Entries (Jurnal Umum)</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalVisible(true)}>
          Buat Jurnal Baru
        </Button>
      </div>

      <Table 
        columns={columns} 
        dataSource={journals} 
        rowKey="id" 
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      <JournalModal 
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onSuccess={handleModalSuccess}
        accounts={accounts}
      />

      <JournalDetailModal
        visible={detailModalVisible}
        onClose={() => setDetailModalVisible(false)}
        data={detailData}
        accounts={accounts}
      />
    </div>
  );
};

export default JournalEntries;
