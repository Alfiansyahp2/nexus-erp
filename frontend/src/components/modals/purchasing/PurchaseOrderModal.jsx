import React, { useEffect, useState } from 'react';
import { Form, Input, DatePicker, Select, Button, Table, InputNumber, Row, Col, message, Typography } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { FormModal } from '../../common';
import dayjs from 'dayjs';
import api from '../../../api/axiosConfig';

const { Text } = Typography;

const PurchaseOrderModal = ({ visible, onClose, onSuccess, editingData, fromPrData }) => {
    const [form] = Form.useForm();
    const [vendors, setVendors] = useState([]);
    const [products, setProducts] = useState([]);
    const [uoms, setUoms] = useState([]);
    const [lines, setLines] = useState([]);

    useEffect(() => {
        if (visible) {
            fetchMasterData();
            if (fromPrData) {
                form.setFieldsValue({
                    document_number: `PO/${dayjs().format('YYYY/MM')}/${Math.floor(1000 + Math.random() * 9000)}`,
                    order_date: dayjs(),
                    expected_delivery_date: fromPrData.expected_delivery_date ? dayjs(fromPrData.expected_delivery_date) : null,
                    notes: `Berdasarkan PR: ${fromPrData.document_number}`
                });
                const mappedLines = (fromPrData.lines || []).map((l, idx) => ({
                    key: idx,
                    product: l.product,
                    quantity: l.quantity,
                    uom: l.uom,
                    unit_price: l.estimated_unit_cost || 0
                }));
                setLines(mappedLines);
            } else if (editingData) {
                form.setFieldsValue({
                    document_number: editingData.document_number,
                    vendor: editingData.vendor,
                    order_date: editingData.order_date ? dayjs(editingData.order_date) : dayjs(),
                    expected_delivery_date: editingData.expected_delivery_date ? dayjs(editingData.expected_delivery_date) : null,
                    notes: editingData.notes
                });
                const mappedLines = (editingData.lines || []).map((l, idx) => ({
                    key: idx,
                    product: l.product,
                    quantity: l.quantity,
                    uom: l.uom,
                    unit_price: l.unit_price
                }));
                setLines(mappedLines);
            } else {
                form.resetFields();
                form.setFieldsValue({
                    document_number: `PO/${dayjs().format('YYYY/MM')}/${Math.floor(1000 + Math.random() * 9000)}`,
                    order_date: dayjs()
                });
                setLines([{ key: Date.now(), product: null, quantity: 1, uom: null, unit_price: 0 }]);
            }
        }
    }, [visible, editingData, fromPrData]);

    const fetchMasterData = async () => {
        try {
            const [vendRes, prodRes, uomRes] = await Promise.all([
                api.get('/purchasing/vendors/'),
                api.get('/inventory/products/'),
                api.get('/inventory/uoms/')
            ]);
            setVendors(vendRes.data.results || vendRes.data || []);
            setProducts(prodRes.data.results || prodRes.data || []);
            setUoms(uomRes.data.results || uomRes.data || []);
        } catch (err) {
            console.error('Error loading master data:', err);
        }
    };

    const handleAddLine = () => {
        setLines([...lines, { key: Date.now(), product: null, quantity: 1, uom: null, unit_price: 0 }]);
    };

    const handleRemoveLine = (key) => {
        if (lines.length === 1) {
            message.warning('Minimal harus ada 1 item pesanan.');
            return;
        }
        setLines(lines.filter(l => l.key !== key));
    };

    const handleLineChange = (key, field, value) => {
        setLines(lines.map(l => {
            if (l.key === key) {
                const updated = { ...l, [field]: value };
                if (field === 'product') {
                    const prod = products.find(p => p.id === value);
                    if (prod) {
                        updated.unit_price = prod.cost_price || 0;
                        updated.uom = prod.purchase_uom || prod.base_uom || null;
                    }
                }
                return updated;
            }
            return l;
        }));
    };

    const calculateTotal = () => {
        return lines.reduce((acc, curr) => acc + ((curr.quantity || 0) * (curr.unit_price || 0)), 0);
    };

    const handleSubmit = async (values) => {
        try {
            if (lines.some(l => !l.product || l.quantity <= 0)) {
                message.error('Pilih produk dan pastikan jumlah item lebih dari 0.');
                return;
            }

            if (fromPrData) {
                const payload = {
                    purchase_request_id: fromPrData.id,
                    vendor_id: values.vendor,
                    document_number: values.document_number,
                    order_date: values.order_date.format('YYYY-MM-DD'),
                    expected_delivery_date: values.expected_delivery_date ? values.expected_delivery_date.format('YYYY-MM-DD') : null
                };
                await api.post('/purchasing/orders/create_from_pr/', payload);
                message.success('Purchase Order berhasil dibuat dari PR');
            } else {
                const payload = {
                    document_number: values.document_number,
                    vendor: values.vendor,
                    order_date: values.order_date.format('YYYY-MM-DD'),
                    expected_delivery_date: values.expected_delivery_date ? values.expected_delivery_date.format('YYYY-MM-DD') : null,
                    notes: values.notes || '',
                    lines: lines.map(l => ({
                        product: l.product,
                        quantity: l.quantity,
                        uom: l.uom,
                        unit_price: l.unit_price || 0
                    }))
                };

                if (editingData) {
                    await api.put(`/purchasing/orders/${editingData.id}/`, payload);
                    message.success('Purchase Order berhasil diperbarui');
                } else {
                    await api.post('/purchasing/orders/', payload);
                    message.success('Purchase Order berhasil dibuat');
                }
            }
            onSuccess();
        } catch (error) {
            console.error('Error saving PO:', error);
            if (error.response?.data) {
                message.error('Gagal menyimpan PO: ' + JSON.stringify(error.response.data));
            }
        }
    };

    const columns = [
        {
            title: 'Produk',
            dataIndex: 'product',
            width: '35%',
            render: (val, record) => (
                <Select
                    showSearch
                    style={{ width: '100%' }}
                    placeholder="Pilih produk"
                    value={val}
                    disabled={!!fromPrData}
                    onChange={(v) => handleLineChange(record.key, 'product', v)}
                    optionFilterProp="children"
                >
                    {products.map(p => (
                        <Select.Option key={p.id} value={p.id}>{p.code} - {p.name}</Select.Option>
                    ))}
                </Select>
            )
        },
        {
            title: 'Qty Pesanan',
            dataIndex: 'quantity',
            width: '15%',
            render: (val, record) => (
                <InputNumber
                    min={0.01}
                    style={{ width: '100%' }}
                    disabled={!!fromPrData}
                    value={val}
                    onChange={(v) => handleLineChange(record.key, 'quantity', v)}
                />
            )
        },
        {
            title: 'Satuan (UOM)',
            dataIndex: 'uom',
            width: '18%',
            render: (val, record) => (
                <Select
                    style={{ width: '100%' }}
                    placeholder="UOM"
                    value={val}
                    disabled={!!fromPrData}
                    onChange={(v) => handleLineChange(record.key, 'uom', v)}
                    allowClear
                >
                    {uoms.map(u => (
                        <Select.Option key={u.id} value={u.id}>{u.name}</Select.Option>
                    ))}
                </Select>
            )
        },
        {
            title: 'Harga Satuan (Rp)',
            dataIndex: 'unit_price',
            width: '22%',
            render: (val, record) => (
                <InputNumber
                    min={0}
                    style={{ width: '100%' }}
                    formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={v => v.replace(/\$\s?|(,*)/g, '')}
                    value={val}
                    onChange={(v) => handleLineChange(record.key, 'unit_price', v)}
                />
            )
        },
        {
            title: '',
            width: '10%',
            render: (_, record) => (
                !fromPrData && (
                    <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleRemoveLine(record.key)}
                    />
                )
            )
        }
    ];

    return (
        <FormModal
            title={fromPrData ? `Buat PO dari ${fromPrData.document_number}` : (editingData ? 'Ubah Purchase Order (PO)' : 'Buat Purchase Order (PO)')}
            visible={visible}
            onSubmit={handleSubmit}
            onCancel={onClose}
            form={form}
            okText="Simpan PO"
            width={850}
        >
                <Row gutter={16}>
                    <Col span={8}>
                        <Form.Item name="document_number" label="No. Dokumen PO" rules={[{ required: true }]}>
                            <Input disabled={!!editingData} />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="vendor" label="Vendor / Supplier" rules={[{ required: true, message: 'Pilih vendor' }]}>
                            <Select showSearch placeholder="Pilih Vendor" optionFilterProp="children">
                                {vendors.map(v => (
                                    <Select.Option key={v.id} value={v.id}>{v.code} - {v.name}</Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={4}>
                        <Form.Item name="order_date" label="Tanggal PO" rules={[{ required: true }]}>
                            <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
                        </Form.Item>
                    </Col>
                    <Col span={4}>
                        <Form.Item name="expected_delivery_date" label="Est. Kirim">
                            <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item name="notes" label="Catatan / Keterangan">
                    <Input.TextArea rows={2} placeholder="Syarat pengiriman, instruksi khusus, dll..." />
                </Form.Item>

                <div style={{ marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600 }}>Daftar Item PO</span>
                    {!fromPrData && (
                        <Button type="dashed" icon={<PlusOutlined />} onClick={handleAddLine}>
                            Tambah Item
                        </Button>
                    )}
                </div>

                <Table
                    columns={columns}
                    dataSource={lines}
                    pagination={false}
                    size="small"
                    bordered
                    rowKey="key"
                />

                <div style={{ marginTop: 16, textAlign: 'right', background: '#fafafa', padding: '12px', borderRadius: 6 }}>
                    <Text strong style={{ fontSize: 16 }}>
                        Total Nilai PO: Rp {calculateTotal().toLocaleString('id-ID')}
                    </Text>
                </div>
        </FormModal>
    );
};

export default PurchaseOrderModal;
