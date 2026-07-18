import React, { useEffect } from 'react';
import { Modal, Form, Input, DatePicker, Select, message, Space, Card, InputNumber, Button } from 'antd';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Option } = Select;

const JournalModal = ({ open, onCancel, onSuccess, accounts }) => {
    const [form] = Form.useForm();

    useEffect(() => {
        if (open) {
            form.resetFields();
        }
    }, [open, form]);

    const handleAddJournal = async (values) => {
        try {
            // Format date to YYYY-MM-DD
            values.date = values.date.format('YYYY-MM-DD');
            
            await axios.post('http://localhost:8000/api/finance/journals/', values, {
                headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
            });
            message.success('Jurnal berhasil ditambahkan');
            onSuccess();
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

    return (
        <Modal
            title="Buat Jurnal Transaksi"
            open={open}
            onCancel={onCancel}
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
                        <Button onClick={onCancel}>Batal</Button>
                    </Space>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default JournalModal;
