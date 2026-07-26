import React from 'react';
import { Space, Button, Popconfirm, Tooltip } from 'antd';
import {
    EditOutlined,
    DeleteOutlined,
    EyeOutlined,
    CheckCircleOutlined
} from '@ant-design/icons';
import Can from '../Can';

/**
 * Reusable TableActions component to standardize table action buttons (Edit, Delete, View, Confirm)
 * with integrated RBAC permission checking (<Can access="...">) and deletion/confirmation safety prompts.
 * 
 * @param {function} onEdit - Callback when edit button is clicked
 * @param {function} onDelete - Callback when delete button is confirmed
 * @param {function} onView - Callback when view details button is clicked
 * @param {function} onConfirm - Callback when primary confirmation action is confirmed
 * @param {string} editPermission - RBAC permission slug required for edit button
 * @param {string} deletePermission - RBAC permission slug required for delete button
 * @param {string} viewPermission - RBAC permission slug required for view button
 * @param {string} confirmPermission - RBAC permission slug required for confirm button
 * @param {string} deleteTitle - Title for delete confirmation (default: "Hapus Data Ini?")
 * @param {string} deleteDescription - Description for delete popconfirm
 * @param {string} confirmTitle - Title for confirm action popconfirm
 * @param {string} confirmDescription - Description for confirm popconfirm
 * @param {string} confirmText - Label text for confirm button
 * @param {React.ReactNode} confirmIcon - Icon for confirm button
 * @param {string} confirmColor - Hex color for confirm button
 * @param {React.ReactNode} extra - Additional custom action buttons to render in the space
 */
const TableActions = ({
    onEdit,
    onDelete,
    onView,
    onConfirm,
    editPermission,
    deletePermission,
    viewPermission,
    confirmPermission,
    deleteTitle = "Hapus Data Ini?",
    deleteDescription = "Data yang dihapus tidak dapat dikembalikan.",
    confirmTitle = "Lakukan Konfirmasi?",
    confirmDescription,
    confirmText = "Konfirmasi",
    confirmIcon = <CheckCircleOutlined />,
    confirmColor = "#52c41a",
    extra = null,
    size = "small",
    spaceSize = "small",
    style = {}
}) => {
    return (
        <Space size={spaceSize} wrap style={style}>
            {/* View Details Button */}
            {onView && (
                viewPermission ? (
                    <Can access={viewPermission}>
                        <Tooltip title="Lihat Detail">
                            <Button
                                type="default"
                                icon={<EyeOutlined />}
                                size={size}
                                onClick={onView}
                            />
                        </Tooltip>
                    </Can>
                ) : (
                    <Tooltip title="Lihat Detail">
                        <Button
                            type="default"
                            icon={<EyeOutlined />}
                            size={size}
                            onClick={onView}
                        />
                    </Tooltip>
                )
            )}

            {/* Edit Button */}
            {onEdit && (
                editPermission ? (
                    <Can access={editPermission}>
                        <Tooltip title="Ubah Data">
                            <Button
                                type="primary"
                                ghost
                                icon={<EditOutlined />}
                                size={size}
                                onClick={onEdit}
                            />
                        </Tooltip>
                    </Can>
                ) : (
                    <Tooltip title="Ubah Data">
                        <Button
                            type="primary"
                            ghost
                            icon={<EditOutlined />}
                            size={size}
                            onClick={onEdit}
                        />
                    </Tooltip>
                )
            )}

            {/* Confirm / Primary Action Button */}
            {onConfirm && (
                confirmPermission ? (
                    <Can access={confirmPermission}>
                        <Popconfirm
                            title={confirmTitle}
                            description={confirmDescription}
                            onConfirm={onConfirm}
                            okText="Ya, Konfirmasi"
                            cancelText="Batal"
                        >
                            <Button
                                type="primary"
                                style={{ backgroundColor: confirmColor, borderColor: confirmColor }}
                                icon={confirmIcon}
                                size={size}
                            >
                                {confirmText}
                            </Button>
                        </Popconfirm>
                    </Can>
                ) : (
                    <Popconfirm
                        title={confirmTitle}
                        description={confirmDescription}
                        onConfirm={onConfirm}
                        okText="Ya, Konfirmasi"
                        cancelText="Batal"
                    >
                        <Button
                            type="primary"
                            style={{ backgroundColor: confirmColor, borderColor: confirmColor }}
                            icon={confirmIcon}
                            size={size}
                        >
                            {confirmText}
                        </Button>
                    </Popconfirm>
                )
            )}

            {/* Custom Extra Buttons */}
            {extra}

            {/* Delete Button */}
            {onDelete && (
                deletePermission ? (
                    <Can access={deletePermission}>
                        <Popconfirm
                            title={deleteTitle}
                            description={deleteDescription}
                            onConfirm={onDelete}
                            okText="Ya, Hapus"
                            cancelText="Batal"
                        >
                            <Tooltip title="Hapus Data">
                                <Button
                                    type="primary"
                                    danger
                                    icon={<DeleteOutlined />}
                                    size={size}
                                />
                            </Tooltip>
                        </Popconfirm>
                    </Can>
                ) : (
                    <Popconfirm
                        title={deleteTitle}
                        description={deleteDescription}
                        onConfirm={onDelete}
                        okText="Ya, Hapus"
                        cancelText="Batal"
                    >
                        <Tooltip title="Hapus Data">
                            <Button
                                type="primary"
                                danger
                                icon={<DeleteOutlined />}
                                size={size}
                            />
                        </Tooltip>
                    </Popconfirm>
                )
            )}
        </Space>
    );
};

export default TableActions;
