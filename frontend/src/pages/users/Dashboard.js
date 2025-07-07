import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { logoutUser } from 'api/auth';
import BridgeManagementPage from '../../components/Dashboard/BridgeManagement';
import { Menu, X, Building2, Users, UserRound, LogOut } from 'lucide-react';

const DashboardPage = () => {
  const [userEmail, setUserEmail] = useState('');
  const [userRole, setUserRole] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('information'); // default safe tab
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const email = localStorage.getItem('email');
    const role = localStorage.getItem('role');

    if (!token) {
      navigate('/login');
    } else {
      setUserEmail(email);
      setUserRole(role);

      // Ngăn user không phải admin truy cập vào tab không phù hợp
      if (
        role !== 'admin' &&
        (activeTab === 'users' || activeTab === 'bridges')
      ) {
        setActiveTab('information');
      }
    }
  }, [navigate, activeTab]);

  const handleLogout = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    await logoutUser(refreshToken);
    localStorage.clear();
    navigate('/login');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'bridges':
        if (userRole !== 'admin') {
          return (
            <div className="p-4">
              <h2 className="text-xl font-bold text-red-600">⛔ Không có quyền truy cập</h2>
              <p>Bạn cần có quyền quản trị viên để xem nội dung này.</p>
            </div>
          );
        }
        return <BridgeManagementPage />;
      case 'users':
        if (userRole !== 'admin') {
          return (
            <div className="p-4">
              <h2 className="text-xl font-bold text-red-600">⛔ Không có quyền truy cập</h2>
              <p>Bạn cần có quyền quản trị viên để xem nội dung này.</p>
            </div>
          );
        }
        return (
          <div className="p-4">
            <h2 className="text-xl font-bold mb-2">Quản lý người dùng</h2>
            <p>Chức năng này sẽ hiển thị danh sách người dùng (đang phát triển).</p>
          </div>
        );
      case 'information':
      default:
        return (
          <div className="p-4">
            <h2 className="text-xl font-bold mb-2">Thông tin cá nhân</h2>
            <p>Đang cập nhật.</p>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div
        className={`bg-white shadow-lg w-72 p-4 space-y-4 flex flex-col absolute md:relative z-20 md:z-auto h-full transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex items-center justify-between md:justify-center mb-4">
          <h2 className="text-xl font-bold">Hệ thống quản lý</h2>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden text-gray-600 hover:text-black"
          >
            <X />
          </button>
        </div>
        <p className="text-gray-700 text-center text-sm">📧 {userEmail}</p>

        {/* Menu Items */}
        {userRole === 'admin' && (
          <button
            onClick={() => setActiveTab('bridges')}
            className={`flex items-center gap-2 px-4 py-2 rounded hover:bg-gray-100 ${
              activeTab === 'bridges' ? 'bg-gray-200 font-semibold' : ''
            }`}
          >
            <Building2 size={18} />
            Quản lý cầu
          </button>
        )}

        {userRole === 'admin' && (
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-4 py-2 rounded hover:bg-gray-100 ${
              activeTab === 'users' ? 'bg-gray-200 font-semibold' : ''
            }`}
          >
            <Users size={18} />
            Quản lý người dùng
          </button>
        )}

        <button
          onClick={() => setActiveTab('information')}
          className={`flex items-center gap-2 px-4 py-2 rounded hover:bg-gray-100 ${
            activeTab === 'information' ? 'bg-gray-200 font-semibold' : ''
          }`}
        >
          <UserRound size={18} />
          Thông tin cá nhân
        </button>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 mt-auto bg-red-500 text-white rounded hover:bg-red-600"
        >
          <LogOut size={18} />
          Đăng xuất
        </button>
      </div>

      {/* Main content */}
      <div className="flex-1 bg-gray-100 p-6 overflow-auto w-full">
        {/* Mobile menu button */}
        <div className="md:hidden flex items-center justify-between mb-4">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="text-gray-600 hover:text-black"
          >
            <Menu />
          </button>
          <h1 className="text-lg font-semibold">Quản trị</h1>
        </div>

        {/* Content render */}
        <div className="bg-white rounded-xl shadow-md p-6">{renderContent()}</div>
      </div>
    </div>
  );
};

export default DashboardPage;
