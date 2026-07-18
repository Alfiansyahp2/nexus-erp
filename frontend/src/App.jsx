import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Login from './pages/Login';
import EmployeeList from './pages/EmployeeList';
import DepartmentList from './pages/DepartmentList';
import PositionList from './pages/PositionList';
import Dashboard from './pages/Dashboard';
import LeaveRequests from './pages/LeaveRequests';
import Payroll from './pages/Payroll';
import ChartOfAccounts from './pages/finance/ChartOfAccounts';
import JournalEntries from './pages/finance/JournalEntries';
import { ConfigProvider } from 'antd';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('access_token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#1677ff',
          borderRadius: 6,
          fontFamily: "'Inter', sans-serif",
        },
      }}
    >
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
          </Route>
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default App;
