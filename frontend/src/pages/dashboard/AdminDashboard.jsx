import React from 'react';
import { Typography, Card } from 'antd';

const { Title, Text } = Typography;

const AdminDashboard = () => {
    return (
        <div>
            <Title level={3}>Admin Dashboard</Title>
            <Card>
                <Text>Ringkasan global perusahaan akan ditampilkan di sini.</Text>
            </Card>
        </div>
    );
};

export default AdminDashboard;
