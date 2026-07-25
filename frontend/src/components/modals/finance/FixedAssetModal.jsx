import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, DatePicker, Button, Space, message, InputNumber, Divider } from 'antd';
import api from '../../../api/axiosConfig';

const { Option } = Select;

const FixedAssetModal = ({ visible, onClose, onSuccess }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [accounts, setAccounts] = useState([]);

    useEffect(() => {
        if (visible) {
            fetchAccounts();
            form.resetFields();
        }
    }, [visible, form]);

    const fetchAccounts = async () => {
        try {
            const res = await api.get('finance/accounts/');
            setAccounts(res.data);
        } catch (error) {
            console.error('Failed to fetch accounts', error);
        }
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);
            const payload = {
                ...values,
                purchase_date: values.purchase_date.format('YYYY-MM-DD')
            };

            await api.post('finance/fixed-assets/', payload);
            message.success('Aset berhasil diregistrasi');
            onSuccess();
        } catch (error) {
            console.error(error);
            message.error('Terjadi kesalahan saat meregistrasi aset');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title="Registrasi Aset Tetap Baru"
            open={visible}
            onCancel={onClose}
            width={700}
            centered
            styles={{ body: { maxHeight: 'calc(100vh - 200px)', overflowY: 'auto', overflowX: 'hidden' } }}
            footer={[
                <Button key="back" onClick={onClose}>Batal</Button>,
                <Button key="submit" type="primary" loading={loading} onClick={handleSubmit}>
                    Registrasi Aset
                </Button>
            ]}
        >
            <Form form={form} layout="vertical">
                <Space style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                    <Form.Item name="asset_code" label="Kode Aset" rules={[{ required: true, message: 'Wajib diisi' }]} style={{ width: 200 }}>
                        <Input placeholder="Contoh: AST-MAC-001" />
                    </Form.Item>
                    <Form.Item name="asset_name" label="Nama Aset" rules={[{ required: true, message: 'Wajib diisi' }]} style={{ width: 400 }}>
                        <Input placeholder="Contoh: MacBook Pro M3" />
                    </Form.Item>
                </Space>
                
                <Space style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                    <Form.Item name="purchase_date" label="Tanggal Pembelian" rules={[{ required: true, message: 'Pilih tanggal' }]}>
                        <DatePicker format="YYYY-MM-DD" style={{ width: 200 }} />
                    </Form.Item>
                    <Form.Item name="purchase_value" label="Nilai Beli (Rp)" rules={[{ required: true, message: 'Masukkan nominal' }]}>
                        <InputNumber
                            style={{ width: 200 }}
                            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={value => value.replace(/\$\s?|(,*)/g, '')}
                        />
                    </Form.Item>
                    <Form.Item name="salvage_value" label="Nilai Residu (Rp)" rules={[{ required: true, message: 'Masukkan nominal' }]} initialValue={0}>
                        <InputNumber
                            style={{ width: 180 }}
                            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={value => value.replace(/\$\s?|(,*)/g, '')}
                        />
                    </Form.Item>
                </Space>

                <Form.Item name="useful_life_months" label="Umur Ekonomis (dalam Bulan)" rules={[{ required: true, message: 'Wajib diisi' }]} style={{ width: 200 }}>
                    <InputNumber min={1} style={{ width: '100%' }} placeholder="Contoh: 48" />
                </Form.Item>

                <Divider>Konfigurasi Akuntansi</Divider>

                <Form.Item name="fixed_asset_account" label="Akun Aset Tetap" rules={[{ required: true, message: 'Pilih akun' }]}>
                    <Select showSearch optionFilterProp="children" placeholder="Pilih Akun (misal: Peralatan Kantor)">
                        {accounts.filter(a => a.account_type === 'ASSET').map(acc => (
                            <Option key={acc.id} value={acc.id}>{acc.account_code} - {acc.name}</Option>
                        ))}
                    </Select>
                </Form.Item>
                <Form.Item name="depreciation_expense_account" label="Akun Beban Penyusutan" rules={[{ required: true, message: 'Pilih akun' }]}>
                    <Select showSearch optionFilterProp="children" placeholder="Pilih Akun (misal: Beban Penyusutan Peralatan)">
                        {accounts.filter(a => a.account_type === 'EXPENSE').map(acc => (
                            <Option key={acc.id} value={acc.id}>{acc.account_code} - {acc.name}</Option>
                        ))}
                    </Select>
                </Form.Item>
                <Form.Item name="accumulated_depreciation_account" label="Akun Akumulasi Penyusutan" rules={[{ required: true, message: 'Pilih akun' }]}>
                    <Select showSearch optionFilterProp="children" placeholder="Pilih Akun (misal: Akumulasi Penyusutan Peralatan)">
                        {accounts.filter(a => a.account_type === 'ASSET' || a.account_type === 'LIABILITY').map(acc => (
                            <Option key={acc.id} value={acc.id}>{acc.account_code} - {acc.name}</Option>
                        ))}
                    </Select>
                </Form.Item>

            </Form>
        </Modal>
    );
};

export default FixedAssetModal;
