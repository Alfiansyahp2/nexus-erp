import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, DatePicker, Select, Button, Space, message, InputNumber, Divider } from 'antd';
import dayjs from 'dayjs';
import api from '../../../api/axiosConfig';

const { Option } = Select;

const DeliveryOrderModal = ({ visible, onClose, onSuccess, fromSoData }) => {
    const [form] = Form.useForm();
    const [warehouses, setWarehouses] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (visible) {
            fetchWarehouses();
            
            if (fromSoData) {
                // Initialize DO from SO data
                const lines = fromSoData.lines
                    .filter(line => parseFloat(line.quantity) > parseFloat(line.shipped_qty))
                    .map(line => ({
                        so_line: line.id,
                        product: line.product,
                        product_name: line.product_name,
                        product_code: line.product_code,
                        uom: line.uom,
                        // Default quantity is the remaining qty
                        quantity: parseFloat(line.quantity) - parseFloat(line.shipped_qty),
                        lot_number: '',
                        notes: ''
                    }));
                    
                form.setFieldsValue({
                    sales_order: fromSoData.id,
                    so_number: fromSoData.document_number,
                    customer_name: fromSoData.customer_name,
                    shipment_date: dayjs(),
                    lines: lines
                });
            }
        }
    }, [visible, fromSoData, form]);

    const fetchWarehouses = async () => {
        try {
            const response = await api.get('/inventory/warehouses/');
            setWarehouses(response.data.results || response.data || []);
        } catch (error) {
            message.error('Gagal mengambil data gudang');
        }
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            const formattedValues = {
                ...values,
                sales_order: fromSoData.id,
                shipment_date: values.shipment_date ? values.shipment_date.format('YYYY-MM-DD') : null,
            };

            await api.post('/sales/deliveries/', formattedValues);
            message.success('Delivery Order (Surat Jalan) berhasil dibuat');
            onSuccess();
        } catch (error) {
            if (error.response?.data) {
                const errorMsg = Object.values(error.response.data).flat().join(', ');
                message.error(`Gagal menyimpan DO: ${errorMsg}`);
            }
        }
    };

    return (
        <Modal
            title="Buat Delivery Order (Surat Jalan)"
            open={visible}
            onOk={handleSubmit}
            onCancel={onClose}
            width={850}
            okText="Buat Surat Jalan"
            cancelText="Batal"
            confirmLoading={loading}
        >
            <Form form={form} layout="vertical">
                <div style={{ display: 'flex', gap: '16px' }}>
                    <Form.Item name="document_number" label="No. Surat Jalan (DO)" rules={[{ required: true }]} style={{ flex: 1 }}>
                        <Input placeholder="DO/2026/08/001" />
                    </Form.Item>
                    <Form.Item name="so_number" label="Ref. Sales Order" style={{ flex: 1 }}>
                        <Input disabled />
                    </Form.Item>
                    <Form.Item name="customer_name" label="Pelanggan" style={{ flex: 1 }}>
                        <Input disabled />
                    </Form.Item>
                </div>

                <div style={{ display: 'flex', gap: '16px' }}>
                    <Form.Item name="warehouse" label="Gudang Asal (Pengiriman)" rules={[{ required: true }]} style={{ flex: 1 }}>
                        <Select placeholder="Pilih Gudang">
                            {warehouses.map(w => (
                                <Option key={w.id} value={w.id}>{w.name}</Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item name="shipment_date" label="Tanggal Pengiriman" rules={[{ required: true }]} style={{ flex: 1 }}>
                        <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
                    </Form.Item>
                    <Form.Item name="courier_tracking" label="Kurir / Resi (Opsional)" style={{ flex: 1 }}>
                        <Input placeholder="JNE / 123456789" />
                    </Form.Item>
                </div>

                <Divider style={{ margin: '12px 0' }}>Barang yang akan Dikirim</Divider>
                
                <Form.List name="lines">
                    {(fields) => (
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: '#f0f0f0', borderBottom: '1px solid #ccc', fontSize: 13 }}>
                                    <th style={{ padding: 8, textAlign: 'left' }}>Produk</th>
                                    <th style={{ padding: 8, textAlign: 'right' }}>Qty Dikirim</th>
                                    <th style={{ padding: 8, textAlign: 'left' }}>No. Lot / Batch</th>
                                    <th style={{ padding: 8, textAlign: 'left' }}>Catatan</th>
                                </tr>
                            </thead>
                            <tbody>
                                {fields.map(({ key, name, ...restField }) => (
                                    <tr key={key} style={{ borderBottom: '1px solid #eee' }}>
                                        <td style={{ padding: 8 }}>
                                            <Form.Item name={[name, 'product_name']} style={{ margin: 0 }}>
                                                <Input bordered={false} readOnly />
                                            </Form.Item>
                                            {/* Hidden fields needed for submission */}
                                            <Form.Item name={[name, 'so_line']} hidden><Input /></Form.Item>
                                            <Form.Item name={[name, 'product']} hidden><Input /></Form.Item>
                                        </td>
                                        <td style={{ padding: 8, textAlign: 'right' }}>
                                            <Form.Item 
                                                {...restField} 
                                                name={[name, 'quantity']} 
                                                style={{ margin: 0 }}
                                                rules={[{ required: true, message: 'Harus diisi' }]}
                                            >
                                                <InputNumber min={0.01} style={{ width: 100 }} />
                                            </Form.Item>
                                        </td>
                                        <td style={{ padding: 8 }}>
                                            <Form.Item {...restField} name={[name, 'lot_number']} style={{ margin: 0 }}>
                                                <Input placeholder="Jika ada" />
                                            </Form.Item>
                                        </td>
                                        <td style={{ padding: 8 }}>
                                            <Form.Item {...restField} name={[name, 'notes']} style={{ margin: 0 }}>
                                                <Input placeholder="Opsional" />
                                            </Form.Item>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </Form.List>

                <Form.Item name="notes" label="Catatan Tambahan" style={{ marginTop: 16 }}>
                    <Input.TextArea rows={2} />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default DeliveryOrderModal;
