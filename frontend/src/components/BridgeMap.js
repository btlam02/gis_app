// File: BridgeMap.jsx
import React, { useEffect, useState, useRef } from "react";
import { toast } from "react-toastify";
import {
  MapContainer,
  TileLayer,
  Polyline,
  CircleMarker,
  Popup,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { fetchBridges } from "../api/bridge";
import Loading from "./Loading";
import { Search, Route, Compass, MapPinned} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import L from "leaflet";
import "leaflet-routing-machine";
import axios from "axios";
import { useMapEvents } from "react-leaflet";

function MapClickHandler({ onMapClick, routingEnabled }) {
  useMapEvents({
    click(e) {
      if (!routingEnabled) return;
      onMapClick(e.latlng);
    },
  });

  return null;
}

async function geocodeLocation(query) {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
    query
  )}&format=json&limit=1`;
  try {
    const response = await axios.get(url, {
      headers: { "Accept-Language": "vi" },
    });
    const data = response.data;
    if (data.length > 0) {
      return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
    } else {
      return null;
    }
  } catch (err) {
    console.error("Lỗi khi geocode:", err);
    return null;
  }
}
function parseWktLineString(wkt) {
  const regex = /LINESTRING\s*\(([^)]+)\)/i;
  const match = wkt.match(regex);
  if (!match) return [];
  const coordsStr = match[1].trim();
  return coordsStr
    .split(",")
    .map((pair) => {
      const parts = pair.trim().split(/\s+/);
      if (parts.length < 2) return null;
      const lng = parseFloat(parts[0]);
      const lat = parseFloat(parts[1]);
      if (isNaN(lat) || isNaN(lng)) return null;
      return [lat, lng];
    })
    .filter((coord) => coord !== null);
}

function statusColor(status) {
  switch (status) {
    case "good":
      return "green";
    case "repair":
      return "orange";
    case "closed":
      return "red";
    case "unknown":
      return "gray";
    default:
      return "blue";
  }
}

function statusLabel(status) {
  switch (status) {
    case "good":
      return "Đang hoạt động";
    case "repair":
      return "Đang sửa chữa";
    case "closed":
      return "Ngừng khai thác";
    default:
      return "Chưa rõ";
  }
}

function FlyToLocation({ position, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.flyTo(position, zoom, { duration: 1.5 });
  }, [position]);
  return null;
}

function Routing({ from, to, enabled }) {
  const map = useMap();
  const routingRef = useRef(null);

  useEffect(() => {
    if (!map) return;

    // Nếu đã có control cũ, clear waypoints trước khi remove
    if (routingRef.current) {
      try {
        routingRef.current.setWaypoints([]); // ✅ Dọn sạch
        map.removeControl(routingRef.current); // ✅ Sau đó mới remove
      } catch (err) {
        console.warn("Không thể remove control:", err);
      }
      routingRef.current = null;
    }

    // Nếu không bật hoặc thiếu dữ liệu thì không tạo
    if (!enabled || !from || !to) return;

    const control = L.Routing.control({
      waypoints: [L.latLng(...from), L.latLng(...to)],
      show: true,
      routeWhileDragging: false,
      addWaypoints: false,
      fitSelectedRoutes: true,
      createMarker: () => null,
      lineOptions: { styles: [{ color: "blue", weight: 5 }] },
    }).addTo(map);

    routingRef.current = control;

    // Thêm class tùy chỉnh
    setTimeout(() => {
      const container = document.querySelector(".leaflet-routing-container");
      if (!container) return;

      container.style.display = "none";
      container.classList.add(
        "absolute",
        "top-20",
        "left-4",
        "z-[999]",
        "bg-white",
        "rounded-xl",
        "shadow-xl",
        "p-4",
        "max-w-md",
        "w-full",
        "max-h-[500px]",
        "overflow-y-auto",
        "text-sm",
        "space-y-4",
        "leading-relaxed"
      );

      const alternatives = container.querySelectorAll(".leaflet-routing-alt");
      alternatives.forEach((alt, i) => {
        alt.classList.add(
          "border",
          "border-gray-200",
          "rounded-lg",
          "p-4",
          "bg-gray-50",
          "space-y-3"
        );

        // Format lại h2
        const header = alt.querySelector("h2");
        if (header) {
          const [routeName, routeInfo] = header.innerHTML.trim().split("<br>");
          header.innerHTML = `
            <div class="text-base font-semibold text-blue-700">${routeName}</div>
            <div class="text-sm text-gray-500">${routeInfo}</div>
          `;
          header.classList.add("mb-2");
        }

        // Format bảng chỉ đường
        const table = alt.querySelector("table");
        if (table) {
          table.classList.add("w-full", "text-left", "text-gray-800");

          const rows = table.querySelectorAll("tr");
          rows.forEach((row) => {
            row.classList.add("border-b", "border-gray-200", "py-1");
            row.querySelectorAll("td").forEach((cell) => {
              cell.classList.add("px-2", "py-1", "align-top");
            });
          });
        }
      });
    }, 300);

    return () => {
      if (routingRef.current) {
        try {
          routingRef.current.setWaypoints([]); // ✅ Dọn sạch trước
          map.removeControl(routingRef.current); // ✅ Rồi mới xoá
        } catch (err) {
          console.warn("Lỗi khi cleanup routing:", err);
        }
        routingRef.current = null;
      }
    };
  }, [enabled, from?.[0], from?.[1], to?.[0], to?.[1], map]);

  return null;
}

export default function BridgeMap() {
  const [bridges, setBridges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [visibleSegments, setVisibleSegments] = useState({});
  const [tileType, setTileType] = useState("default");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [highlightedBridge, setHighlightedBridge] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [destinationCoords, setDestinationCoords] = useState(null);
  const [routingEnabled, setRoutingEnabled] = useState(false);
  const [routeStart, setRouteStart] = useState(null);
  const [routeEnd, setRouteEnd] = useState(null);

  const tileUrls = {
    default: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    satellite:
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    dark: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
  };

  useEffect(() => {
    fetchBridges()
      .then((data) => {
        setBridges(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation([pos.coords.latitude, pos.coords.longitude]),
        (err) => console.error(err)
      );
    }
  }, []);


  useEffect(() => {
    if (searchQuery.trim() === "") {
      setHighlightedBridge(null);
      setRouteStart(null);
      setRouteEnd(null);
    }
  }, [searchQuery]);

  const defaultCenter = [10.75, 106.68];
  const firstBridge = bridges.find((b) => b.center_point);
  const center = firstBridge
    ? [
        firstBridge.center_point.coordinates[1],
        firstBridge.center_point.coordinates[0],
      ]
    : defaultCenter;

  const toggleSegments = (id) => {
    setVisibleSegments((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSearch = async () => {
    const searchLower = searchQuery.trim().toLowerCase();

    // 0. Kiểm tra từ khóa quá chung chung hoặc quá ngắn
    const genericKeywords = ["cầu", "bridge", "cây cầu"];
    if (genericKeywords.includes(searchLower) || searchLower.length <= 2) {
      toast.info(
        "Vui lòng nhập chi tiết tên cầu hơn (ví dụ: “Cầu Sài Gòn”) hoặc địa điểm cụ thể."
      );
      return;
    }

    // 1. Ưu tiên tìm khớp chính xác tên cầu
    let bridge = bridges.find(
      (b) => b.name.trim().toLowerCase() === searchLower
    );

    // 2. Nếu không thấy, tìm bao gồm từ khóa
    if (!bridge) {
      bridge = bridges.find((b) => b.name.toLowerCase().includes(searchLower));
    }

    if (bridge && bridge.center_point) {
      const coords = [
        bridge.center_point.coordinates[1],
        bridge.center_point.coordinates[0],
      ];

      setHighlightedBridge({ id: bridge.id, coords });

      if (routingEnabled && userLocation) {
        setRouteStart(userLocation);
        setRouteEnd(coords);
      }
      return;
    }

    // 3. Nếu không phải cầu, thử tìm địa điểm bằng geocode
    const geoCoords = await geocodeLocation(searchQuery);
    if (geoCoords) {
      setHighlightedBridge({ id: "search", coords: geoCoords });

      if (routingEnabled && userLocation) {
        setRouteStart(userLocation);
        setRouteEnd(geoCoords);
      }
      return;
    }

    const coordRegex = /^(-?\d+(\.\d+)?)[,\s]+(-?\d+(\.\d+)?)$/;
    const coordMatch = searchQuery.match(coordRegex);
    if (coordMatch) {
      const lat = parseFloat(coordMatch[1]);
      const lng = parseFloat(coordMatch[3]);
      const coords = [lat, lng];

      setHighlightedBridge({ id: "coordinate-search", coords });

      if (routingEnabled && userLocation) {
        setRouteStart(userLocation);
        setRouteEnd(coords);
      }
      return;
    }

    
    toast.warning(
      "Không tìm thấy địa điểm hoặc tên cầu trong hệ thống. Có thể cầu chưa được cập nhật."
    );
  };

  if (loading) return <Loading />;
  if (error) return <p>Lỗi: {error}</p>;

  return (
    <div className="relative w-full h-full">
      <div className="absolute bottom-5 xl:bottom-4 left-4 z-[1000] bg-white/90 backdrop-blur-sm px-3 py-2 rounded-xl shadow-md flex gap-2">
        {["Bản đồ", "Vệ tinh", "Tối"].map((label, i) => {
          const value = ["default", "satellite", "dark"][i];
          return (
            <button
              key={value}
              onClick={() => setTileType(value)}
              className={`px-3 py-1.5 min-w-[100px] text-sm font-medium rounded-lg border transition-colors ${
                tileType === value
                  ? "bg-blue-600 text-white border-blue-600 shadow"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      <div className="absolute bottom-20 right-6 xl:bottom-4 xl:right-4 z-[1000] flex items-center gap-2">
        <button
          onClick={() => {
            if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition(
                (pos) => {
                  const coords = [pos.coords.latitude, pos.coords.longitude];
                  setUserLocation(coords);
                  setHighlightedBridge({ id: "me", coords });
                },
                (err) => {
                  toast.error("Không thể lấy vị trí hiện tại.");
                  console.error(err);
                }
              );
            } else {
              toast.warn("Trình duyệt không hỗ trợ định vị.");
            }
          }}
          className="bg-white rounded-full p-2 shadow hover:bg-gray-100 transition"
        >
          <MapPinned size={16} />
        </button>
      </div>

      <div className="absolute top-4 right-4 z-[1000] flex items-center gap-2">
        <button
          onClick={() => setSearchOpen(!searchOpen)}
          className="bg-white rounded-full p-2 shadow hover:bg-gray-100 transition"
        >
          <Search size={16} />
        </button>
        <button
          onClick={() => {
            const newState = !routingEnabled;
            setRoutingEnabled(newState);
            if (!newState) {
              setRouteStart(null);
              setRouteEnd(null);
            }
          }}
          className={`rounded-full p-2 shadow hover:bg-blue-500 hover:text-white transition ${
            routingEnabled
              ? "bg-blue-500 text-white hover:bg-gray-200 hover:text-black "
              : "bg-white"
          }`}
        >
          <Route size={16} />
        </button>

        {routingEnabled && (
          <button
            onClick={() => {
              if (!routeStart || !routeEnd) {
                toast.warning(
                  "Vui lòng chọn điểm bắt đầu và điểm đến để hiển thị chỉ đường."
                );
                return;
              }

              const el = document.querySelector(".leaflet-routing-container");
              if (el) {
                el.style.display =
                  el.style.display === "none" ? "block" : "none";
              }
            }}
            className="bg-white rounded-full p-2 shadow hover:bg-gray-100 transition"
          >
            <Compass size={16} />
          </button>
        )}

        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 240, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="flex gap-3 w-auto bg-white rounded-xl px-2 py-1 shadow border">
                <input
                  type="text"
                  placeholder="Tên cầu..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="flex-1 outline-none px-2 text-sm"
                />
                <button
                  onClick={handleSearch}
                  className="text-blue-600 hover:text-blue-800 font-small"
                >
                  Tìm
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <MapContainer center={center} zoom={14} className="w-screen h-screen">
        <TileLayer
          attribution="&copy; OpenStreetMap, Esri, CartoDB"
          url={tileUrls[tileType]}
        />

        <MapClickHandler
          routingEnabled={routingEnabled}
          onMapClick={(latlng) => {
            const latLngArray = [latlng.lat, latlng.lng];
            if (!routeStart) {
              setRouteStart(latLngArray);
              toast.info("Đã chọn điểm bắt đầu");
            } else if (!routeEnd) {
              setRouteEnd(latLngArray);
              toast.info("Đã chọn điểm đến");
            } else {
              // Nếu cả hai đã có, reset và đặt lại điểm bắt đầu
              setRouteStart(latLngArray);
              setRouteEnd(null);
              toast.info("Đã đặt lại điểm bắt đầu. Vui lòng chọn điểm đến.");
            }
          }}
        />

        {highlightedBridge && (
          <>
            <FlyToLocation position={highlightedBridge.coords} zoom={17} />
            <CircleMarker
              center={highlightedBridge.coords}
              interactive={false}
              radius={14}
              pathOptions={{
                color: "gold",
                fillColor: "yellow",
                fillOpacity: 0.9,
              }}
            />
          </>
        )}

        {routingEnabled && routeStart && routeEnd && (
          <Routing from={routeStart} to={routeEnd} enabled={routingEnabled} />
        )}

        {bridges.map((bridge) => {
          const centerPoint = bridge.center_point
            ? [
                bridge.center_point.coordinates[1],
                bridge.center_point.coordinates[0],
              ]
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
                  fillOpacity: 0.8,
                }}
                eventHandlers={{
                  click: () => {
                    if (routingEnabled) {
                      if (!routeStart) {
                        setRouteStart(centerPoint);
                        setRouteEnd(null);
                      } else if (!routeEnd) {
                        setRouteEnd(centerPoint);
                      } else {
                        setRouteStart(centerPoint);
                        setRouteEnd(null);
                      }
                    } else {
                      toggleSegments(bridge.id);
                    }
                  },
                }}
              >
                <Popup>
                  <strong>{bridge.name}</strong>
                  <br />
                  Chất liệu: {bridge.material}
                  <br />
                  Trạng thái: {statusLabel(bridge.status)}
                  <br />
                  Năm xây dựng: {bridge.built_year}
                </Popup>
              </CircleMarker>

              {visibleSegments[bridge.id] &&
                bridge.segments?.features?.map((segment) => {
                  const positions = parseWktLineString(segment.geometry);
                  return (
                    <Polyline
                      key={segment.id}
                      positions={positions}
                      pathOptions={{
                        color: statusColor(bridge.status),
                        weight: 5,
                      }}
                    />
                  );
                })}
            </React.Fragment>
          );
        })}

        {routeStart && routingEnabled && (
          <CircleMarker
            center={routeStart}
            radius={10}
            pathOptions={{ color: "orange" }}
          >
            <Popup>Điểm bắt đầu</Popup>
          </CircleMarker>
        )}

        {routeEnd && routingEnabled && (
          <CircleMarker
            center={routeEnd}
            radius={10}
            pathOptions={{ color: "purple" }}
          >
            <Popup>Điểm đến</Popup>
          </CircleMarker>
        )}
      </MapContainer>
    </div>
  );
}
