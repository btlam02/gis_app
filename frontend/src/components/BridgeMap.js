import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Polyline, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { fetchBridges } from "../api/bridge";
import Loading from "./Loading";

// Các hàm phụ parse tọa độ & hiển thị màu trạng thái...
function parseWktLineString(wkt) {
  const regex = /LINESTRING\s*\(([^)]+)\)/i;
  const match = wkt.match(regex);
  if (!match) return [];
  const coordsStr = match[1].trim();
  return coordsStr.split(",").map(pair => {
    const parts = pair.trim().split(/\s+/);
    if (parts.length < 2) return null;
    const lng = parseFloat(parts[0]);
    const lat = parseFloat(parts[1]);
    if (isNaN(lat) || isNaN(lng)) return null;
    return [lat, lng];
  }).filter(coord => coord !== null);
}

function statusColor(status) {
  switch (status) {
    case "good": return "green";
    case "repair": return "orange";
    case "closed": return "red";
    default: return "blue";
  }
}

function statusLabel(status) {
  switch (status) {
    case "good": return "Đang hoạt động";
    case "repair": return "Đang sửa chữa";
    case "closed": return "Ngừng khai thác";
    default: return "Chưa rõ ";
  }
}

export default function BridgeMap() {
  const [bridges, setBridges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [visibleSegments, setVisibleSegments] = useState({});
  const [tileType, setTileType] = useState("default");

  const tileUrls = {
    default: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    satellite: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    dark: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
  };

  useEffect(() => {
    fetchBridges()
      .then(data => {
        setBridges(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const defaultCenter = [10.75, 106.68];
  const center = bridges[0]?.center_point
    ? [bridges[0].center_point.coordinates[1], bridges[0].center_point.coordinates[0]]
    : defaultCenter;

  const toggleSegments = (id) => {
    setVisibleSegments(prev => ({ ...prev, [id]: !prev[id] }));
  };

  if (loading) return <><Loading /></>;
  if (error) return <p>Lỗi: {error}</p>;

  return (
    <div className="relative w-full h-full">
      {/* Bộ chọn loại bản đồ */}
    <div className="absolute bottom-4 left-4 z-[1000] bg-white/90 backdrop-blur-sm px-3 py-2 rounded-xl shadow-md flex gap-2">
      {[
        { label: "🗺️", value: "default" },
        { label: "🛰️", value: "satellite" },
        { label: "🌙", value: "dark" },
      ].map(({ label, value }) => (
        <button
          key={value}
          onClick={() => setTileType(value)}
          className={`px-3 py-1.5 min-w-[100px] text-sm font-medium rounded-lg transition-colors duration-200 border ${
            tileType === value
              ? "bg-blue-600 text-white border-blue-600 shadow"
              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
          }`}
        >
          {label}
        </button>
      ))}
    </div>

      <MapContainer center={center} zoom={14} className="w-full h-full">
        <TileLayer
          attribution='&copy; OpenStreetMap, Esri, CartoDB'
          url={tileUrls[tileType]}
        />

        {bridges.map(bridge => {
          const centerPoint = bridge.center_point
            ? [bridge.center_point.coordinates[1], bridge.center_point.coordinates[0]]
            : null;

          if (!centerPoint) return null;

          return (
            <React.Fragment key={bridge.id}>
              <CircleMarker
                center={centerPoint}
                radius={8}
                pathOptions={{
                  color: statusColor(bridge.status),
                  fillColor: statusColor(bridge.status),
                  fillOpacity: 0.8
                }}
                eventHandlers={{ click: () => toggleSegments(bridge.id) }}
              >
                <Popup>
                  <strong>{bridge.name}</strong><br />
                  {bridge.description}<br />
                  Trạng thái: {statusLabel(bridge.status)}<br />
                  Năm xây dựng: {bridge.built_year}<br />
                  <em>(Click để {visibleSegments[bridge.id] ? "ẩn" : "hiện"} đường cầu)</em>
                </Popup>
              </CircleMarker>

              {visibleSegments[bridge.id] && bridge.segments?.features?.map(segment => {
                const positions = parseWktLineString(segment.geometry);
                return (
                  <Polyline
                    key={segment.id}
                    positions={positions}
                    pathOptions={{ color: statusColor(bridge.status), weight: 5 }}
                  />
                );
              })}
            </React.Fragment>
          );
        })}
      </MapContainer>
    </div>
  );
}
