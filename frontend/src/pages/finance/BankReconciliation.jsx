import React, { useState, useEffect } from 'react';
import { Table, Card, Typography, Space, Button, message } from 'antd';
import { SyncOutlined, AuditOutlined, UploadOutlined, FileSearchOutlined, DownloadOutlined } from '@ant-design/icons';
import api from '../../api/axiosConfig';
import BankStatementModal from '../../components/modals/finance/BankStatementModal';
import Can from '../../components/Can';
import TableSearch, { filterTableData } from '../../components/TableSearch';

const { Title, Paragraph } = Typography;

const BankReconciliation = () => {
    const [statements, setStatements] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [searchText, setSearchText] = useState("");

    const filteredStatements = filterTableData(statements, searchText);

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
            <div className="table-toolbar">
                <Title level={3} style={{ margin: 0 }}>
                    <AuditOutlined style={{ marginRight: 8 }} />
                    Bank Reconciliation
                </Title>
                <div className="table-toolbar-actions">
                    <Button icon={<SyncOutlined />} onClick={fetchStatements} loading={loading}>Refresh</Button>
                    <Can access="finance.bank_statement.create">
                        <Button type="primary" icon={<DownloadOutlined />} onClick={() => setIsModalVisible(true)}>Import Rekening Koran</Button>
                    </Can>
                </div>
            </div>
            
            <Paragraph style={{color: 'gray'}}>
                Fitur ini digunakan untuk mencocokkan (reconcile) saldo mutasi bank aktual dengan catatan Jurnal Entry di dalam sistem.
            </Paragraph>

            <Card className="card-custom">
                <div className="table-search-row">
                    <TableSearch value={searchText} onChange={(e) => setSearchText(e.target.value)} placeholder="Cari nomor statement atau saldo..." />
                </div>
                <Table columns={columns} dataSource={filteredStatements} rowKey="id" loading={loading} />
            </Card>

            <BankStatementModal 
                visible={isModalVisible} 
                onClose={() => setIsModalVisible(false)}
                onSuccess={() => {
                    setIsModalVisible(false);
                    fetchStatements();
                }}
            />
        </div>
    );
};

export default BankReconciliation;
