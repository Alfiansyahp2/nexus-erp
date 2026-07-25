import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, DatePicker, Select, Button, Table, InputNumber, Row, Col, message } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import api from '../../../api/axiosConfig';

const PurchaseRequestModal = ({ visible, onClose, onSuccess, editingData }) => {
    const [form] = Form.useForm();
    const [products, setProducts] = useState([]);
    const [uoms, setUoms] = useState([]);
    const [lines, setLines] = useState([]);

    useEffect(() => {
        if (visible) {
            fetchProductsAndUoms();
            if (editingData) {
                form.setFieldsValue({
                    document_number: editingData.document_number,
                    request_date: editingData.request_date ? dayjs(editingData.request_date) : dayjs(),
                    expected_delivery_date: editingData.expected_delivery_date ? dayjs(editingData.expected_delivery_date) : null,
                    notes: editingData.notes
                });
                const mappedLines = (editingData.lines || []).map((l, idx) => ({
                    key: idx,
                    product: l.product,
                    quantity: l.quantity,
                    uom: l.uom,
                    estimated_unit_cost: l.estimated_unit_cost,
                    notes: l.notes
                }));
                setLines(mappedLines);
            } else {
                form.resetFields();
                form.setFieldsValue({
                    document_number: `PR/${dayjs().format('YYYY/MM')}/${Math.floor(1000 + Math.random() * 9000)}`,
                    request_date: dayjs()
                });
                setLines([{ key: Date.now(), product: null, quantity: 1, uom: null, estimated_unit_cost: 0, notes: '' }]);
            }
        }
    }, [visible, editingData]);

    const fetchProductsAndUoms = async () => {
        try {
            const [prodRes, uomRes] = await Promise.all([
                api.get('/inventory/products/'),
                api.get('/inventory/uoms/')
            ]);
            setProducts(prodRes.data.results || prodRes.data || []);
            setUoms(uomRes.data.results || uomRes.data || []);
        } catch (err) {
            console.error('Error loading products/uoms:', err);
        }
    };

    const handleAddLine = () => {
        setLines([...lines, { key: Date.now(), product: null, quantity: 1, uom: null, estimated_unit_cost: 0, notes: '' }]);
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
                        updated.estimated_unit_cost = prod.cost_price || 0;
                        updated.uom = prod.purchase_uom || prod.base_uom || null;
                    }
                }
                return updated;
            }
            return l;
        }));
    };

    const handleSubmit = async () => {
        try {
            const val = await form.validateFields();
            if (lines.some(l => !l.product || l.quantity <= 0)) {
                message.error('Pilih produk dan pastikan jumlah item lebih dari 0.');
                return;
            }

            const payload = {
                document_number: val.document_number,
                request_date: val.request_date.format('YYYY-MM-DD'),
                expected_delivery_date: val.expected_delivery_date ? val.expected_delivery_date.format('YYYY-MM-DD') : null,
                notes: val.notes || '',
                lines: lines.map(l => ({
                    product: l.product,
                    quantity: l.quantity,
                    uom: l.uom,
                    estimated_unit_cost: l.estimated_unit_cost || 0,
                    notes: l.notes || ''
                }))
            };

            if (editingData) {
                await api.put(`/purchasing/requests/${editingData.id}/`, payload);
                message.success('Purchase Request berhasil diperbarui');
            } else {
                await api.post('/purchasing/requests/', payload);
                message.success('Purchase Request berhasil dibuat');
            }
            onSuccess();
        } catch (error) {
            console.error('Error saving PR:', error);
            if (error.response?.data) {
                message.error('Gagal menyimpan PR: ' + JSON.stringify(error.response.data));
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
            title: 'Qty',
            dataIndex: 'quantity',
            width: '15%',
            render: (val, record) => (
                <InputNumber
                    min={0.01}
                    style={{ width: '100%' }}
                    value={val}
                    onChange={(v) => handleLineChange(record.key, 'quantity', v)}
                />
            )
        },
        {
            title: 'Satuan (UOM)',
            dataIndex: 'uom',
            width: '20%',
            render: (val, record) => (
                <Select
                    style={{ width: '100%' }}
                    placeholder="UOM"
                    value={val}
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
            title: 'Est. Biaya Satuan (Rp)',
            dataIndex: 'estimated_unit_cost',
            width: '22%',
            render: (val, record) => (
                <InputNumber
                    min={0}
                    style={{ width: '100%' }}
                    formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={v => v.replace(/\$\s?|(,*)/g, '')}
                    value={val}
                    onChange={(v) => handleLineChange(record.key, 'estimated_unit_cost', v)}
                />
            )
        },
        {
            title: '',
            width: '8%',
            render: (_, record) => (
                <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleRemoveLine(record.key)}
                />
            )
        }
    ];

    return (
        <Modal
            title={editingData ? 'Ubah Purchase Request (PR)' : 'Buat Purchase Request (PR)'}
            open={visible}
            onOk={handleSubmit}
            onCancel={onClose}
            okText="Simpan PR"
            cancelText="Batal"
            width={850}
        >
            <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
                <Row gutter={16}>
                    <Col span={8}>
                        <Form.Item name="document_number" label="No. Dokumen PR" rules={[{ required: true }]}>
                            <Input disabled={!!editingData} />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="request_date" label="Tanggal Request" rules={[{ required: true }]}>
                            <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="expected_delivery_date" label="Tgl Est. Dibutuhkan">
                            <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item name="notes" label="Catatan / Keterangan">
                    <Input.TextArea rows={2} placeholder="Alasan pengadaan barang..." />
                </Form.Item>

                <div style={{ marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600 }}>Daftar Item Pengadaan</span>
                    <Button type="dashed" icon={<PlusOutlined />} onClick={handleAddLine}>
                        Tambah Item
                    </Button>
                </div>

                <Table
                    columns={columns}
                    dataSource={lines}
                    pagination={false}
                    size="small"
                    bordered
                    rowKey="key"
                />
            </Form>
        </Modal>
    );
};

export default PurchaseRequestModal;
