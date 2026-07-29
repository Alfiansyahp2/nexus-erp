import React from 'react';
import { Typography, Card } from 'antd';

const { Title, Text } = Typography;

const SalesDashboard = () => {
    return (
        <div>
            <Title level={3}>Sales Dashboard</Title>
            <Card>
                <Text>Ringkasan performa penjualan bulanan dan status Sales Order (SO) akan ditampilkan di sini.</Text>
            </Card>
        </div>
    );
};

export default SalesDashboard;
