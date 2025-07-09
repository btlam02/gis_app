// src/components/Dashboard/Statistics.jsx
import React, { useEffect, useState } from "react";
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import { fetchBridges } from "../../api/bridge";

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#8dd1e1", "#a4de6c", "#d0ed57"];

const translateStatus = {
  good: "Tốt",
  repair: "Đang sửa chửa",
  closed: "Ngừng khai thác",
};

const translateBridgeType = {
  arch: "Cầu vòm",
  beam: "Cầu dầm",
  suspension: "Cầu treo",
  cable_stayed: "Cầu dây văng",
};

const Statistics = () => {
  const [bridges, setBridges] = useState([]);
  const [byDistrict, setByDistrict] = useState([]);
  const [byYear, setByYear] = useState([]);
  const [byMaterial, setByMaterial] = useState([]);
  const [byStatus, setByStatus] = useState([]);
  const [byType, setByType] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      const data = await fetchBridges();
      setBridges(data);
      processStats(data);
    };
    loadData();
  }, []);

  const processStats = (data) => {
    const districtMap = {};
    const yearMap = {};
    const materialMap = {};
    const statusMap = {};
    const typeMap = {};

    data.forEach((bridge) => {
      // Quận
      const districts = bridge.district?.split(",").map(d => d.trim()) || [];
      districts.forEach(d => {
        districtMap[d] = (districtMap[d] || 0) + 1;
      });

      // Năm xây dựng
      const year = String(bridge.built_year || "");
      if (year !== "") yearMap[year] = (yearMap[year] || 0) + 1;

      // Chất liệu
      const material = bridge.material || "Không rõ";
      materialMap[material] = (materialMap[material] || 0) + 1;

      // Tình trạng
      const status = bridge.status || "unknown";
      statusMap[status] = (statusMap[status] || 0) + 1;

      // Loại cầu
      const type = bridge.bridge_type || "unknown";
      typeMap[type] = (typeMap[type] || 0) + 1;
    });

    // Convert to array + sort if needed
    setByDistrict(Object.entries(districtMap).map(([name, count]) => ({ name, count })));
    setByYear(
      Object.entries(yearMap)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => a.name.localeCompare(b.name))
    );
    setByMaterial(Object.entries(materialMap).map(([name, count]) => ({ name, count })));
    setByStatus(
      Object.entries(statusMap)
        .map(([name, count]) => ({ name: translateStatus[name] || name, count }))
        .sort((a, b) => b.count - a.count)
    );
    setByType(
      Object.entries(typeMap).map(([name, count]) => ({
        name: translateBridgeType[name] || name,
        count,
      }))
    );
  };

  return (
    <div className="p-4 space-y-6">
      <h2 className="text-2xl font-bold">Biểu đồ thống kê</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Theo Quận */}
        <ChartCard title="Số cầu theo Quận">
          <BarChart data={byDistrict}>
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="count" fill="#8884d8" />
          </BarChart>
        </ChartCard>

        {/* Theo Năm xây dựng */}
        <ChartCard title="Số cầu theo Năm xây dựng">
          <BarChart data={byYear}>
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="count" fill="#82ca9d" />
          </BarChart>
        </ChartCard>

        {/* Tình trạng cầu */}
        <ChartCard title="Tình trạng cầu">
          <PieChart>
            <Pie
              data={byStatus}
              dataKey="count"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label
            >
              {byStatus.map((entry, index) => (
                <Cell key={`status-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Legend />
            <Tooltip />
          </PieChart>
        </ChartCard>

        {/* Loại cầu */}
        <ChartCard title="Loại cầu">
        <PieChart>
            <Pie
                data={byType}
                dataKey="count"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                labelLine={false}
            >
                {byType.map((entry, index) => (
                <Cell key={`type-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
            </Pie>
            <Legend wrapperStyle={{ fontSize: '14px' }} />
            <Tooltip />
        </PieChart>

        </ChartCard>

        {/* Chất liệu cầu */}
        <ChartCard title="Tỷ lệ cầu theo Chất liệu" className="col-span-1 md:col-span-2">
          <PieChart>
            <Pie
              data={byMaterial}
              dataKey="count"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label
            >
              {byMaterial.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Legend />
            <Tooltip />
          </PieChart>
        </ChartCard>
      </div>
    </div>
  );
};

// Card bọc biểu đồ
const ChartCard = ({ title, children, className = "" }) => (
  <div className={`bg-white p-4 rounded shadow ${className}`}>
    <h3 className="text-lg font-bold mb-2">{title}</h3>
    <ResponsiveContainer width="100%" height={300}>
      {children}
    </ResponsiveContainer>
  </div>
);

export default Statistics;
