import React, { useState, useEffect } from 'react';
import { message } from 'antd';
import api from '../../api/axiosConfig';
import FixedAssetModal from '../../components/modals/finance/FixedAssetModal';
import { DataTable, TableActions } from '../../components/common';

const FixedAssets = () => {
    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [searchText, setSearchText] = useState("");

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
        <>
            <DataTable
                title="Fixed Assets (Aset Tetap)"
                addText="Registrasi Aset Baru"
                onAdd={() => setIsModalVisible(true)}
                addPermission="finance.fixed_asset.create"
                searchText={searchText}
                setSearchText={setSearchText}
                searchPlaceholder="Cari kode atau nama aset..."
                columns={columns}
                dataSource={assets}
                loading={loading}
                scroll={{ x: 'max-content' }}
            />

            <FixedAssetModal 
                visible={isModalVisible} 
                onClose={() => setIsModalVisible(false)}
                onSuccess={() => {
                    setIsModalVisible(false);
                    fetchAssets();
                }}
            />
        </>
    );
};

export default FixedAssets;
