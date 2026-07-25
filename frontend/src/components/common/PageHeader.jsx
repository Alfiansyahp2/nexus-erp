import React from 'react';
import { Typography, Button, Space } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import Can from '../Can';

const { Title, Text } = Typography;

/**
 * Reusable PageHeader component for standardizing page titles, descriptions,
 * and primary action buttons across list pages.
 * 
 * @param {string|React.ReactNode} title - Page title
 * @param {string|React.ReactNode} description - Subtitle / description text below title
 * @param {function} onAdd - Callback when primary Add button is clicked
 * @param {string} addText - Text for primary Add button (default: "Tambah Baru")
 * @param {React.ReactNode} addIcon - Icon for primary Add button (default: <PlusOutlined />)
 * @param {string} addPermission - RBAC permission slug required to show the Add button
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
        <div 
            className="page-header-container" 
            style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: 16,
                flexWrap: 'wrap',
                gap: 12,
                ...style 
            }}
        >
            <div>
                <Title level={3} style={{ margin: 0 }}>{title}</Title>
                {description && <Text type="secondary">{description}</Text>}
            </div>

            <Space size="middle" wrap>
                {extra}

                {onAdd && (
                    addPermission ? (
                        <Can perform={addPermission}>
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
            </Space>
        </div>
    );
};

export default PageHeader;
