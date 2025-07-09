// src/components/Dashboard/UserManagementPage.jsx
import React, { useEffect, useState } from "react";
import { Pencil, Trash2, Plus, X } from "lucide-react";
import {
  fetchUsers,
  createUser,
  updateUser,
  deleteUserById,
} from "../../api/users";
import { toast } from "react-toastify";

const defaultForm = {
  email: "",
  full_name: "",
  role: "user",
  password: "",
};

const UserForm = ({ user, onCancel, onSuccess }) => {
  const [formData, setFormData] = useState(defaultForm);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({ ...user, password: "" }); // Không hiện mật khẩu cũ
    } else {
      setFormData(defaultForm);
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (user) {
        await updateUser(user.id, formData);
        toast.success("Cập nhật người dùng thành công!");
      } else {
        await createUser(formData);
        toast.success("Thêm người dùng mới thành công!");
      }
      onSuccess();
    } catch (err) {
      console.error("Lỗi khi lưu người dùng:", err);
      toast.error("Có lỗi xảy ra khi lưu người dùng.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl relative">
        <button
          onClick={onCancel}
          className="absolute top-2 right-2 text-gray-500 hover:text-red-600"
        >
          <X />
        </button>
        <h2 className="text-xl font-bold mb-4">
          {user ? "Cập nhật người dùng" : "Thêm người dùng mới"}
        </h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
          <div>
            <label className="block font-medium">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full border rounded p-2"
            />
          </div>
          <div>
            <label className="block font-medium">Họ tên</label>
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              className="w-full border rounded p-2"
            />
          </div>
          <div>
            <label className="block font-medium">Vai trò</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full border rounded p-2"
            >
              <option value="user">Người dùng</option>
              <option value="engineer">Kỹ sư</option>
              <option value="admin">Quản trị viên</option>
            </select>
          </div>
          <div>
            <label className="block font-medium">
              Mật khẩu {user && "(bỏ trống nếu không đổi)"}
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full border rounded p-2"
              placeholder="•••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded mt-2 hover:bg-blue-700"
          >
            {loading ? "Đang lưu..." : user ? "Cập nhật" : "Thêm mới"}
          </button>
        </form>
      </div>
    </div>
  );
};

const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const loadUsers = async () => {
    try {
      const data = await fetchUsers();
      setUsers(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa người dùng này?")) return;
    try {
      await deleteUserById(id);
      await loadUsers();
      toast.success("Xóa thành công");
    } catch (err) {
      console.error("Lỗi khi xóa:", err);
      toast.error("Không thể xóa người dùng.");
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold"> QL người dùng</h2>
        <button
          onClick={() => {
            setEditingUser(null);
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded"
        >
          <Plus size={16} /> Tạo mới
        </button>
      </div>

      {showForm && (
        <UserForm
          user={editingUser}
          onCancel={() => setShowForm(false)}
          onSuccess={async () => {
            setShowForm(false);
            await loadUsers();
          }}
        />
      )}

      <div className="overflow-auto">
        <table className="min-w-full bg-white rounded shadow">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2 text-left">Email</th>
              <th className="p-2 text-left">Họ tên</th>
              <th className="p-2 text-left">Vai trò</th>
              <th className="p-2 text-center">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center p-4">
                  Không có người dùng.
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="border-t hover:bg-gray-50">
                  <td className="p-2">{u.email}</td>
                  <td className="p-2">{u.full_name}</td>
                  <td className="p-2 capitalize">{u.role}</td>
                  <td className="p-2 text-center space-x-2">
                    <button
                      onClick={() => {
                        setEditingUser(u);
                        setShowForm(true);
                      }}
                      className="text-blue-600 hover:underline"
                      title="Sửa người dùng"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(u.id)}
                      className="text-red-600 hover:underline"
                      title="Xóa người dùng"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagementPage;
