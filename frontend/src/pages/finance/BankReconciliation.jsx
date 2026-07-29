import React, { useState, useEffect } from 'react';
import { message, Typography } from 'antd';
import api from '../../api/axiosConfig';
import BankStatementModal from '../../components/modals/finance/BankStatementModal';
import { DataTable, TableActions } from '../../components/common';

const { Paragraph } = Typography;

const BankReconciliation = () => {
    const [statements, setStatements] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [searchText, setSearchText] = useState("");

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
        <>
            <Paragraph style={{color: 'gray'}}>
                Fitur ini digunakan untuk mencocokkan (reconcile) saldo mutasi bank aktual dengan catatan Jurnal Entry di dalam sistem.
            </Paragraph>

            <DataTable
                title="Bank Reconciliation"
                addText="Import Rekening Koran"
                onAdd={() => setIsModalVisible(true)}
                addPermission="finance.bank_statement.create"
                searchText={searchText}
                setSearchText={setSearchText}
                searchPlaceholder="Cari nomor statement atau saldo..."
                columns={columns}
                dataSource={statements}
                loading={loading}
                scroll={{ x: 'max-content' }}
            />

            <BankStatementModal 
                visible={isModalVisible} 
                onClose={() => setIsModalVisible(false)}
                onSuccess={() => {
                    setIsModalVisible(false);
                    fetchStatements();
                }}
            />
        </>
    );
};

export default BankReconciliation;
