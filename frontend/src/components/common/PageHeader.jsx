import React from 'react';
import { Typography, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import Can from './Can';

const { Title, Text } = Typography;

/**
 * Reusable PageHeader component for standardizing page titles, descriptions,
 * and primary action buttons across list pages. Formatted to match LeaveRequests toolbar style.
 * 
 * @param {string|React.ReactNode} title - Page title
 * @param {string|React.ReactNode} description - Subtitle / description text below title
 * @param {function} onAdd - Callback when primary Add button is clicked
 * @param {string} addText - Text for primary Add button (default: "Tambah Baru")
 * @param {React.ReactNode} addIcon - Icon for primary Add button (default: <PlusOutlined />)
 * @param {string} addPermission - RBAC permission slug required to show the Add button (uses <Can access="...">)
 * @param {React.ReactNode} extra - Additional buttons/controls on the right side
 */
const PageHeader = ({
    title,
    description,
    onAdd,
    addText = "Tambah Baru",
    addIcon = <PlusOutlined />,
    addPermission,
    extra = null,
    style = {}
}) => {
    return (
        <div className="table-toolbar" style={style}>
            <div>
                <Title level={4} className="margin-0">{title}</Title>
                {description && <Text type="secondary" style={{ fontSize: 13, marginTop: 4, display: 'block' }}>{description}</Text>}
            </div>

            <div className="table-toolbar-actions">
                {extra}

                {onAdd && (
                    addPermission ? (
                        <Can access={addPermission}>
                            <Button
                                type="primary"
                                icon={addIcon}
                                onClick={onAdd}
                            >
                                {addText}
                            </Button>
                        </Can>
                    ) : (
                        <Button
                            type="primary"
                            icon={addIcon}
                            onClick={onAdd}
                        >
                            {addText}
                        </Button>
                    )
                )}
            </div>
        </div>
    );
};

export default PageHeader;
