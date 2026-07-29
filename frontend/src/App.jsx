import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Login from './pages/Login';
import EmployeeList from './pages/hr/EmployeeList';
import DepartmentList from './pages/hr/DepartmentList';
import PositionList from './pages/hr/PositionList';
import Dashboard from './pages/Dashboard';
import LeaveRequests from './pages/hr/LeaveRequests';
import Payroll from './pages/hr/Payroll';
import ChartOfAccounts from './pages/finance/ChartOfAccounts';
import JournalEntries from './pages/finance/JournalEntries';
import Invoices from './pages/finance/Invoices';
import Payments from './pages/finance/Payments';
import FixedAssets from './pages/finance/FixedAssets';
import BankReconciliation from './pages/finance/BankReconciliation';
import ProductCategoryList from './pages/inventory/ProductCategoryList';
import ProductList from './pages/inventory/ProductList';
import WarehouseList from './pages/inventory/WarehouseList';
import StockBalanceList from './pages/inventory/StockBalanceList';
import StockMovementList from './pages/inventory/StockMovementList';
import VendorList from './pages/purchasing/VendorList';
import PurchaseRequestList from './pages/purchasing/PurchaseRequestList';
import PurchaseOrderList from './pages/purchasing/PurchaseOrderList';
import GoodsReceiptList from './pages/purchasing/GoodsReceiptList';
import CustomerList from './pages/sales/CustomerList';
import SalesOrderList from './pages/sales/SalesOrderList';
import DeliveryOrderList from './pages/sales/DeliveryOrderList';
import UserManagement from './pages/settings/UserManagement';
import Profile from './pages/Profile';
import { ConfigProvider, Spin } from 'antd';
import api from './api/axiosConfig';
import { BlankSpace } from "./components/common";
import themeConfig from './assets/styles/themeConfig';

const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setIsAuthenticated(false);
        return;
      }
      
      try {
        await api.post('token/verify/', { token });
        setIsAuthenticated(true);
      } catch (error) {
        // Axios interceptor inside api might try to refresh the token if it's expired.
        // If it still fails, interceptor removes tokens and redirects.
        // But for explicit verify, if it fails and doesn't refresh successfully, we mark as unauth.
        setIsAuthenticated(false);
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
      }
    };

    verifyToken();
  }, []);

  if (isAuthenticated === null) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f5f5f5' }}>
        <Spin size="large" description="Memuat Sesi..." />
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <ConfigProvider theme={themeConfig}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="hr/employees" element={<EmployeeList />} />
            <Route path="hr/departments" element={<DepartmentList />} />
            <Route path="hr/positions" element={<PositionList />} />
            <Route path="leave-requests" element={<LeaveRequests />} />
            <Route path="payroll" element={<Payroll />} />
            <Route path="finance/accounts" element={<ChartOfAccounts />} />
            <Route path="finance/journals" element={<JournalEntries />} />
            <Route path="finance/invoices" element={<Invoices />} />
            <Route path="finance/payments" element={<Payments />} />
            <Route path="finance/fixed-assets" element={<FixedAssets />} />
            <Route path="finance/bank-reconciliation" element={<BankReconciliation />} />
            
            {/* Inventory Routes */}
            <Route path="inventory/categories" element={<ProductCategoryList />} />
            <Route path="inventory/products" element={<ProductList />} />
            <Route path="inventory/warehouses" element={<WarehouseList />} />
            <Route path="inventory/stock-balances" element={<StockBalanceList />} />
            <Route path="inventory/stock-movements" element={<StockMovementList />} />
            
            {/* Purchasing Routes */}
            <Route path="purchasing/vendors" element={<VendorList />} />
            <Route path="purchasing/requests" element={<PurchaseRequestList />} />
            <Route path="purchasing/orders" element={<PurchaseOrderList />} />
            <Route path="purchasing/receipts" element={<GoodsReceiptList />} />
            
            {/* Sales Routes */}
            <Route path="sales/customers" element={<CustomerList />} />
            <Route path="sales/orders" element={<SalesOrderList />} />
            <Route path="sales/deliveries" element={<DeliveryOrderList />} />

            {/* Settings Routes */}
            <Route path="settings/users" element={<UserManagement />} />
            
            <Route path="profile" element={<Profile />} />
            
            {/* Catch-all untuk halaman tidak ditemukan */}
            <Route path="*" element={
              <BlankSpace 
                type="404" 
                title="404 - Tidak Ditemukan" 
                description="Maaf, halaman yang Anda cari tidak ada di sistem." 
              />
            } />
          </Route>
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
}
// Trigger HMR
export default App;
