import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

function getAuthHeader() {
  const token = localStorage.getItem('accessToken');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
}

export async function fetchBridges() {
  const res = await axios.get(`${API_URL}/bridges/`);
  return res.data;
}

export async function createBridge(data) {
  const res = await axios.post(`${API_URL}/bridges/`, data, getAuthHeader());
  return res.data;
}

export async function updateBridge(id, data) {
  const res = await axios.put(`${API_URL}/bridges/${id}/`, data, getAuthHeader());
  return res.data;
}

export async function deleteBridgeById(id) {
  await axios.delete(`${API_URL}/bridges/${id}/`, getAuthHeader());
}
