import { io } from "socket.io-client";
// const socket = io("http://localhost:1000"); // Replace with your backend URL
const socket = io("http://appsoapro.techbytech.tech:8081"); // Replace with your backend URL
socket.on("connect", () => {
    console.log("Socket connected to server");
  });
  
  // Handle connection errors
  socket.on("connect_error", (error) => {
    console.error("Socket connection error:", error);
  });
  
export default socket;
