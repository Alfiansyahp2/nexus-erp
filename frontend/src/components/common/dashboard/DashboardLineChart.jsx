import React from 'react';
import { Card, Typography } from 'antd';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const { Title } = Typography;

const DashboardLineChart = ({ title, data, dataKeyX, lines, height = 300, loading = false }) => {
    return (
        <Card 
            variant="borderless" 
            loading={loading}
            style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.03)', height: '100%' }}
        >
            <Title level={5} style={{ marginBottom: 24, fontWeight: 600 }}>{title}</Title>
            <div style={{ width: '100%', height: height }}>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                        data={data}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis dataKey={dataKeyX} axisLine={false} tickLine={false} tick={{fill: '#8c8c8c'}} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#8c8c8c'}} dx={-10} />
                        <Tooltip 
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        />
                        <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                        {lines.map((line, index) => (
                            <Line 
                                key={index} 
                                type="monotone"
                                dataKey={line.key} 
                                name={line.name} 
                                stroke={line.color} 
                                strokeWidth={3}
                                activeDot={{ r: 6 }}
                                dot={false}
                            />
                        ))}
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
};

export default DashboardLineChart;
