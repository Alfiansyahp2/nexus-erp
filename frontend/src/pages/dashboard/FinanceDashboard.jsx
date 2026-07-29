import React from 'react';
import { Typography, Card } from 'antd';

const { Title, Text } = Typography;

const FinanceDashboard = () => {
    return (
        <div>
            <Title level={3}>Finance Dashboard</Title>
            <Card>
                <Text>Ringkasan arus kas, invoice tertunggak, dan pengeluaran akan ditampilkan di sini.</Text>
            </Card>
        </div>
    );
};

export default FinanceDashboard;
