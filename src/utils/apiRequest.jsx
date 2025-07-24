import axios from "axios";

const BASE_URL =
  window.location.hostname === "localhost" ||
  window.location.hostname.includes("vercel.app") ||
  window.location.hostname.includes("netlify.app")
    ? "http://localhost:8080/api/v1"
    : window.location.hostname.includes("techbytech")
    ? "https://api.appsoapro.techbytech.tech/api/v1"
    : "https://appsoapro.serveng.ao/backend/api/v1";

const apiRequest = async (method, url, data = {}, token, headers = {}) => {
  const config = {
    method: method.toLowerCase(),
    url: `${BASE_URL}${url}`,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    withCredentials: true,
  };

  switch (method.toLowerCase()) {
    case "get":
    case "delete":
      config.params = data;
      break;
    case "post":
    case "put":
    case "patch":
      config.data = data;
      break;
    default:
      throw new Error(`Unsupported request method: ${method}`);
  }

  try {
    const response = await axios(config);
    return response;
  } catch (error) {
    console.error("API Request Error:", error);
    throw error;
  }
};

export default apiRequest;
