import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, message, Tag, Space } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Option } = Select;

const ChartOfAccounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

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

  const handleAddAccount = async (values) => {
    try {
      await axios.post('http://localhost:8000/api/finance/accounts/', values, {
        headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
      });
      message.success('Akun berhasil ditambahkan');
      setIsModalVisible(false);
      form.resetFields();
      fetchAccounts();
    } catch (error) {
      message.error('Gagal menambahkan akun');
    }
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

      <Modal
        title="Tambah Akun Baru"
        visible={isModalVisible}
        onCancel={() => { setIsModalVisible(false); form.resetFields(); }}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleAddAccount}>
          <Form.Item name="account_code" label="Kode Akun" rules={[{ required: true }]}>
            <Input placeholder="Contoh: 1100" />
          </Form.Item>
          <Form.Item name="name" label="Nama Akun" rules={[{ required: true }]}>
            <Input placeholder="Contoh: Kas Kecil" />
          </Form.Item>
          <Form.Item name="account_type" label="Tipe Akun" rules={[{ required: true }]}>
            <Select placeholder="Pilih Tipe">
              <Option value="ASSET">Asset (Aset)</Option>
              <Option value="LIABILITY">Liability (Kewajiban/Hutang)</Option>
              <Option value="EQUITY">Equity (Modal)</Option>
              <Option value="REVENUE">Revenue (Pendapatan)</Option>
              <Option value="EXPENSE">Expense (Beban/Biaya)</Option>
            </Select>
          </Form.Item>
          <Form.Item name="description" label="Deskripsi">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">Simpan</Button>
              <Button onClick={() => setIsModalVisible(false)}>Batal</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ChartOfAccounts;
