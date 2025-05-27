import axios from "axios";

const BASE_URL =
  window.location.hostname === "localhost" ||
  window.location.hostname.includes("vercel.app") ||
  window.location.hostname.includes("netlify.app")
    ? "https://constructionbe-production.up.railway.app/api/v1"
    : "https://appsoapro.serveng.ao/backend/api/v1";

const apiRequest = async (method, url, data = {}, token, headers = {}) => {
  const config = {
    method: method.toLowerCase(), // Normalize method to lowercase
    url: `${BASE_URL}${url}`, // Dynamically set base URL
    headers: {
      Authorization: `Bearer ${token}`,
      ...headers,
    },
  };

  switch (method.toLowerCase()) {
    case "get":
    case "delete":
      config.params = data; // For GET and DELETE requests, use params
      break;
    case "post":
    case "put":
    case "patch":
      config.data = data; // For POST, PUT, and PATCH requests, use data
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
