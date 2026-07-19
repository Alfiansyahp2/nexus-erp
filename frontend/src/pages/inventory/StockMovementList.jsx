import React, { useState, useEffect } from 'react';
import { Table, Button, Space, message, Typography, Tag } from 'antd';
import { PlusOutlined, EyeOutlined } from '@ant-design/icons';
import api from '../../api/axiosConfig';
import MovementModal from '../../components/modals/inventory/MovementModal';
import MovementDetailModal from '../../components/modals/inventory/MovementDetailModal';

const { Title } = Typography;

const StockMovementList = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [detailData, setDetailData] = useState(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await api.get('/inventory/stock-movements/');
            setData(response.data);
        } catch (error) {
            message.error('Gagal mengambil data riwayat mutasi');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const columns = [
        {
            title: 'Tanggal',
            dataIndex: 'date',
            key: 'date',
        },
        {
            title: 'No. Referensi',
            dataIndex: 'reference_number',
            key: 'reference_number',
        },
        {
            title: 'Produk',
            dataIndex: 'product_name',
            key: 'product_name',
        },
        {
            title: 'Gudang',
            dataIndex: 'warehouse_name',
            key: 'warehouse_name',
        },
        {
            title: 'Jenis',
            dataIndex: 'movement_type',
            key: 'movement_type',
            render: (type) => {
                const colors = {
                    'IN': 'green',
                    'OUT': 'red',
                    'TRANSFER': 'blue',
                    'ADJUSTMENT': 'orange'
                };
                return <Tag color={colors[type] || 'default'}>{type}</Tag>;
            }
        },
        {
            title: 'Kuantitas',
            dataIndex: 'quantity',
            key: 'quantity',
            align: 'right',
            render: (val) => parseFloat(val).toLocaleString('id-ID')
        },
        {
            title: 'Catatan',
            dataIndex: 'notes',
            key: 'notes',
            ellipsis: true,
        },
        {
            title: 'Aksi',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Button 
                        type="text" 
                        icon={<EyeOutlined className="icon-primary" />} 
                        onClick={() => {
                            setDetailData(record);
                            setDetailModalVisible(true);
                        }} 
                    />
                </Space>
            ),
        }
    ];

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <Title level={4} className="margin-0">Riwayat Mutasi Stok</Title>
                    <p className="text-muted margin-0">Catatan pergerakan barang keluar masuk. Data bersifat Read-Only (Audit Trail).</p>
                </div>
                <Button 
                    type="primary" 
                    icon={<PlusOutlined />} 
                    onClick={() => setModalVisible(true)}
                >
                    Catat Mutasi
                </Button>
            </div>
            
            <Table 
                columns={columns} 
                dataSource={data} 
                rowKey="id" 
                loading={loading}
                pagination={{ defaultPageSize: 10 }}
            />

            <MovementModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onSuccess={() => {
                    setModalVisible(false);
                    message.success('Mutasi berhasil dicatat');
                    fetchData();
                }}
            />

            <MovementDetailModal
                visible={detailModalVisible}
                onClose={() => setDetailModalVisible(false)}
                data={detailData}
            />
        </div>
    );
};

export default StockMovementList;
