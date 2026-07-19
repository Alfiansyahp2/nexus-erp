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
            dataIndex: 'warehouse_name', sorter: (a, b) => { const vA = a['warehouse_name'] ?? ''; const vB = b['warehouse_name'] ?? ''; if (typeof vA === 'number' && typeof vB === 'number') return vA - vB; return String(vA).localeCompare(String(vB)); },
            key: 'warehouse_name',
        },
        {
            title: 'Kode Produk',
            dataIndex: 'product_code', sorter: (a, b) => { const vA = a['product_code'] ?? ''; const vB = b['product_code'] ?? ''; if (typeof vA === 'number' && typeof vB === 'number') return vA - vB; return String(vA).localeCompare(String(vB)); },
            key: 'product_code',
        },
        {
            title: 'Nama Produk',
            dataIndex: 'product_name', sorter: (a, b) => { const vA = a['product_name'] ?? ''; const vB = b['product_name'] ?? ''; if (typeof vA === 'number' && typeof vB === 'number') return vA - vB; return String(vA).localeCompare(String(vB)); },
            key: 'product_name',
        },
        {
            title: 'Saldo Kuantitas',
            dataIndex: 'quantity', sorter: (a, b) => { const vA = a['quantity'] ?? ''; const vB = b['quantity'] ?? ''; if (typeof vA === 'number' && typeof vB === 'number') return vA - vB; return String(vA).localeCompare(String(vB)); },
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
            dataIndex: 'last_updated', sorter: (a, b) => { const vA = a['last_updated'] ?? ''; const vB = b['last_updated'] ?? ''; if (typeof vA === 'number' && typeof vB === 'number') return vA - vB; return String(vA).localeCompare(String(vB)); },
            key: 'last_updated',
            render: (val) => new Date(val).toLocaleString('id-ID')
        }
    ];

    return (
        <div className="page-container">
            <div style={{ marginBottom: 16 }}>
                <Title level={4} className="margin-0">Saldo Stok Barang (Stock Balance)</Title>
                <p className="text-muted">Daftar jumlah saldo barang terkini di seluruh gudang. Data ini dihitung otomatis dari riwayat mutasi.</p>
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
