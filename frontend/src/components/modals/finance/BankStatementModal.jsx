import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, DatePicker, Button, Space, message, InputNumber, Divider, Table } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '../../../api/axiosConfig';

const { Option } = Select;

const BankStatementModal = ({ visible, onClose, onSuccess }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [accounts, setAccounts] = useState([]);
    const [lines, setLines] = useState([]);

    useEffect(() => {
        if (visible) {
            fetchAccounts();
            form.resetFields();
            setLines([]);
        }
    }, [visible, form]);

    const fetchAccounts = async () => {
        try {
            const res = await api.get('finance/accounts/');
            setAccounts(res.data.filter(acc => acc.account_type === 'ASSET'));
        } catch (error) {
            console.error('Failed to fetch accounts', error);
        }
    };

    const handleAddLine = () => {
        setLines([...lines, { id: Date.now(), date: null, description: '', amount: 0 }]);
    };

    const handleRemoveLine = (id) => {
        setLines(lines.filter(line => line.id !== id));
    };

    const handleLineChange = (id, field, value) => {
        setLines(lines.map(line => {
            if (line.id === id) {
                return { ...line, [field]: value };
            }
            return line;
        }));
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            
            // Validate lines
            if (lines.length === 0) {
                message.error('Harap masukkan minimal satu baris mutasi rekening.');
                return;
            }
            for (let line of lines) {
                if (!line.date || !line.description || line.amount === 0) {
                    message.error('Pastikan semua mutasi memiliki Tanggal, Deskripsi, dan Nominal yang valid (tidak 0).');
                    return;
                }
            }

            setLoading(true);
            const payload = {
                ...values,
                date_start: values.date_start.format('YYYY-MM-DD'),
                date_end: values.date_end.format('YYYY-MM-DD'),
                lines: lines.map(l => ({
                    date: l.date.format('YYYY-MM-DD'),
                    description: l.description,
                    amount: l.amount
                }))
            };

            await api.post('finance/bank-statements/', payload);
            message.success('Rekening Koran berhasil diimpor');
            onSuccess();
        } catch (error) {
            console.error(error);
            message.error('Terjadi kesalahan saat mengimpor Rekening Koran');
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        {
            title: 'Tanggal Mutasi',
            dataIndex: 'date',
            render: (_, record) => (
                <DatePicker 
                    format="YYYY-MM-DD"
                    value={record.date} 
                    onChange={(val) => handleLineChange(record.id, 'date', val)}
                />
            )
        },
        {
            title: 'Deskripsi Transaksi',
            dataIndex: 'description',
            render: (_, record) => (
                <Input 
                    value={record.description} 
                    onChange={(e) => handleLineChange(record.id, 'description', e.target.value)}
                    placeholder="Contoh: Trf dari PT XYZ"
                />
            )
        },
        {
            title: 'Nominal (+ Masuk / - Keluar)',
            dataIndex: 'amount',
            render: (_, record) => (
                <InputNumber
                    style={{ width: '100%' }}
                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={value => value.replace(/\$\s?|(,*)/g, '')}
                    value={record.amount}
                    onChange={(val) => handleLineChange(record.id, 'amount', val)}
                />
            )
        },
        {
            title: '',
            key: 'action',
            width: 50,
            render: (_, record) => (
                <Button type="text" danger icon={<DeleteOutlined />} onClick={() => handleRemoveLine(record.id)} />
            )
        }
    ];

    return (
        <Modal
            title="Import Rekening Koran / Bank Statement"
            open={visible}
            onCancel={onClose}
            width={800}
            centered
            styles={{ body: { maxHeight: 'calc(100vh - 200px)', overflowY: 'auto', overflowX: 'hidden' } }}
            footer={[
                <Button key="back" onClick={onClose}>Batal</Button>,
                <Button key="submit" type="primary" loading={loading} onClick={handleSubmit}>
                    Simpan Rekening Koran
                </Button>
            ]}
        >
            <Form form={form} layout="vertical">
                <Space style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                    <Form.Item name="statement_number" label="No. Statement / Bulan" rules={[{ required: true, message: 'Wajib diisi' }]} style={{ width: 250 }}>
                        <Input placeholder="Contoh: BCA-JULI-2026" />
                    </Form.Item>
                    <Form.Item name="bank_account" label="Akun Bank" rules={[{ required: true, message: 'Pilih bank' }]} style={{ width: 250 }}>
                        <Select showSearch optionFilterProp="children" placeholder="Pilih Akun Bank">
                            {accounts.map(acc => (
                                <Option key={acc.id} value={acc.id}>{acc.account_code} - {acc.name}</Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Space>
                <Space style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                    <Form.Item name="date_start" label="Periode Mulai" rules={[{ required: true, message: 'Pilih tanggal' }]}>
                        <DatePicker format="YYYY-MM-DD" style={{ width: 150 }} />
                    </Form.Item>
                    <Form.Item name="date_end" label="Periode Berakhir" rules={[{ required: true, message: 'Pilih tanggal' }]}>
                        <DatePicker format="YYYY-MM-DD" style={{ width: 150 }} />
                    </Form.Item>
                    <Form.Item name="starting_balance" label="Saldo Awal" rules={[{ required: true, message: 'Isi saldo' }]} initialValue={0}>
                        <InputNumber style={{ width: 150 }} />
                    </Form.Item>
                    <Form.Item name="ending_balance" label="Saldo Akhir" rules={[{ required: true, message: 'Isi saldo' }]} initialValue={0}>
                        <InputNumber style={{ width: 150 }} />
                    </Form.Item>
                </Space>

                <Divider>Detail Mutasi Bank</Divider>
                
                <Table 
                    dataSource={lines} 
                    columns={columns} 
                    rowKey="id" 
                    pagination={false} 
                    size="small"
                    style={{ marginBottom: 16 }}
                />
                
                <Button type="dashed" onClick={handleAddLine} block icon={<PlusOutlined />}>
                    Tambah Baris Mutasi
                </Button>
            </Form>
        </Modal>
    );
};

export default BankStatementModal;
