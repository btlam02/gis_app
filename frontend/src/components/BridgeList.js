import React, { useEffect, useState } from "react";
import { fetchBridges } from "../api/bridge";
import { motion, AnimatePresence } from "framer-motion";
import Loading from "./Loading";

const BridgeModal = ({ bridge, onClose }) => {
  if (!bridge) return null;
  const getStatusLabel = (status) => {
    const mapping = {
      unknown: "Chưa biết",
      good: "Tốt",
      repair: "Đang sửa",
      closed: "Đóng cửa",
    };
    return mapping[status] || "Không rõ";
  };

  return (
<div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
  <motion.div
    className="bg-white rounded-xl p-6 max-w-xl w-full shadow-lg relative"
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
  >
    <button
      onClick={onClose}
      className="absolute top-2 right-2 text-gray-600 hover:text-red-500 text-lg"
    >
      ×
    </button>

    <h2 className="text-2xl font-bold mb-4">{bridge.name}</h2>

    {/* Grid 2 cột cho thông tin */}
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-gray-700">
      <p><strong>Quận:</strong> {bridge.district || "Không rõ"}</p>
      <p><strong>Chất liệu:</strong> {bridge.material || "Không rõ"}</p>
      <p><strong>Chiều dài:</strong> {bridge.length ? `${bridge.length} m` : "Không rõ"}</p>
      <p><strong>Chiều rộng:</strong> {bridge.width ? `${bridge.width} m` : "Không rõ"}</p>
      <p><strong>Trạng thái:</strong> {getStatusLabel(bridge.status)}</p>
      <p><strong>Năm xây dựng:</strong> {bridge.built_year}</p>
    </div>

    {/* Mô tả riêng phía dưới */}
    <p className="text-gray-700 mt-4 col-span-2">
      {bridge.description || "Không có mô tả."}
    </p>

    {/* Ảnh nếu có */}
    {bridge.image_url && (
      <img
        src={bridge.image_url}
        alt={bridge.name}
        className="mt-4 rounded-lg w-full max-h-[300px] object-cover"
      />
    )}
  </motion.div>
</div>

  );
};

function BridgeList() {
  const [bridges, setBridges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBridge, setSelectedBridge] = useState(null);
  const [searchQuery, setSearchQuery] = useState(""); // 🔍

  useEffect(() => {
    fetchBridges()
      .then((data) => {
        setBridges(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching bridges:", err);
        setError("Không thể tải danh sách cầu");
        setLoading(false);
      });
  }, []);

  const filteredBridges = bridges.filter((b) =>
    b.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <Loading />;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Danh sách cầu trong hệ thống</h2>

      {/* 🔍 Ô tìm kiếm */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="🔍 Tìm kiếm theo tên cầu..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Danh sách cầu */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="grid grid-cols-1 gap-4"
      >
        {filteredBridges.length === 0 ? (
          <p className="text-gray-500 italic">Không tìm thấy cầu phù hợp.</p>
        ) : (
          filteredBridges.map((bridge) => (
            <motion.div
              key={bridge.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedBridge(bridge)}
              className="bg-white p-4 rounded-xl shadow-md cursor-pointer hover:bg-gray-50 transition-all duration-300"
            >
              <h3 className="text-lg font-semibold">{bridge.name}</h3>
              <p className="text-sm text-gray-600">
                {bridge.district || "Không rõ"} | {bridge.material || "Không rõ chất liệu"}
              </p>
            </motion.div>
          ))
        )}
      </motion.div>

      <AnimatePresence>
        {selectedBridge && (
          <BridgeModal
            bridge={selectedBridge}
            onClose={() => setSelectedBridge(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default BridgeList;
