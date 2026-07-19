import React, { useState, useEffect } from 'react';
import { Table, message, Typography, Tag } from 'antd';
import api from '../../api/axiosConfig';

const { Title } = Typography;

const StockBalanceList = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await api.get('/inventory/stock-balances/');
            setData(response.data);
        } catch (error) {
            message.error('Gagal mengambil data saldo stok');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const columns = [
        {
            title: 'Gudang',
            dataIndex: 'warehouse_name',
            key: 'warehouse_name',
        },
        {
            title: 'Kode Produk',
            dataIndex: 'product_code',
            key: 'product_code',
        },
        {
            title: 'Nama Produk',
            dataIndex: 'product_name',
            key: 'product_name',
        },
        {
            title: 'Saldo Kuantitas',
            dataIndex: 'quantity',
            key: 'quantity',
            align: 'right',
            render: (val) => {
                const qty = parseFloat(val);
                let color = 'green';
                if (qty === 0) color = 'orange';
                if (qty < 0) color = 'red';
                return (
                    <Tag color={color} style={{ fontSize: '14px', padding: '4px 10px' }}>
                        {qty.toLocaleString('id-ID')}
                    </Tag>
                );
            }
        },
        {
            title: 'Pembaruan Terakhir',
            dataIndex: 'last_updated',
            key: 'last_updated',
            render: (val) => new Date(val).toLocaleString('id-ID')
        }
    ];

    return (
        <div style={{ background: '#fff', padding: 24, borderRadius: 8, minHeight: '100%' }}>
            <div style={{ marginBottom: 16 }}>
                <Title level={4} style={{ margin: 0 }}>Saldo Stok Barang (Stock Balance)</Title>
                <p style={{ color: '#888', marginTop: 4 }}>Daftar jumlah saldo barang terkini di seluruh gudang. Data ini dihitung otomatis dari riwayat mutasi.</p>
            </div>
            
            <Table 
                columns={columns} 
                dataSource={data} 
                rowKey="id" 
                loading={loading}
                pagination={{ defaultPageSize: 10 }}
            />
        </div>
    );
};

export default StockBalanceList;
