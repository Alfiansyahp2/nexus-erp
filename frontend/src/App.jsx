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
import { ConfigProvider, Spin } from 'antd';
import api from './api/axiosConfig';

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
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" description="Memverifikasi sesi..." />
      </div>
    );
  }

  if (!isAuthenticated) {
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
