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

export { default as DataTable } from './tables/DataTable';
export { default as StatusTag } from './tables/StatusTag';
export { default as TableActions } from './tables/TableActions';
export { default as PageHeader } from './layouts/PageHeader';
export { default as FormModal } from './modals/FormModal';

// Re-export existing core utilities for convenience
export { default as Can } from '../Can';
export { default as TableSearch, filterTableData } from '../TableSearch';
