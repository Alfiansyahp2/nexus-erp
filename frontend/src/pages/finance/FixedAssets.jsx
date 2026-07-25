import React, { useState, useEffect } from 'react';
import { Table, Card, Typography, Space, Button, message } from 'antd';
import { SyncOutlined, ToolOutlined } from '@ant-design/icons';
import api from '../../api/axiosConfig';

const { Title } = Typography;

const FixedAssets = () => {
    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchAssets = async () => {
        setLoading(true);
        try {
            const response = await api.get('finance/fixed-assets/');
            setAssets(response.data);
        } catch (error) {
            message.error('Gagal mengambil data aset tetap');
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchAssets();
    }, []);

    const columns = [
        { title: 'Kode Aset', dataIndex: 'asset_code', key: 'asset_code', render: (text) => <strong>{text}</strong> },
        { title: 'Nama Aset', dataIndex: 'asset_name', key: 'asset_name' },
        { title: 'Tgl Beli', dataIndex: 'purchase_date', key: 'purchase_date' },
        { title: 'Nilai Beli', dataIndex: 'purchase_value', key: 'purchase_value', render: (val) => `Rp ${parseFloat(val).toLocaleString('id-ID')}` },
        { title: 'Umur Ekonomis (Bulan)', dataIndex: 'useful_life_months', key: 'useful_life_months' },
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Title level={3} style={{ margin: 0 }}>
                    <ToolOutlined style={{ marginRight: 8 }} />
                    Fixed Assets (Aset Tetap)
                </Title>
                <Space>
                    <Button icon={<SyncOutlined />} onClick={fetchAssets} loading={loading}>Refresh</Button>
                    <Button type="primary">Registrasi Aset Baru</Button>
                </Space>
            </div>
            <Card className="card-custom">
                <Table columns={columns} dataSource={assets} rowKey="id" loading={loading} />
            </Card>
        </div>
    );
};

export default FixedAssets;
