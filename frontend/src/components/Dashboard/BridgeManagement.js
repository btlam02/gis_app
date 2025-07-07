// src/components/Dashboard/BridgeManagementPage.jsx
import React, { useEffect, useState } from 'react';
import { Pencil, Trash2, Plus, X } from 'lucide-react';
import { fetchBridges, createBridge, updateBridge, deleteBridgeById } from '../../api/bridge';

const BridgeForm = ({ bridge, onCancel, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    length: '',
    width: '',
    material: '',
    district: '',
    built_year: '',
    center_point: '',
    description: '',
    status: 'unknown',
    bridge_type: 'other',
    image: null,
  });
  const [segments, setSegments] = useState([]);

  useEffect(() => {
    if (bridge) {
      setFormData({
        ...bridge,
        image: null,
      });
      try {
        setSegments(Array.isArray(bridge.segments) ? bridge.segments : JSON.parse(bridge.segments));
      } catch {
        setSegments([]);
      }
    } else {
      setFormData({
        name: '', location: '', length: '', width: '', material: '', district: '', built_year: '', center_point: '',
        description: '', status: 'unknown', bridge_type: 'other', image: null,
      });
      setSegments([]);
    }
  }, [bridge]);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSegmentChange = (index, field, value) => {
    const updated = [...segments];
    if (field === 'geometry') {
      updated[index].geometry = value;
    } else {
      updated[index][field] = value;
    }
    setSegments(updated);
  };

  const safeParseCoordinates = (text) => {
    try {
      const parsed = JSON.parse(text);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const addSegment = () => {
    setSegments([...segments, {
      segment_name: '',
      order: segments.length,
      geometry: { type: 'LineString', coordinates: [] }
    }]);
  };

  const removeSegment = (index) => {
    const updated = [...segments];
    updated.splice(index, 1);
    setSegments(updated);
  };


  

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formPayload = new FormData();
    for (const key in formData) {
        if (
            formData[key] !== undefined &&
            formData[key] !== null &&
            (typeof formData[key] === 'number' || typeof formData[key] === 'object' || formData[key].toString().trim() !== '')
          ) {
            formPayload.append(key, formData[key]);
          }
          
    }
    formPayload.append('segments', JSON.stringify(segments || []));


    try {
      if (bridge) {
        await updateBridge(bridge.id, formPayload, true);
      } else {
        await createBridge(formPayload, true);
      }
      onSuccess();
    } catch (err) {
      console.error('Lỗi khi lưu cầu:', err);
    }
  };


  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl relative max-h-[90vh] overflow-y-auto">
        <button onClick={onCancel} className="absolute top-2 right-2 text-gray-500 hover:text-red-600">
          <X />
        </button>
        <h2 className="text-xl font-bold mb-4">{bridge ? 'Cập nhật cầu' : 'Thêm cầu mới'}</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { name: 'name', label: 'Tên cầu', type: 'text', required: true },
            { name: 'material', label: 'Vật liệu', type: 'text' },
            { name: 'district', label: 'Quận', type: 'text' },
            { name: 'built_year', label: 'Năm xây dựng', type: 'number' },
            { name: 'length', label: 'Chiều dài (m)', type: 'number' },
            { name: 'width', label: 'Chiều rộng (m)', type: 'number' },
            { name: 'center_point_wkt', label: 'Tọa độ tâm (WKT)', type: 'text' },
          ].map(({ name, label, type, ...rest }) => (
            <div key={name} className="col-span-1">
              <label className="block font-medium text-gray-700">{label}</label>
              <input
                type={type}
                name={name}
                value={formData[name] || ''}
                onChange={handleChange}
                className="mt-1 w-full border rounded-md p-2 shadow-sm"
                {...rest}
              />
            </div>
          ))}

          <div className="col-span-1 md:col-span-2">
            <label className="block font-medium text-gray-700">Mô tả</label>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="mt-1 w-full border rounded-md p-2 shadow-sm"
            />
          </div>

          <div className="col-span-1">
            <label className="block font-medium text-gray-700">Trạng thái</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="mt-1 w-full border rounded-md p-2"
            >
              <option value="unknown">Chưa biết</option>
              <option value="good">Tốt</option>
              <option value="repair">Đang sửa</option>
              <option value="closed">Đóng cửa</option>
            </select>
          </div>

          <div className="col-span-1">
            <label className="block font-medium text-gray-700">Loại cầu</label>
            <select
              name="bridge_type"
              value={formData.bridge_type}
              onChange={handleChange}
              className="mt-1 w-full border rounded-md p-2"
            >
              <option value="other">Khác</option>
              <option value="beam">Cầu dầm</option>
              <option value="arch">Cầu vòm</option>
              <option value="suspension">Cầu treo</option>
              <option value="cable_stayed">Cầu dây văng</option>
            </select>
          </div>

          <div className="col-span-1 md:col-span-2">
            <label className="block font-medium text-gray-700">Segments</label>
            {segments.map((seg, index) => (
              <div key={index} className="mb-4 border rounded p-2 space-y-2 bg-gray-50">
                <input
                  className="w-full border p-1 rounded"
                  type="text"
                  placeholder="Tên đoạn (segment_name)"
                  value={seg.segment_name}
                  onChange={(e) => handleSegmentChange(index, 'segment_name', e.target.value)}
                />
                <input
                  className="w-full border p-1 rounded"
                  type="number"
                  placeholder="Thứ tự (order)"
                  value={seg.order}
                  onChange={(e) => handleSegmentChange(index, 'order', parseInt(e.target.value, 10))}
                />
                <textarea
                className="w-full border p-1 rounded font-mono text-sm"
                placeholder="GeoJSON coordinates (LineString)"
                value={JSON.stringify(seg.geometry?.coordinates || '')}
                onChange={(e) => handleSegmentChange(index, 'geometry', {
                    type: 'LineString',
                    coordinates: safeParseCoordinates(e.target.value)
                })}
                />
                <button
                type="button"
                className="text-blue-500 text-sm underline"
                onClick={() => {
                    const input = prompt("Dán tọa độ JSON tại đây (phải là mảng [[lng, lat], ...])");
                    const coords = safeParseCoordinates(input);
                    if (coords.length > 0) {
                    handleSegmentChange(index, 'geometry', {
                        type: 'LineString',
                        coordinates: coords,
                    });
                    } else {
                    alert("Dữ liệu không hợp lệ. Hãy chắc chắn bạn dán một mảng JSON hợp lệ.");
                    }
                }}
                >
                📋 Dán tọa độ từ JSON
                </button>
                <button
                  type="button"
                  onClick={() => removeSegment(index)}
                  className="text-red-500 text-sm ml-5"
                >
                  Xoá đoạn này
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addSegment}
              className="mt-2 px-4 py-1 bg-green-500 text-white text-sm rounded"
            >
              + Thêm đoạn
            </button>
          </div>

          <div className="col-span-1 md:col-span-2">
            <label className="block font-medium text-gray-700">Hình ảnh cầu</label>
            <input
              type="file"
              name="image"
              accept="image/*"
              onChange={handleChange}
              className="mt-1 w-full border rounded-md p-2"
            />
          </div>

          <div className="col-span-1 md:col-span-2 text-center">
            <button
              type="submit"
              className="mt-4 px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
            >
              {bridge ? 'Cập nhật cầu' : 'Thêm cầu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const BridgeManagementPage = () => {
  const [bridges, setBridges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingBridge, setEditingBridge] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const loadBridges = async () => {
    try {
      const data = await fetchBridges();
      setBridges(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (status) => {
    const mapping = {
      unknown: "Chưa biết",
      good: "Tốt",
      repair: "Đang sửa",
      closed: "Đóng cửa",
    };
    return mapping[status] || "Không rõ";
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa cầu này?')) return;
    try {
      await deleteBridgeById(id);
      await loadBridges();
    } catch (err) {
      console.error('Lỗi khi xóa:', err);
    }
  };

  useEffect(() => {
    loadBridges();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Quản lý cầu</h2>
        <button
          onClick={() => {
            setEditingBridge(null);
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded"
        >
          <Plus size={16} /> Thêm cầu
        </button>
      </div>

      {showForm && (
        <BridgeForm
          bridge={editingBridge}
          onCancel={() => setShowForm(false)}
          onSuccess={async () => {
            setShowForm(false);
            await loadBridges();
          }}
        />
      )}

      <div className="overflow-auto">
        <table className="min-w-full bg-white rounded shadow">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2 text-left">Tên cầu</th>
              <th className="p-2 text-left">Trạng thái</th>
              <th className="p-2 text-left">Chiều dài (m)</th>
              <th className="p-2 text-center">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="4" className="p-4 text-center">Đang tải...</td>
              </tr>
            ) : bridges.map((b) => (
              <tr key={b.id} className="border-t hover:bg-gray-50">
                <td className="p-2">{b.name}</td>
                <td className="p-2">{getStatusLabel(b.status)}</td>
                <td className="p-2">{b.length}</td>
                <td className="p-2 text-center space-x-2">
                  <button
                    onClick={() => {
                      setEditingBridge(b);
                      setShowForm(true);
                    }}
                    className="text-blue-600 hover:underline"
                    title="Sửa cầu"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(b.id)}
                    className="text-red-600 hover:underline"
                    title="Xóa cầu"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BridgeManagementPage;
