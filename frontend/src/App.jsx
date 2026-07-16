import React, { useState } from 'react';
import { Layout, Menu, Typography, theme } from 'antd';
import { DesktopOutlined, TeamOutlined, UserOutlined } from '@ant-design/icons';

const { Header, Content, Footer, Sider } = Layout;
const { Title, Paragraph } = Typography;

function getItem(label, key, icon, children) {
  return {
    key,
    icon,
    children,
    label,
  };
}

const items = [
  getItem('Dashboard', '1', <DesktopOutlined />),
  getItem('Human Resources', 'sub1', <UserOutlined />, [
    getItem('Karyawan', '3'),
    getItem('Absensi', '4'),
    getItem('Penggajian', '5'),
  ]),
  getItem('Pengaturan', '9', <TeamOutlined />),
];

const App = () => {
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
        <div style={{ height: 32, margin: 16, background: 'rgba(255, 255, 255, 0.2)', borderRadius: 6 }} />
        <Menu theme="dark" defaultSelectedKeys={['1']} mode="inline" items={items} />
      </Sider>
      <Layout>
        <Header style={{ padding: 0, background: colorBgContainer }} />
        <Content style={{ margin: '0 16px' }}>
          <div
            style={{
              padding: 24,
              minHeight: 360,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
              marginTop: 16
            }}
          >
            <Title level={2}>Selamat Datang di Sistem ERP</Title>
            <Paragraph>
              Ini adalah kerangka dasar frontend React.js Anda yang telah terintegrasi dengan <strong>Ant Design</strong>.
              Struktur ini siap untuk dikembangkan menjadi berbagai macam modul seperti HR, Finance, dan lainnya.
            </Paragraph>
          </div>
        </Content>
        <Footer style={{ textAlign: 'center' }}>ERP System ©2026 Created with Ant Design & Django</Footer>
      </Layout>
    </Layout>
  );
};

export default App;
