import axios from "axios";
import { API_URL } from "../shared/constants/api";

export const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
  headers: {
    "Content-Type": "application/json",
  },
  maxRedirects: 0,
});
