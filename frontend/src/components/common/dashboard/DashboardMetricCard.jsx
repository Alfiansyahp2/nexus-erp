import React from 'react';
import { Card, Statistic, Typography } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';

const { Text } = Typography;

const DashboardMetricCard = ({ title, value, prefix, suffix, color, trend, trendLabel, loading = false }) => {
    const isPositive = trend && trend >= 0;
    const trendColor = isPositive ? '#52c41a' : '#f5222d';

    return (
        <Card 
            variant="borderless" 
            loading={loading}
            style={{ height: '100%', boxShadow: '0 1px 2px rgba(0,0,0,0.03)', position: 'relative', overflow: 'hidden' }}
        >
            <Statistic
                title={<span style={{ fontWeight: 500, color: '#8c8c8c' }}>{title}</span>}
                value={value}
                prefix={prefix}
                suffix={suffix}
                styles={{ content: { color: color, fontWeight: 600, fontSize: '28px' } }}
            />
            {trend !== undefined && (
                <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Text style={{ color: trendColor, fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                        {isPositive ? <ArrowUpOutlined /> : <ArrowDownOutlined />} {Math.abs(trend)}%
                    </Text>
                    {trendLabel && <Text type="secondary" style={{ fontSize: '12px' }}>{trendLabel}</Text>}
                </div>
            )}
            
            {/* Background decorative element */}
            <div style={{
                position: 'absolute',
                top: -20,
                right: -20,
                fontSize: '120px',
                opacity: 0.05,
                color: color,
                pointerEvents: 'none'
            }}>
                {prefix}
            </div>
        </Card>
    );
};

export default DashboardMetricCard;
