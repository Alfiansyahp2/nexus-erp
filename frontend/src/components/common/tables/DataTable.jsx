import React from 'react';
import { Table, Card } from 'antd';
import TableSearch, { filterTableData } from '../../TableSearch';
import PageHeader from '../layouts/PageHeader';

/**
 * Reusable DataTable component formatted to match LeaveRequests.jsx style.
 * Includes optional Card wrapper, right-aligned table-search-row, clean borderless rows,
 * automatic ascending/descending sorters for all data columns, and optional integrated PageHeader toolbar.
 * 
 * @param {Array} dataSource - Data array for table
 * @param {Array} columns - Table column definitions
 * @param {boolean} loading - Loading state
 * @param {string} searchText - Current search query (if using integrated search)
 * @param {function} setSearchText - State setter for search query (if using integrated search)
 * @param {string} searchPlaceholder - Placeholder for search bar
 * @param {boolean} showSearch - Whether to display top search bar (default: true if setSearchText is provided)
 * @param {boolean} showIndex - Whether to prepend an automatic row numbering column (default: false)
 * @param {object} pagination - Custom pagination options (overrides defaults)
 * @param {string} rowKey - Key field for rows (default: 'id')
 * @param {boolean} card - Whether to wrap the table in Ant Design Card (default: true, matching LeaveRequests)
 * @param {string|React.ReactNode} title - Optional title to render integrated PageHeader toolbar inside Card
 * @param {string|React.ReactNode} description - Optional description for integrated toolbar
 * @param {function} onAdd - Optional callback for primary Add button in integrated toolbar
 * @param {string} addText - Optional label for Add button
 * @param {string} addPermission - Optional RBAC slug for Add button
 * @param {React.ReactNode} extraHeader - Optional extra buttons for toolbar
 */
const DataTable = ({
    dataSource = [],
    columns = [],
    loading = false,
    searchText = "",
    setSearchText,
    searchPlaceholder = "Pencarian...",
    showSearch,
    showIndex = false,
    pagination = {},
    rowKey = "id",
    card = true,
    title,
    description,
    onAdd,
    addText,
    addPermission,
    extraHeader,
    style = {},
    ...tableProps
}) => {
    // Determine if search bar should be rendered
    const isSearchVisible = showSearch !== undefined ? showSearch : !!setSearchText;

    // Filter data if searchText is present and setSearchText is provided
    const filteredData = isSearchVisible && searchText 
        ? filterTableData(dataSource, searchText) 
        : dataSource;

    // Automatically attach ascending & descending sorters to all columns unless explicitly disabled
    const enrichedColumns = columns.map(col => {
        // Do not attach sorter to Action column, Index column, or if developer explicitly set sorter: false
        if (col.sorter === false || col.key === 'action' || col.key === '_index' || !col.title) {
            return col;
        }
        if (col.sorter) {
            return col; // Use custom sorter if already provided
        }

        // Determine field to sort by (dataIndex or fallback to key)
        const field = col.dataIndex || col.key;
        return {
            ...col,
            sorter: (a, b) => {
                const valA = a[field];
                const valB = b[field];

                if (valA === null || valA === undefined) return -1;
                if (valB === null || valB === undefined) return 1;

                if (typeof valA === 'number' && typeof valB === 'number') {
                    return valA - valB;
                }
                if (typeof valA === 'boolean' && typeof valB === 'boolean') {
                    return valA === valB ? 0 : valA ? -1 : 1;
                }
                return String(valA).localeCompare(String(valB), 'id', { numeric: true });
            }
        };
    });

    // Optional Index / Numbering column
    const indexColumn = {
        title: 'No.',
        key: '_index',
        width: 60,
        align: 'center',
        render: (_, __, index) => index + 1
    };

    const tableColumns = showIndex ? [indexColumn, ...enrichedColumns] : enrichedColumns;

    // Default clean pagination configuration matching LeaveRequests
    const defaultPagination = {
        pageSize: 10,
        ...pagination
    };

    const content = (
        <div className="data-table-inner" style={style}>
            {/* Optional Integrated Toolbar (if title or onAdd is provided) */}
            {(title || onAdd || extraHeader) && (
                <PageHeader
                    title={title}
                    description={description}
                    onAdd={onAdd}
                    addText={addText}
                    addPermission={addPermission}
                    extra={extraHeader}
                />
            )}

            {/* Right-aligned search bar matching LeaveRequests.jsx */}
            {isSearchVisible && (
                <div className="table-search-row">
                    <TableSearch
                        value={searchText}
                        onChange={(e) => setSearchText && setSearchText(e.target.value)}
                        placeholder={searchPlaceholder}
                    />
                </div>
            )}

            {/* Clean table without borders matching LeaveRequests.jsx */}
            <Table
                columns={tableColumns}
                dataSource={filteredData}
                rowKey={rowKey}
                loading={loading}
                pagination={defaultPagination}
                {...tableProps}
            />
        </div>
    );

    if (card) {
        return <Card>{content}</Card>;
    }

    return content;
};

export default DataTable;
