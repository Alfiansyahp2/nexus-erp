import React, { useEffect, useState } from 'react';
import { Form, Input, DatePicker, Select, Table, InputNumber, Row, Col, message, Typography, Tag } from 'antd';
import { FormModal } from '../../common';
import dayjs from 'dayjs';
import api from '../../../api/axiosConfig';

const { Text } = Typography;

const GoodsReceiptModal = ({ visible, onClose, onSuccess, editingData, fromPoData }) => {
    const [form] = Form.useForm();
    const [warehouses, setWarehouses] = useState([]);
    const [lines, setLines] = useState([]);

    useEffect(() => {
        if (visible) {
            fetchWarehouses();
            if (fromPoData) {
                form.setFieldsValue({
                    document_number: `GR/${dayjs().format('YYYY/MM')}/${Math.floor(1000 + Math.random() * 9000)}`,
                    receipt_date: dayjs(),
                    delivery_note_number: '',
                    notes: `Penerimaan untuk PO: ${fromPoData.document_number}`
                });

                const mappedLines = (fromPoData.lines || []).map((l, idx) => {
                    const remQty = Math.max(0, parseFloat(l.quantity || 0) - parseFloat(l.received_qty || 0));
                    return {
                        key: idx,
                        po_line: l.id,
                        product: l.product,
                        product_code: l.product_code,
                        product_name: l.product_name,
                        uom: l.uom,
                        uom_name: l.uom_name,
                        ordered_qty: l.quantity,
                        already_received: l.received_qty,
                        quantity: remQty, // Default receive remaining qty
                        lot_number: '',
                        expiry_date: null,
                        notes: ''
                    };
                });
                setLines(mappedLines);
            } else if (editingData) {
                form.setFieldsValue({
                    document_number: editingData.document_number,
                    warehouse: editingData.warehouse,
                    receipt_date: editingData.receipt_date ? dayjs(editingData.receipt_date) : dayjs(),
                    delivery_note_number: editingData.delivery_note_number,
                    notes: editingData.notes
                });
                const mappedLines = (editingData.lines || []).map((l, idx) => ({
                    key: idx,
                    po_line: l.po_line,
                    product: l.product,
                    product_code: l.product_code,
                    product_name: l.product_name,
                    uom: l.uom,
                    uom_name: l.uom_name,
                    ordered_qty: l.po_line_ordered_qty,
                    already_received: l.po_line_received_qty,
                    quantity: l.quantity,
                    lot_number: l.lot_number,
                    expiry_date: l.expiry_date ? dayjs(l.expiry_date) : null,
                    notes: l.notes
                }));
                setLines(mappedLines);
            }
        }
    }, [visible, editingData, fromPoData]);

    const fetchWarehouses = async () => {
        try {
            const res = await api.get('/inventory/warehouses/');
            setWarehouses(res.data.results || res.data || []);
        } catch (err) {
            console.error('Error loading warehouses:', err);
        }
    };

    const handleLineChange = (key, field, value) => {
        setLines(lines.map(l => l.key === key ? { ...l, [field]: value } : l));
    };

    const handleSubmit = async (values) => {
        try {
            if (lines.every(l => l.quantity <= 0)) {
                message.error('Minimal ada 1 item dengan jumlah penerimaan lebih dari 0.');
                return;
            }

            const payload = {
                purchase_order: fromPoData ? fromPoData.id : editingData.purchase_order,
                document_number: values.document_number,
                warehouse: values.warehouse,
                receipt_date: values.receipt_date.format('YYYY-MM-DD'),
                delivery_note_number: values.delivery_note_number || '',
                notes: values.notes || '',
                lines: lines.filter(l => l.quantity > 0).map(l => ({
                    po_line: l.po_line,
                    product: l.product,
                    quantity: l.quantity,
                    uom: l.uom,
                    lot_number: l.lot_number || '',
                    expiry_date: l.expiry_date ? l.expiry_date.format('YYYY-MM-DD') : null,
                    notes: l.notes || ''
                }))
            };

            if (editingData) {
                await api.put(`/purchasing/receipts/${editingData.id}/`, payload);
                message.success('Goods Receipt berhasil diperbarui');
            } else {
                await api.post('/purchasing/receipts/', payload);
                message.success('Goods Receipt baru berhasil dibuat');
            }
            onSuccess();
        } catch (error) {
            console.error('Error saving GR:', error);
            if (error.response?.data) {
                message.error('Gagal menyimpan GR: ' + JSON.stringify(error.response.data));
            }
        }
    };

    const columns = [
        {
            title: 'Produk',
            dataIndex: 'product_name',
            width: '25%',
            render: (val, record) => (
                <div>
                    <Text strong>{record.product_code} - {val}</Text>
                    <div style={{ fontSize: 12, color: '#666' }}>Satuan: {record.uom_name || '-'}</div>
                </div>
            )
        },
        {
            title: 'Pesanan PO',
            dataIndex: 'ordered_qty',
            width: '12%',
            render: (val, record) => <Tag color="blue">{val} {record.uom_name}</Tag>
        },
        {
            title: 'Sudah Diterima',
            dataIndex: 'already_received',
            width: '13%',
            render: (val, record) => <Tag color="green">{val} {record.uom_name}</Tag>
        },
        {
            title: 'Terima Sekarang (Qty)',
            dataIndex: 'quantity',
            width: '15%',
            render: (val, record) => (
                <InputNumber
                    min={0}
                    max={parseFloat(record.ordered_qty) - parseFloat(record.already_received) + 10} // Allow slight over-receipt tolerance
                    style={{ width: '100%' }}
                    value={val}
                    onChange={(v) => handleLineChange(record.key, 'quantity', v)}
                />
            )
        },
        {
            title: 'No. Batch / Lot',
            dataIndex: 'lot_number',
            width: '18%',
            render: (val, record) => (
                <Input
                    placeholder="Contoh: LOT-2026-A"
                    value={val}
                    onChange={(e) => handleLineChange(record.key, 'lot_number', e.target.value)}
                />
            )
        },
        {
            title: 'Tgl Kadaluarsa (Exp)',
            dataIndex: 'expiry_date',
            width: '17%',
            render: (val, record) => (
                <DatePicker
                    style={{ width: '100%' }}
                    format="YYYY-MM-DD"
                    placeholder="Exp Date"
                    value={val}
                    onChange={(d) => handleLineChange(record.key, 'expiry_date', d)}
                />
            )
        }
    ];

    return (
        <FormModal
            title={fromPoData ? `Terima Barang untuk PO: ${fromPoData.document_number}` : (editingData ? 'Ubah Bukti Penerimaan Barang (GRN)' : 'Buat Bukti Penerimaan Barang (GRN)')}
            visible={visible}
            onSubmit={handleSubmit}
            onCancel={onClose}
            form={form}
            okText="Simpan Bukti Terima"
            width={950}
        >
                <Row gutter={16}>
                    <Col span={6}>
                        <Form.Item name="document_number" label="No. Dokumen GRN" rules={[{ required: true }]}>
                            <Input disabled={!!editingData} />
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item name="warehouse" label="Gudang Penerima" rules={[{ required: true, message: 'Pilih gudang tujuan' }]}>
                            <Select showSearch placeholder="Pilih Gudang" optionFilterProp="children">
                                {warehouses.map(w => (
                                    <Select.Option key={w.id} value={w.id}>{w.code} - {w.name}</Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item name="receipt_date" label="Tanggal Terima" rules={[{ required: true }]}>
                            <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item name="delivery_note_number" label="No. Surat Jalan Vendor">
                            <Input placeholder="SJ-88234 / DO-992" />
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item name="notes" label="Catatan / Kondisi Barang">
                    <Input.TextArea rows={2} placeholder="Kondisi fisik kemasan, catatan penerimaan gudang..." />
                </Form.Item>

                <div style={{ marginBottom: 8 }}>
                    <span style={{ fontWeight: 600 }}>Daftar Barang yang Diterima</span>
                </div>

                <Table
                    columns={columns}
                    dataSource={lines}
                    pagination={false}
                    size="small"
                    bordered
                    rowKey="key"
                />
        </FormModal>
    );
};

export default GoodsReceiptModal;
