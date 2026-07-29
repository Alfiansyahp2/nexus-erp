import React from 'react';
import { Card, Typography } from 'antd';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const { Title } = Typography;

const DashboardBarChart = ({ title, data, dataKeyX, dataBars, height = 300, loading = false }) => {
    return (
        <Card 
            bordered={false} 
            loading={loading}
            style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}
        >
            <Title level={5} style={{ marginBottom: 24 }}>{title}</Title>
            <div style={{ width: '100%', height: height }}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={data}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey={dataKeyX} />
                        <YAxis />
                        <Tooltip 
                            cursor={{ fill: 'transparent' }}
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        />
                        <Legend iconType="circle" />
                        {dataBars.map((bar, index) => (
                            <Bar 
                                key={index} 
                                dataKey={bar.key} 
                                name={bar.name} 
                                fill={bar.color} 
                                radius={[4, 4, 0, 0]} 
                                barSize={bar.barSize || 32}
                            />
                        ))}
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
};

export default DashboardBarChart;
