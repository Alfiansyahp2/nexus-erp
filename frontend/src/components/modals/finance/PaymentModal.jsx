import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, DatePicker, Button, Space, message, InputNumber } from 'antd';
import api from '../../../api/axiosConfig';

const { Option } = Select;

const PaymentModal = ({ visible, onClose, onSuccess }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [partners, setPartners] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [invoices, setInvoices] = useState([]);

    useEffect(() => {
        if (visible) {
            fetchPartners();
            fetchAccounts();
            fetchInvoices();
            form.resetFields();
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
            // Only show Asset (Bank/Cash) accounts for payment method
            setAccounts(res.data.filter(acc => acc.account_type === 'ASSET'));
        } catch (error) {
            console.error('Failed to fetch accounts', error);
        }
    };

    const fetchInvoices = async () => {
        try {
            const res = await api.get('finance/invoices/');
            // Only fetch open or draft invoices for payment linking
            setInvoices(res.data.filter(inv => inv.status !== 'PAID' && inv.status !== 'CANCELLED'));
        } catch (error) {
            console.error('Failed to fetch invoices', error);
        }
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);
            const payload = {
                ...values,
                date: values.date.format('YYYY-MM-DD')
            };

            await api.post('finance/payments/', payload);
            message.success('Pembayaran berhasil dicatat');
            onSuccess();
        } catch (error) {
            console.error(error);
            message.error('Terjadi kesalahan saat mencatat pembayaran');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title="Catat Pembayaran (Kas/Bank)"
            open={visible}
            onCancel={onClose}
            centered
            styles={{ body: { maxHeight: 'calc(100vh - 200px)', overflowY: 'auto', overflowX: 'hidden' } }}
            footer={[
                <Button key="back" onClick={onClose}>Batal</Button>,
                <Button key="submit" type="primary" loading={loading} onClick={handleSubmit}>
                    Simpan Pembayaran
                </Button>
            ]}
        >
            <Form form={form} layout="vertical">
                <Space style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                    <Form.Item name="payment_type" label="Tipe Pembayaran" rules={[{ required: true, message: 'Pilih tipe' }]} style={{ width: 200 }}>
                        <Select placeholder="Pilih Tipe">
                            <Option value="INBOUND">Inbound (Terima Kas)</Option>
                            <Option value="OUTBOUND">Outbound (Keluar Kas)</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item name="payment_number" label="Nomor Referensi" rules={[{ required: true, message: 'Wajib diisi' }]} style={{ width: 250 }}>
                        <Input placeholder="Contoh: PAY-IN-001" />
                    </Form.Item>
                </Space>
                
                <Form.Item name="partner" label="Mitra (Vendor/Kustomer)" rules={[{ required: true, message: 'Pilih mitra' }]}>
                    <Select showSearch optionFilterProp="children" placeholder="Pilih Mitra">
                        {partners.map(p => (
                            <Option key={p.id} value={p.id}>{p.name}</Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item name="invoice" label="Hubungkan dengan Tagihan (Opsional)">
                    <Select showSearch allowClear placeholder="Pilih Tagihan (Invoice / Bill)" optionFilterProp="children">
                        {invoices.map(inv => (
                            <Option key={inv.id} value={inv.id}>{inv.document_number} - {inv.partner_name} (Sisa: Rp {parseFloat(inv.amount_due).toLocaleString('id-ID')})</Option>
                        ))}
                    </Select>
                </Form.Item>
                
                <Space style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                    <Form.Item name="date" label="Tanggal Pembayaran" rules={[{ required: true, message: 'Pilih tanggal' }]}>
                        <DatePicker format="YYYY-MM-DD" style={{ width: 200 }} />
                    </Form.Item>
                    <Form.Item name="amount" label="Nominal Pembayaran" rules={[{ required: true, message: 'Masukkan nominal' }]}>
                        <InputNumber
                            style={{ width: 250 }}
                            formatter={value => `Rp ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={value => value.replace(/\Rp\s?|(,*)/g, '')}
                        />
                    </Form.Item>
                </Space>

                <Form.Item name="payment_method" label="Metode Pembayaran (Akun Kas/Bank)" rules={[{ required: true, message: 'Pilih akun pembayaran' }]}>
                    <Select showSearch optionFilterProp="children" placeholder="Pilih Akun Bank/Kas">
                        {accounts.map(acc => (
                            <Option key={acc.id} value={acc.id}>{acc.account_code} - {acc.name}</Option>
                        ))}
                    </Select>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default PaymentModal;
