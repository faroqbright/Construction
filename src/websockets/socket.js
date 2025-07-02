import { io } from "socket.io-client";
// const socket = io("http://localhost:1000"); // Replace with your backend URL
const socket = io("https://appsoapro.serveng.ao/api/api/v1"); // Replace with your backend URL
socket.on("connect", () => {
    console.log("Socket connected to server");
  });
  
  // Handle connection errors
  socket.on("connect_error", (error) => {
    console.error("Socket connection error:", error);
  });
  
export default socket;
