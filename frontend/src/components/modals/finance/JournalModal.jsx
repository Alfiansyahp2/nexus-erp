import React, { useEffect } from 'react';
import { Modal, Form, Input, DatePicker, Select, message, Space, Card, InputNumber, Button, Typography, Divider } from 'antd';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Option } = Select;
const { Text } = Typography;

const JournalModal = ({ open, onCancel, onSuccess, accounts }) => {
    const [form] = Form.useForm();
    const items = Form.useWatch('items', form) || [];

    const totalDebit = items.reduce((sum, item) => sum + (item?.debit || 0), 0);
    const totalCredit = items.reduce((sum, item) => sum + (item?.credit || 0), 0);
    const isBalanced = totalDebit === totalCredit;

    useEffect(() => {
        if (open) {
            form.resetFields();
        }
    }, [open, form]);

    const handleAddJournal = async (values) => {
        if (!isBalanced) {
            message.error('Total Debit dan Kredit harus seimbang (sama)!');
            return;
        }

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
            onOk={form.submit}
            okText="Simpan Jurnal"
            cancelText="Batal"
            okButtonProps={{ disabled: !isBalanced || totalDebit === 0 }}
            width={1000}
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
                    <Input.TextArea rows={2} placeholder="Keterangan transaksi secara umum" />
                </Form.Item>

                <Card size="small" title="Baris Jurnal (Debit & Kredit)" style={{ marginBottom: '16px', background: '#fafafa' }}>
                    <div style={{ display: 'flex', marginBottom: '8px', paddingRight: '24px', fontWeight: 'bold' }}>
                        <div style={{ width: '250px', marginRight: '8px' }}>Akun</div>
                        <div style={{ width: '250px', marginRight: '8px' }}>Keterangan</div>
                        <div style={{ width: '180px', marginRight: '8px' }}>Debit (Rp)</div>
                        <div style={{ width: '180px' }}>Kredit (Rp)</div>
                    </div>
                    
                    <Form.List name="items" initialValue={[{}]}>
                        {(fields, { add, remove }) => (
                            <>
                                {fields.map(({ key, name, ...restField }) => (
                                    <Space key={key} style={{ display: 'flex', marginBottom: 0 }} align="start">
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
                                            name={[name, 'description']}
                                            style={{ width: '250px' }}
                                        >
                                            <Input placeholder="Catatan baris (opsional)" />
                                        </Form.Item>

                                        <Form.Item
                                            {...restField}
                                            name={[name, 'debit']}
                                            initialValue={0}
                                            style={{ width: '180px' }}
                                        >
                                            <InputNumber 
                                                style={{ width: '100%' }} 
                                                min={0}
                                                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                                parser={(value) => value?.replace(/\$\s?|(,*)/g, '')}
                                            />
                                        </Form.Item>

                                        <Form.Item
                                            {...restField}
                                            name={[name, 'credit']}
                                            initialValue={0}
                                            style={{ width: '180px' }}
                                        >
                                            <InputNumber 
                                                style={{ width: '100%' }} 
                                                min={0}
                                                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                                parser={(value) => value?.replace(/\$\s?|(,*)/g, '')}
                                            />
                                        </Form.Item>

                                        <MinusCircleOutlined onClick={() => remove(name)} style={{ color: 'red', marginTop: '10px' }} />
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

                    <Divider style={{ margin: '12px 0' }} />
                    
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '32px', paddingRight: '24px' }}>
                        <Text strong>Total:</Text>
                        <Text strong type={isBalanced ? 'success' : 'danger'} style={{ width: '180px' }}>
                            Rp {totalDebit.toLocaleString('id-ID')}
                        </Text>
                        <Text strong type={isBalanced ? 'success' : 'danger'} style={{ width: '180px', paddingRight: '12px' }}>
                            Rp {totalCredit.toLocaleString('id-ID')}
                        </Text>
                    </div>
                    {!isBalanced && (
                        <div style={{ textAlign: 'right', paddingRight: '24px', marginTop: '4px' }}>
                            <Text type="danger">Selisih: Rp {Math.abs(totalDebit - totalCredit).toLocaleString('id-ID')}</Text>
                        </div>
                    )}
                </Card>

            </Form>
        </Modal>
    );
};

export default JournalModal;
