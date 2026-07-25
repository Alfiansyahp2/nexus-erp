/**
 * Shared / Reusable UI Component Library (Design System)
 * 
 * Export all standardized UI components from a single entry point.
 * Example Usage in any page:
 * 
 * import { 
 *     DataTable, 
 *     StatusTag, 
 *     TableActions, 
 *     PageHeader, 
 *     Can, 
 *     filterTableData 
 * } from '../../components/common';
 */

export { default as DataTable } from './DataTable';
export { default as StatusTag } from './StatusTag';
export { default as TableActions } from './TableActions';
export { default as PageHeader } from './PageHeader';

// Re-export existing core utilities for convenience
export { default as Can } from '../Can';
export { default as TableSearch, filterTableData } from '../TableSearch';
