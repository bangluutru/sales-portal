import React from 'react';
import { AppProvider, useApp } from './context/AppContext.jsx';
import Header from './components/Header.jsx';
import Sidebar from './components/Sidebar.jsx';
import QuickActionsModal from './components/QuickActionsModal.jsx';
import DashboardView from './views/DashboardView.jsx';
import PeopleView from './views/PeopleView.jsx';
import CustomersView from './views/CustomersView.jsx';
import ContractsView from './views/ContractsView.jsx';
import OperationsView from './views/OperationsView.jsx';
import MyTasksView from './views/MyTasksView.jsx';
import AdminView from './views/AdminView.jsx';
import './styles/main.css';

function MainLayout() {
  const { activeTab } = useApp();

  const tabTitles = {
    dashboard: 'Bảng Điều Khiển Tổng Quan',
    people: 'Quản Lý Hồ Sơ Nhân Sự & CTV',
    customers: 'Danh Bạ Khách Hàng Toàn Team',
    contracts: 'Hợp Đồng Nhân Sự & Đối Tác',
    operations: 'Trung Tâm Đề Nghị Tác Nghiệp',
    'my-tasks': 'Hộp Việc Cần Xử Lý (My Tasks)',
    admin: 'Quản Trị Hệ Thống'
  };

  const renderCurrentView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'people':
        return <PeopleView />;
      case 'customers':
        return <CustomersView />;
      case 'contracts':
        return <ContractsView />;
      case 'operations':
        return <OperationsView />;
      case 'my-tasks':
        return <MyTasksView />;
      case 'admin':
        return <AdminView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="app-container">
      <a href="#main-content" className="skip-link">
        Chuyển đến nội dung chính
      </a>
      <Header title={tabTitles[activeTab] || 'Genki Sales Portal'} />
      <div className="layout-wrapper">
        <Sidebar />
        <main className="main-content" id="main-content" tabIndex="-1">
          {renderCurrentView()}
        </main>
      </div>
      <QuickActionsModal />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
