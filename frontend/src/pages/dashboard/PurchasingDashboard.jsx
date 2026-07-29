import React from 'react';
import { Typography, Card } from 'antd';

const { Title, Text } = Typography;

const PurchasingDashboard = () => {
    return (
        <div>
            <Title level={3}>Purchasing Dashboard</Title>
            <Card>
                <Text>Ringkasan status Purchase Order (PO) dan pengeluaran pembelian akan ditampilkan di sini.</Text>
            </Card>
        </div>
    );
};

export default PurchasingDashboard;
