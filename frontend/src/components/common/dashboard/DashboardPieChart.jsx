import React from 'react';
import { Card, Typography } from 'antd';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const { Title } = Typography;

const DashboardPieChart = ({ title, data, dataKey = "value", nameKey = "name", colors, height = 300, loading = false }) => {
    
    // Default pleasant color palette if none provided
    const defaultColors = ['#1677ff', '#52c41a', '#faad14', '#f5222d', '#722ed1', '#13c2c2', '#eb2f96', '#fa8c16'];
    const activeColors = colors || defaultColors;

    return (
        <Card 
            variant="borderless" 
            loading={loading}
            style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.03)', height: '100%' }}
        >
            <Title level={5} style={{ marginBottom: 24, fontWeight: 600 }}>{title}</Title>
            <div style={{ width: '100%', height: height, display: 'flex', justifyContent: 'center' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={5}
                            dataKey={dataKey}
                            nameKey={nameKey}
                        >
                            {data?.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={activeColors[index % activeColors.length]} />
                            ))}
                        </Pie>
                        <Tooltip 
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                            itemStyle={{ fontWeight: 600 }}
                        />
                        <Legend iconType="circle" layout="horizontal" verticalAlign="bottom" />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
};

export default DashboardPieChart;
