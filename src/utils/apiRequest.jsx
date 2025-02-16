import axios from "axios";
// import { toast } from "react-toastify";

// Utility function to make authenticated API requests
const apiRequest = async (method, url, data = {}, token, headers = {}) => {
  const config = {
    method: method.toLowerCase(), // Normalize method to lowercase
    url: `http://localhost:8080${url}`, // Correct URL concatenation
    headers: {
      Authorization: `Bearer ${token}`, // Fixed template literal syntax
      ...headers,
    },
  };

  // Handle data or params based on request method
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
      throw new Error(`Unsupported request method: ${method}`); // Fixed error string
  }

  try {
    const response = await axios(config);
    return response;
  } catch (error) {
    console.error("API Request Error:", error);
    // toast.error("An error occurred. Please try again later.");
    throw error;
  }
};

export default apiRequest;
