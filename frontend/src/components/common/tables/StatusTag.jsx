import React from 'react';
import { Tag, Badge } from 'antd';
import {
    CheckCircleOutlined,
    ClockCircleOutlined,
    CloseCircleOutlined,
    SyncOutlined,
    ExclamationCircleOutlined,
    SendOutlined,
    ShoppingCartOutlined,
    InboxOutlined,
    DollarOutlined
} from '@ant-design/icons';

/**
 * Universal StatusTag / Badge component for standardizing status colors, icons,
 * and labels across all ERP modules (HR, Finance, Purchasing, Inventory).
 * 
 * @param {string|boolean} status - Status code or boolean value
 * @param {string} type - 'tag' (default, solid/bordered tag) or 'badge' (dot badge)
 * @param {string} customLabel - Override display text
 */
const StatusTag = ({ status, type = 'tag', customLabel, style = {} }) => {
    // Handle boolean values (e.g. is_active)
    if (typeof status === 'boolean') {
        if (type === 'badge') {
            return status ? <Badge status="success" text={customLabel || "Aktif"} /> : <Badge status="error" text={customLabel || "Non-aktif"} />;
        }
        return status 
            ? <Tag color="success" icon={<CheckCircleOutlined />} style={style}>{customLabel || "Aktif"}</Tag>
            : <Tag color="error" icon={<CloseCircleOutlined />} style={style}>{customLabel || "Non-aktif"}</Tag>;
    }

    if (!status) return <Tag color="default">-</Tag>;

    const upperStatus = String(status).toUpperCase().trim();

    let color = "default";
    let icon = null;
    let label = status;

    switch (upperStatus) {
        // --- Document / Workflow Status ---
        case 'DRAFT':
            color = "default";
            icon = <ClockCircleOutlined />;
            label = "Draft";
            break;
        case 'SUBMITTED':
        case 'PENDING':
        case 'WAITING_APPROVAL':
            color = "processing";
            icon = <SyncOutlined spin />;
            label = "Menunggu Persetujuan";
            break;
        case 'APPROVED':
            color = "success";
            icon = <CheckCircleOutlined />;
            label = "Disetujui";
            break;
        case 'REJECTED':
            color = "error";
            icon = <CloseCircleOutlined />;
            label = "Ditolak";
            break;
        case 'CANCELLED':
            color = "error";
            icon = <CloseCircleOutlined />;
            label = "Dibatalkan";
            break;

        // --- Purchasing Status ---
        case 'PO_CREATED':
            color = "purple";
            icon = <ShoppingCartOutlined />;
            label = "PO Created";
            break;
        case 'SENT':
            color = "processing";
            icon = <SendOutlined />;
            label = "Sent to Vendor";
            break;
        case 'CONFIRMED':
            color = "cyan";
            icon = <CheckCircleOutlined />;
            label = "Confirmed (Waiting GRN)";
            break;
        case 'COMPLETED':
        case 'DONE':
            color = "success";
            icon = <InboxOutlined />;
            label = upperStatus === 'DONE' ? "Done (Stok Masuk & AP)" : "Completed (Received)";
            break;

        // --- Finance Status ---
        case 'OPEN':
        case 'UNPAID':
            color = "warning";
            icon = <ExclamationCircleOutlined />;
            label = "Belum Lunas (Open)";
            break;
        case 'PAID':
        case 'SETTLED':
            color = "success";
            icon = <DollarOutlined />;
            label = "Lunas (Paid)";
            break;
        case 'PARTIAL':
            color = "orange";
            icon = <ClockCircleOutlined />;
            label = "Sebagian (Partial)";
            break;
        case 'POSTED':
            color = "blue";
            icon = <CheckCircleOutlined />;
            label = "Posted";
            break;

        // --- General ---
        case 'ACTIVE':
        case 'AKTIF':
            color = "success";
            icon = <CheckCircleOutlined />;
            label = "Aktif";
            break;
        case 'INACTIVE':
        case 'NON-AKTIF':
            color = "error";
            icon = <CloseCircleOutlined />;
            label = "Non-aktif";
            break;
        default:
            color = "blue";
            label = status;
            break;
    }

    const displayLabel = customLabel || label;

    if (type === 'badge') {
        const badgeStatusMap = {
            success: 'success',
            error: 'error',
            processing: 'processing',
            warning: 'warning',
            default: 'default',
            blue: 'processing',
            cyan: 'processing',
            purple: 'processing'
        };
        return <Badge status={badgeStatusMap[color] || 'default'} text={displayLabel} style={style} />;
    }

    return (
        <Tag color={color} icon={icon} style={{ borderRadius: 4, padding: '2px 8px', ...style }}>
            {displayLabel}
        </Tag>
    );
};

export default StatusTag;
