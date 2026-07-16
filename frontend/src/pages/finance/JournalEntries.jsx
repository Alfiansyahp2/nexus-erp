import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, DatePicker, Select, message, Space, Card, InputNumber } from 'antd';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Option } = Select;

const JournalEntries = () => {
  const [journals, setJournals] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

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

  const handleAddJournal = async (values) => {
    try {
      // Format date to YYYY-MM-DD
      values.date = values.date.format('YYYY-MM-DD');
      
      await axios.post('http://localhost:8000/api/finance/journals/', values, {
        headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
      });
      message.success('Jurnal berhasil ditambahkan');
      setIsModalVisible(false);
      form.resetFields();
      fetchJournals();
    } catch (error) {
      if (error.response && error.response.data) {
        // Show validation error from backend (e.g. Debit != Credit)
        const errMsg = error.response.data.non_field_errors || error.response.data.detail || 'Gagal menambahkan jurnal';
        message.error(errMsg);
      } else {
        message.error('Terjadi kesalahan server');
      }
    }
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

      <Modal
        title="Buat Jurnal Transaksi"
        visible={isModalVisible}
        onCancel={() => { setIsModalVisible(false); form.resetFields(); }}
        footer={null}
        width={800}
      >
        <Form form={form} layout="vertical" onFinish={handleAddJournal}>
          <div style={{ display: 'flex', gap: '16px' }}>
            <Form.Item name="date" label="Tanggal Transaksi" rules={[{ required: true }]} style={{ flex: 1 }}>
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="reference_number" label="No. Referensi" rules={[{ required: true }]} style={{ flex: 1 }}>
              <Input placeholder="Contoh: INV-001" />
            </Form.Item>
          </div>
          
          <Form.Item name="description" label="Deskripsi/Keterangan Jurnal" rules={[{ required: true }]}>
            <Input.TextArea rows={2} />
          </Form.Item>

          <Card size="small" title="Baris Jurnal (Debit & Kredit)" style={{ marginBottom: '16px' }}>
            <Form.List name="items" initialValue={[{}]}>
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                      <Form.Item
                        {...restField}
                        name={[name, 'account']}
                        rules={[{ required: true, message: 'Pilih akun' }]}
                        style={{ width: '250px' }}
                      >
                        <Select
                          showSearch
                          placeholder="Pilih Akun Buku Besar"
                          optionFilterProp="children"
                        >
                          {accounts.map(acc => (
                            <Option key={acc.id} value={acc.id}>{acc.account_code} - {acc.name}</Option>
                          ))}
                        </Select>
                      </Form.Item>
                      
                      <Form.Item
                        {...restField}
                        name={[name, 'debit']}
                        initialValue={0}
                        style={{ width: '150px' }}
                      >
                        <InputNumber placeholder="Debit" style={{ width: '100%' }} min={0} />
                      </Form.Item>

                      <Form.Item
                        {...restField}
                        name={[name, 'credit']}
                        initialValue={0}
                        style={{ width: '150px' }}
                      >
                        <InputNumber placeholder="Kredit" style={{ width: '100%' }} min={0} />
                      </Form.Item>

                      <MinusCircleOutlined onClick={() => remove(name)} style={{ color: 'red' }} />
                    </Space>
                  ))}
                  <Form.Item>
                    <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                      Tambah Baris Transaksi
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>
          </Card>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">Simpan & Posting Jurnal</Button>
              <Button onClick={() => setIsModalVisible(false)}>Batal</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default JournalEntries;
