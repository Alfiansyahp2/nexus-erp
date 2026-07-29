import React from 'react';
import { Typography, Card } from 'antd';

const { Title, Text } = Typography;

const HRDashboard = () => {
    return (
        <div>
            <Title level={3}>HR Dashboard</Title>
            <Card>
                <Text>Ringkasan kehadiran karyawan dan permohonan cuti akan ditampilkan di sini.</Text>
            </Card>
        </div>
    );
};

export default HRDashboard;
