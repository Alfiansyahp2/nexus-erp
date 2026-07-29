import React from 'react';
import { Card, Statistic } from 'antd';

const DashboardMetricCard = ({ title, value, prefix, suffix, color, loading = false }) => {
    return (
        <Card 
            bordered={false} 
            loading={loading}
            style={{ height: '100%', boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}
        >
            <Statistic
                title={title}
                value={value}
                prefix={prefix}
                suffix={suffix}
                valueStyle={{ color: color }}
            />
        </Card>
    );
};

export default DashboardMetricCard;
