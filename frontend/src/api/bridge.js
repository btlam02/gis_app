import axios from "axios";


const API_URL = process.env.REACT_APP_API_URL

export async function fetchBridges() {
  try {
    const response = await axios.get(`${API_URL}/bridges/view/`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || error.message || "Lỗi khi tải dữ liệu cầu");
  }
}
