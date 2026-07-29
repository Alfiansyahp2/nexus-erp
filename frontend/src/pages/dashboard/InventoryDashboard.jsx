import React from 'react';
import { Typography, Card } from 'antd';

const { Title, Text } = Typography;

const InventoryDashboard = () => {
    return (
        <div>
            <Title level={3}>Inventory Dashboard</Title>
            <Card>
                <Text>Ringkasan pergerakan stok, barang menipis, dan nilai gudang akan ditampilkan di sini.</Text>
            </Card>
        </div>
    );
};

export default InventoryDashboard;
