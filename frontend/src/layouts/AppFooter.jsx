import React from 'react';
import { Layout, Typography, Space, Tag, Divider } from 'antd';
import { 
    CheckCircleFilled, 
    QuestionCircleOutlined
} from '@ant-design/icons';

const { Footer } = Layout;
const { Text, Link } = Typography;

const AppFooter = () => {
    const currentYear = new Date().getFullYear();

    return (
        <Footer 
            style={{ 
                background: 'transparent', 
                padding: '20px 8px 12px 8px', 
                marginTop: '24px',
                borderTop: '1px solid rgba(0, 0, 0, 0.06)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px',
                fontSize: '13px'
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <Text type="secondary" style={{ fontWeight: 500 }}>
                    © {currentYear} Modern ERP Enterprise.
                </Text>
                <Tag color="blue" variant="filled" style={{ margin: 0, borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>
                    v2.4.0 PRO
                </Tag>
                <Tag color="success" variant="filled" style={{ margin: 0, borderRadius: '4px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <CheckCircleFilled style={{ color: '#52c41a' }} /> RBAC Guard Active
                </Tag>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ 
                        width: '8px', 
                        height: '8px', 
                        borderRadius: '50%', 
                        backgroundColor: '#52c41a', 
                        display: 'inline-block',
                        boxShadow: '0 0 8px #52c41a'
                    }} />
                    <Text type="secondary" style={{ fontSize: '13px' }}>System Status: </Text>
                    <Text style={{ color: '#52c41a', fontWeight: 600, fontSize: '13px' }}>Optimal</Text>
                </span>
                
                <Divider orientation="vertical" style={{ borderColor: 'rgba(0,0,0,0.1)' }} />
                
                <Space size="middle">
                    <Link href="#help" type="secondary" style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <QuestionCircleOutlined /> Bantuan & Panduan
                    </Link>
                    <Link href="#privacy" type="secondary" style={{ fontSize: '13px' }}>
                        Privasi & Keamanan
                    </Link>
                </Space>
            </div>
        </Footer>
    );
};

export default AppFooter;
