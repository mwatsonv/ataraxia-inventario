import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Login } from './pages/auth/Login';
import { InventoryList } from './pages/inventory/InventoryList';
import { StockControl } from './pages/logistics/StockControl';
import { Movements } from './pages/logistics/Movements';
import { ReportsAnalysis } from './pages/reports/ReportsAnalysis';
import { UsersConfig } from './pages/auth/UsersConfig';
import { SupervisorStock } from './pages/inventory/SupervisorStock';
import { ProjectHistory } from './pages/projects/ProjectHistory';
import { UserRole } from './types';

const MainAppContent: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('inventory');

  // Set default tabs based on role permissions after login
  useEffect(() => {
    if (user) {
      if (user.rol === UserRole.SUPERVISOR) {
        setActiveTab('supervisor-stock');
      } else {
        setActiveTab('inventory');
      }
    }
  }, [user]);

  if (!user) {
    return <Login />;
  }

  // Render correct page component based on selected active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'inventory':
        return <InventoryList />;
      case 'stock-control':
        return <StockControl />;
      case 'movements':
        return <Movements />;
      case 'reports':
        return <ReportsAnalysis />;
      case 'users':
        return <UsersConfig />;
      case 'supervisor-stock':
        return <SupervisorStock />;
      case 'project-history':
        return <ProjectHistory />;
      default:
        return <InventoryList />;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-100 select-none">
      {/* Dynamic Left Sidebar depending on user role */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      {/* Outer Content frame with Top Header */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header activeTab={activeTab} />
        
        {/* Dynamic page area */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}
