import React from 'react';
import { Modal, Descriptions, Table, Tag } from 'antd';
import dayjs from 'dayjs';

const JournalDetailModal = ({ visible, onClose, data, accounts }) => {
    if (!data) return null;

    const itemsColumns = [
        {
            title: 'Akun',
            dataIndex: 'account',
            render: (accId) => {
                const account = accounts.find(a => a.id === accId);
                return account ? `${account.account_code} - ${account.name}` : accId;
            }
        },
        {
            title: 'Keterangan',
            dataIndex: 'description',
        },
        {
            title: 'Debit',
            dataIndex: 'debit',
            align: 'right',
            render: (val) => `Rp ${parseFloat(val).toLocaleString('id-ID')}`
        },
        {
            title: 'Kredit',
            dataIndex: 'credit',
            align: 'right',
            render: (val) => `Rp ${parseFloat(val).toLocaleString('id-ID')}`
        }
    ];

    const totalDebit = data.items.reduce((acc, item) => acc + parseFloat(item.debit), 0);
    const totalCredit = data.items.reduce((acc, item) => acc + parseFloat(item.credit), 0);

    return (
        <Modal
            title="Detail Jurnal Umum"
            open={visible}
            onCancel={onClose}
            footer={null}
            width={800}
        >
            <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Descriptions bordered column={2} size="small" style={{ flex: 1 }}>
                    <Descriptions.Item label="No. Referensi" span={2}><strong>{data.reference_number}</strong></Descriptions.Item>
                    <Descriptions.Item label="Tanggal">{dayjs(data.date).format('DD MMMM YYYY')}</Descriptions.Item>
                    <Descriptions.Item label="Status">
                        <Tag color={data.status === 'POSTED' ? 'green' : 'orange'}>
                            {data.status}
                        </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Keterangan" span={2}>{data.description}</Descriptions.Item>
                </Descriptions>
            </div>

            <Table 
                dataSource={data.items}
                columns={itemsColumns}
                rowKey="id"
                pagination={false}
                size="middle"
                summary={() => (
                    <Table.Summary.Row style={{ background: '#fafafa', fontWeight: 'bold' }}>
                        <Table.Summary.Cell colSpan={2} align="right">Total</Table.Summary.Cell>
                        <Table.Summary.Cell align="right">Rp {totalDebit.toLocaleString('id-ID')}</Table.Summary.Cell>
                        <Table.Summary.Cell align="right">Rp {totalCredit.toLocaleString('id-ID')}</Table.Summary.Cell>
                    </Table.Summary.Row>
                )}
            />
        </Modal>
    );
};

export default JournalDetailModal;
