import React, { useState, useEffect } from 'react';
import { Table, Card, Typography, Space, Button, message } from 'antd';
import { SyncOutlined, ToolOutlined, PlusOutlined } from '@ant-design/icons';
import api from '../../api/axiosConfig';
import FixedAssetModal from '../../components/modals/finance/FixedAssetModal';
import Can from '../../components/Can';
import TableSearch, { filterTableData } from '../../components/TableSearch';

const { Title } = Typography;

const FixedAssets = () => {
    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [searchText, setSearchText] = useState("");

    const filteredAssets = filterTableData(assets, searchText);

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
            <div className="table-toolbar">
                <Title level={3} style={{ margin: 0 }}>
                    <ToolOutlined style={{ marginRight: 8 }} />
                    Fixed Assets (Aset Tetap)
                </Title>
                <div className="table-toolbar-actions">
                    <Button icon={<SyncOutlined />} onClick={fetchAssets} loading={loading}>Refresh</Button>
                    <Can access="finance.fixed_asset.create">
                        <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalVisible(true)}>Registrasi Aset Baru</Button>
                    </Can>
                </div>
            </div>
            <Card className="card-custom">
                <div className="table-search-row">
                    <TableSearch value={searchText} onChange={(e) => setSearchText(e.target.value)} placeholder="Cari kode atau nama aset..." />
                </div>
                <Table columns={columns} dataSource={filteredAssets} rowKey="id" loading={loading} />
            </Card>

            <FixedAssetModal 
                visible={isModalVisible} 
                onClose={() => setIsModalVisible(false)}
                onSuccess={() => {
                    setIsModalVisible(false);
                    fetchAssets();
                }}
            />
        </div>
    );
};

export default FixedAssets;
