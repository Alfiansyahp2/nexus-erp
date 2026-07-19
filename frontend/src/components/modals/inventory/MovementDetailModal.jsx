import React from 'react';
import { Modal, Descriptions, Tag } from 'antd';
import dayjs from 'dayjs';

const MovementDetailModal = ({ visible, onClose, data }) => {
    if (!data) return null;

    const renderMovementType = (type) => {
        const colors = {
            'IN': 'green',
            'OUT': 'red',
            'TRANSFER': 'blue',
            'ADJUSTMENT': 'orange'
        };
        return <Tag color={colors[type] || 'default'}>{type}</Tag>;
    };

    return (
        <Modal
            title="Detail Mutasi Stok"
            open={visible}
            onCancel={onClose}
            footer={null}
            width={600}
        >
            <Descriptions bordered column={1} size="small" style={{ marginTop: 16 }}>
                <Descriptions.Item label="No. Referensi">{data.reference_number}</Descriptions.Item>
                <Descriptions.Item label="Tanggal">{dayjs(data.date).format('DD MMMM YYYY')}</Descriptions.Item>
                <Descriptions.Item label="Produk">{data.product_name}</Descriptions.Item>
                <Descriptions.Item label="Gudang">{data.warehouse_name}</Descriptions.Item>
                <Descriptions.Item label="Jenis Mutasi">{renderMovementType(data.movement_type)}</Descriptions.Item>
                <Descriptions.Item label="Kuantitas">{parseFloat(data.quantity).toLocaleString('id-ID')}</Descriptions.Item>
                <Descriptions.Item label="Catatan">{data.notes || '-'}</Descriptions.Item>
                <Descriptions.Item label="Waktu Dicatat">{dayjs(data.created_at).format('DD MMMM YYYY, HH:mm:ss')}</Descriptions.Item>
            </Descriptions>
        </Modal>
    );
};

export default MovementDetailModal;
