// src/components/Profile/UserProfilePage.jsx
import React, { useEffect, useState } from "react";
import {updateUser,fetchCurrentUser } from "../../api/users";
import { toast } from "react-toastify";

const UserProfilePage = () => {
  const [formData, setFormData] = useState({
    id: null,
    email: "",
    full_name: "",
    role: "",
    organization_name: "",
    organization_address: "",
    password: "",
  });
  const [currentPassword, setCurrentPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const me = await fetchCurrentUser(); 
        setFormData({ ...me, password: "" });
      } catch (err) {
        toast.error("Không thể tải thông tin người dùng.");
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...formData,
        current_password: currentPassword,
      };
  
      if (!formData.password) {
        delete payload.password;
      }
  
      await updateUser(formData.id, payload);
      toast.success("Cập nhật thông tin thành công!");
    } catch (err) {
      toast.error(
        err?.response?.data?.detail ||
          err?.response?.data?.error ||
          "Cập nhật thất bại."
      );
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <>
      <h2 className="text-xl font-bold mb-4">Thông tin cá nhân</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium mb-2">Email - Không thay đổi</label>
          <input
            type="email"
            value={formData.email}
            className="w-full border p-2 rounded bg-gray-100"
          />
        </div>
        <div>
          <label className="block font-medium mb-2">Họ và tên</label>
          <input
            type="text"
            name="full_name"
            value={formData.full_name}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
        </div>
        <div>
          <label className="block font-medium mb-2">Vai trò</label>
          <input
            type="text"
            value={formData.role}
            disabled
            className="w-full border p-2 rounded bg-gray-100"
          />
        </div>

        <div>
          <label className="block font-medium mb-2">
            Mật khẩu hiện tại <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            name="current_password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full border p-2 rounded"
            required
          />
        </div>

        <div>
          <label className="block font-medium mb-2">Mật khẩu mới - Tuỳ chọn</label>
          <div className="relative">
            <input
              type={showNewPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full border p-2 rounded pr-10"
              placeholder="••••••••"
            />
            <button
              type="button"
              className="absolute right-2 top-2 text-sm text-blue-600"
              onClick={() => setShowNewPassword(!showNewPassword)}
            >
              {showNewPassword ? "Ẩn" : "Hiện"}
            </button>
          </div>
        </div>


        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {loading ? "Đang lưu..." : "Cập nhật"}
        </button>
      </form>
      </>
  );
};

export default UserProfilePage;
