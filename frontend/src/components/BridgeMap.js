import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Polyline, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { fetchBridges } from "../api/bridge";

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
  switch(status) {
    case "good": return "green";
    case "warning": return "orange";
    case "bad": return "red";
    default: return "blue";
  }
}

export default function BridgeMap() {
  const [bridges, setBridges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // State quản lý cầu nào đang mở hiển thị segment
  const [visibleSegments, setVisibleSegments] = useState({});

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

  if (loading) return <p>Đang tải dữ liệu cầu...</p>;
  if (error) return <p>Lỗi: {error}</p>;
  if (bridges.length === 0) return <p>Không có dữ liệu cầu.</p>;

  const defaultCenter = [10.75, 106.68];
  const center = bridges[0]?.center_point
    ? [bridges[0].center_point.coordinates[1], bridges[0].center_point.coordinates[0]]
    : defaultCenter;

  // Hàm toggle hiển thị đoạn đường của cầu
  function toggleSegments(id) {
    setVisibleSegments(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  }

  return (
    <MapContainer center={center} zoom={14} className="w-full h-full">
      <TileLayer
        attribution='&copy; <a href="https://osm.org">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
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
              pathOptions={{ color: statusColor(bridge.status), fillColor: statusColor(bridge.status), fillOpacity: 0.8 }}
              eventHandlers={{
                click: () => toggleSegments(bridge.id)
              }}
            >
              <Popup>
                <strong>{bridge.name}</strong><br />
                {bridge.description}<br />
                Status: {bridge.status}<br />
                Built year: {bridge.built_year}<br />
                <em>(Click chấm để {visibleSegments[bridge.id] ? "ẩn" : "hiện"} đường cầu)</em>
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
  );
}
