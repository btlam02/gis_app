import React from 'react';
import BridgeMap from '../../components/BridgeMap';

const HomePage = () => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Hệ thống quản lý cầu</h1>
      <p className="mb-4 text-gray-600">Bản đồ hiển thị vị trí các cây cầu tại TP. Hồ Chí Minh.</p>

      <BridgeMap />
    </div>
  );
};

export default HomePage;
