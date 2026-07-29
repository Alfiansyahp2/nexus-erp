import React from 'react';
import { Card, Table, Typography } from 'antd';

const { Title } = Typography;

const RecentActivityTable = ({ title, columns, data, loading = false, rowKey = "id" }) => {
    return (
        <Card 
            variant="borderless" 
            loading={loading}
            style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.03)', height: '100%' }}
            bodyStyle={{ padding: '0 24px 24px 24px' }}
        >
            <div style={{ padding: '24px 0', borderBottom: '1px solid #f0f0f0', marginBottom: 16 }}>
                <Title level={5} style={{ margin: 0, fontWeight: 600 }}>{title}</Title>
            </div>
            <Table 
                columns={columns} 
                dataSource={data} 
                pagination={false} 
                rowKey={rowKey}
                size="middle"
            />
        </Card>
    );
};

export default RecentActivityTable;
