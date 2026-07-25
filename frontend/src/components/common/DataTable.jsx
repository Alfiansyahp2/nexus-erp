import React from 'react';
import { Table } from 'antd';
import TableSearch, { filterTableData } from '../TableSearch';

/**
 * Reusable DataTable component with built-in search, responsive pagination, 
 * loading state, and index/row numbering support.
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
 */
const DataTable = ({
    dataSource = [],
    columns = [],
    loading = false,
    searchText = "",
    setSearchText,
    searchPlaceholder = "Cari semua data di tabel ini...",
    showSearch,
    showIndex = false,
    pagination = {},
    rowKey = "id",
    style = {},
    ...tableProps
}) => {
    // Determine if search bar should be rendered
    const isSearchVisible = showSearch !== undefined ? showSearch : !!setSearchText;

    // Filter data if searchText is present and setSearchText is provided
    const filteredData = isSearchVisible && searchText 
        ? filterTableData(dataSource, searchText) 
        : dataSource;

    // Optional Index / Numbering column
    const indexColumn = {
        title: 'No.',
        key: '_index',
        width: 60,
        align: 'center',
        render: (_, __, index) => index + 1
    };

    const tableColumns = showIndex ? [indexColumn, ...columns] : columns;

    // Default premium pagination configuration
    const defaultPagination = {
        pageSize: 10,
        showSizeChanger: true,
        pageSizeOptions: ['10', '20', '50', '100'],
        showTotal: (total, range) => `Menampilkan ${range[0]}-${range[1]} dari total ${total} data`,
        ...pagination
    };

    return (
        <div className="data-table-container" style={style}>
            {isSearchVisible && (
                <div style={{ marginBottom: 16 }}>
                    <TableSearch
                        value={searchText}
                        onChange={(e) => setSearchText && setSearchText(e.target.value)}
                        placeholder={searchPlaceholder}
                    />
                </div>
            )}

            <Table
                columns={tableColumns}
                dataSource={filteredData}
                rowKey={rowKey}
                loading={loading}
                pagination={defaultPagination}
                size="middle"
                bordered
                {...tableProps}
            />
        </div>
    );
};

export default DataTable;
