import { useState, useEffect } from 'react';
import { Table, Button, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import axios from 'axios';
import JournalModal from '../../components/modals/JournalModal';

const JournalEntries = () => {
  const [journals, setJournals] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);

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
    { title: 'Tanggal', dataIndex: 'date', key: 'date' },
    { title: 'No. Referensi', dataIndex: 'reference_number', key: 'reference_number' },
    { title: 'Deskripsi', dataIndex: 'description', key: 'description' },
    { 
      title: 'Total Transaksi', 
      key: 'total',
      render: (_, record) => {
        const totalDebit = record.items.reduce((acc, item) => acc + parseFloat(item.debit), 0);
        return `Rp ${totalDebit.toLocaleString('id-ID')}`;
      }
    }
  ];

  return (
    <div style={{ padding: '24px', background: '#fff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
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
        expandable={{
          expandedRowRender: record => (
            <Table 
              dataSource={record.items} 
              rowKey="id" 
              pagination={false}
              size="small"
              columns={[
                { title: 'Akun', dataIndex: 'account', render: accId => accounts.find(a => a.id === accId)?.name },
                { title: 'Keterangan', dataIndex: 'description' },
                { title: 'Debit', dataIndex: 'debit', render: val => `Rp ${parseFloat(val).toLocaleString('id-ID')}` },
                { title: 'Kredit', dataIndex: 'credit', render: val => `Rp ${parseFloat(val).toLocaleString('id-ID')}` },
              ]}
            />
          )
        }}
      />

      <JournalModal 
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onSuccess={handleModalSuccess}
        accounts={accounts}
      />
    </div>
  );
};

export default JournalEntries;
