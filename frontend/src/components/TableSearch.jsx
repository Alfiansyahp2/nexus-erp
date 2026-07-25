import React from 'react';
import { Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

/**
 * Reusable TableSearch component for instant filtering across list data.
 * Can be used in any list page (Finance, HR, Purchasing, Inventory).
 * 
 * @param {string} value - Current search text
 * @param {function} onChange - Callback when input changes (e.g. (e) => setSearchText(e.target.value))
 * @param {function} onSearch - Callback when search button/enter is clicked
 * @param {string} placeholder - Custom placeholder text
 * @param {boolean} allowClear - Whether to show clear (x) button (default: true)
 * @param {object} style - Optional custom inline styles
 */
const TableSearch = ({ 
    value, 
    onChange, 
    onSearch, 
    placeholder = "Cari semua data di tabel ini...", 
    allowClear = true,
    style = {},
    ...props 
}) => {
    return (
        <Input.Search
            placeholder={placeholder}
            allowClear={allowClear}
            enterButton
            size="middle"
            value={value}
            onChange={onChange}
            onSearch={onSearch}
            className="table-search-input"
            prefix={<SearchOutlined style={{ color: '#bfbfbf', marginRight: 4 }} />}
            style={style}
            {...props}
        />
    );
};

/**
 * Utility function to filter an array of objects by a search term across all text/number fields.
 * Example usage: 
 *   const filteredData = filterTableData(data, searchText);
 *   <Table dataSource={filteredData} ... />
 */
export const filterTableData = (dataSource = [], searchText = "") => {
    if (!searchText || !searchText.trim()) {
        return dataSource;
    }
    const lowerQuery = searchText.toLowerCase().trim();
    
    return dataSource.filter(row => {
        return Object.values(row).some(val => {
            if (val === null || val === undefined) return false;
            if (typeof val === 'object') {
                // If nested object or array, convert to string or check properties
                return JSON.stringify(val).toLowerCase().includes(lowerQuery);
            }
            return String(val).toLowerCase().includes(lowerQuery);
        });
    });
};

export default TableSearch;
