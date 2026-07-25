import React, { useState, useEffect } from 'react';
import { Table, Card, Typography, Space, Button, message } from 'antd';
import { SyncOutlined, AuditOutlined, UploadOutlined } from '@ant-design/icons';
import api from '../../api/axiosConfig';

const { Title, Paragraph } = Typography;

const BankReconciliation = () => {
    const [statements, setStatements] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchStatements = async () => {
        setLoading(true);
        try {
            const response = await api.get('finance/bank-statements/');
            setStatements(response.data);
        } catch (error) {
            message.error('Gagal mengambil data rekening koran');
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchStatements();
    }, []);

    const columns = [
        { title: 'Nomor Statement', dataIndex: 'statement_number', key: 'statement_number' },
        { title: 'Periode Mulai', dataIndex: 'date_start', key: 'date_start' },
        { title: 'Periode Berakhir', dataIndex: 'date_end', key: 'date_end' },
        { title: 'Saldo Awal', dataIndex: 'starting_balance', key: 'starting_balance', render: (val) => `Rp ${parseFloat(val).toLocaleString('id-ID')}` },
        { title: 'Saldo Akhir', dataIndex: 'ending_balance', key: 'ending_balance', render: (val) => `Rp ${parseFloat(val).toLocaleString('id-ID')}` },
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Title level={3} style={{ margin: 0 }}>
                    <AuditOutlined style={{ marginRight: 8 }} />
                    Bank Reconciliation
                </Title>
                <Space>
                    <Button icon={<SyncOutlined />} onClick={fetchStatements} loading={loading}>Refresh</Button>
                    <Button type="primary" icon={<UploadOutlined />}>Import Rekening Koran</Button>
                </Space>
            </div>
            
            <Paragraph style={{color: 'gray'}}>
                Fitur ini digunakan untuk mencocokkan (reconcile) saldo mutasi bank aktual dengan catatan Jurnal Entry di dalam sistem.
            </Paragraph>

            <Card className="card-custom">
                <Table columns={columns} dataSource={statements} rowKey="id" loading={loading} />
            </Card>
        </div>
    );
};

export default BankReconciliation;
