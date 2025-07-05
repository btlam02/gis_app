import React, { useEffect, useState } from "react";
import { fetchBridges } from "../api/bridge"; 
import Loading from "./Loading";

function BridgeList() {
  const [bridges, setBridges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  if (loading) return (<><Loading/></>);
  if (error) return <p>{error}</p>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Danh sách các cây cầu</h2>
      <table className="min-w-full bg-white border">
        <thead>
          <tr className="bg-gray-100">
            <th className="py-2 px-4 border">Tên cầu</th>
            <th className="py-2 px-4 border">Quận</th>
            <th className="py-2 px-4 border">Chiều dài</th>
            <th className="py-2 px-4 border">Chất liệu</th>
          </tr>
        </thead>
        <tbody>
          {bridges.map((bridge) => (
            <tr key={bridge.id}>
              <td className="py-2 px-4 border">{bridge.name}</td>
              <td className="py-2 px-4 border">{bridge.district}</td>
              <td className="py-2 px-4 border">{bridge.length} m</td>
              <td className="py-2 px-4 border">{bridge.material}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default BridgeList;
