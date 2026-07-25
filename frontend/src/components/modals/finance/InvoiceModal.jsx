import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, DatePicker, Button, Space, message, InputNumber, Divider, Table } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '../../../api/axiosConfig';

const { Option } = Select;

const InvoiceModal = ({ visible, onClose, onSuccess }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [partners, setPartners] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [lines, setLines] = useState([]);

    useEffect(() => {
        if (visible) {
            fetchPartners();
            fetchAccounts();
            form.resetFields();
            setLines([]);
        }
    }, [visible, form]);

    const fetchPartners = async () => {
        try {
            const res = await api.get('finance/partners/');
            setPartners(res.data);
        } catch (error) {
            console.error('Failed to fetch partners', error);
        }
    };

    const fetchAccounts = async () => {
        try {
            const res = await api.get('finance/accounts/');
            setAccounts(res.data);
        } catch (error) {
            console.error('Failed to fetch accounts', error);
        }
    };

    const handleAddLine = () => {
        setLines([...lines, { id: Date.now(), description: '', account: null, quantity: 1, unit_price: 0 }]);
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

    const calculateTotal = () => {
        return lines.reduce((sum, line) => sum + (line.quantity * line.unit_price), 0);
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            
            if (lines.length === 0) {
                message.error('Harap masukkan minimal satu baris item tagihan.');
                return;
            }
            
            // Validation for lines
            for (let line of lines) {
                if (!line.description || !line.account) {
                    message.error('Pastikan semua baris memiliki Deskripsi dan Akun yang valid.');
                    return;
                }
            }

            setLoading(true);
            const payload = {
                ...values,
                date: values.date.format('YYYY-MM-DD'),
                due_date: values.due_date.format('YYYY-MM-DD'),
                total_amount: calculateTotal(),
                amount_due: calculateTotal(),
                status: 'OPEN',
                lines: lines.map(l => ({
                    description: l.description,
                    account: l.account,
                    quantity: l.quantity,
                    unit_price: l.unit_price,
                    subtotal: l.quantity * l.unit_price
                }))
            };

            await api.post('finance/invoices/', payload);
            message.success('Tagihan berhasil ditambahkan');
            onSuccess();
        } catch (error) {
            console.error(error);
            message.error('Terjadi kesalahan saat menyimpan tagihan');
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        {
            title: 'Deskripsi Item',
            dataIndex: 'description',
            render: (_, record) => (
                <Input 
                    value={record.description} 
                    onChange={(e) => handleLineChange(record.id, 'description', e.target.value)}
                    placeholder="Contoh: Jasa Konsultasi"
                />
            )
        },
        {
            title: 'Akun (COA)',
            dataIndex: 'account',
            render: (_, record) => (
                <Select
                    showSearch
                    style={{ width: 200 }}
                    placeholder="Pilih Akun"
                    optionFilterProp="children"
                    value={record.account}
                    onChange={(val) => handleLineChange(record.id, 'account', val)}
                >
                    {accounts.map(acc => (
                        <Option key={acc.id} value={acc.id}>{acc.account_code} - {acc.name}</Option>
                    ))}
                </Select>
            )
        },
        {
            title: 'Qty',
            dataIndex: 'quantity',
            width: 100,
            render: (_, record) => (
                <InputNumber 
                    min={1} 
                    value={record.quantity} 
                    onChange={(val) => handleLineChange(record.id, 'quantity', val)}
                />
            )
        },
        {
            title: 'Harga Satuan',
            dataIndex: 'unit_price',
            render: (_, record) => (
                <InputNumber
                    style={{ width: '100%' }}
                    formatter={value => `Rp ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={value => value.replace(/\Rp\s?|(,*)/g, '')}
                    value={record.unit_price}
                    onChange={(val) => handleLineChange(record.id, 'unit_price', val)}
                />
            )
        },
        {
            title: 'Subtotal',
            key: 'subtotal',
            render: (_, record) => (
                <span>Rp {(record.quantity * record.unit_price).toLocaleString('id-ID')}</span>
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
            title="Tambah Tagihan Baru (Invoice / Bill)"
            open={visible}
            onCancel={onClose}
            width={900}
            centered
            styles={{ body: { maxHeight: 'calc(100vh - 200px)', overflowY: 'auto', overflowX: 'hidden' } }}
            footer={[
                <Button key="back" onClick={onClose}>Batal</Button>,
                <Button key="submit" type="primary" loading={loading} onClick={handleSubmit}>
                    Simpan Tagihan
                </Button>
            ]}
        >
            <Form form={form} layout="vertical">
                <Space style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                    <Form.Item name="invoice_type" label="Tipe Tagihan" rules={[{ required: true, message: 'Pilih tipe tagihan' }]} style={{ width: 200 }}>
                        <Select placeholder="Pilih Tipe">
                            <Option value="VENDOR_BILL">Vendor Bill (Hutang)</Option>
                            <Option value="CUSTOMER_INV">Customer Invoice (Piutang)</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item name="document_number" label="Nomor Dokumen" rules={[{ required: true, message: 'Wajib diisi' }]} style={{ width: 250 }}>
                        <Input placeholder="Contoh: INV/2026/08/001" />
                    </Form.Item>
                    <Form.Item name="partner" label="Mitra (Vendor/Kustomer)" rules={[{ required: true, message: 'Pilih mitra' }]} style={{ width: 250 }}>
                        <Select showSearch optionFilterProp="children" placeholder="Pilih Mitra">
                            {partners.map(p => (
                                <Option key={p.id} value={p.id}>{p.name} ({p.partner_type})</Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Space>
                <Space style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                    <Form.Item name="date" label="Tanggal Tagihan" rules={[{ required: true, message: 'Pilih tanggal' }]}>
                        <DatePicker format="YYYY-MM-DD" style={{ width: 200 }} />
                    </Form.Item>
                    <Form.Item name="due_date" label="Tanggal Jatuh Tempo" rules={[{ required: true, message: 'Pilih tanggal' }]}>
                        <DatePicker format="YYYY-MM-DD" style={{ width: 200 }} />
                    </Form.Item>
                </Space>

                <Divider>Detail Item Tagihan</Divider>
                
                <Table 
                    dataSource={lines} 
                    columns={columns} 
                    rowKey="id" 
                    pagination={false} 
                    size="small"
                    style={{ marginBottom: 16 }}
                />
                
                <Button type="dashed" onClick={handleAddLine} block icon={<PlusOutlined />}>
                    Tambah Baris Item
                </Button>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
                    <h3>Total Tagihan: Rp {calculateTotal().toLocaleString('id-ID')}</h3>
                </div>
            </Form>
        </Modal>
    );
};

export default InvoiceModal;
