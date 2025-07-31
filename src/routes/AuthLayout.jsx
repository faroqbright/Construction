import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Authentication/Navbar/Navbar";
import construction from "../assets/auth.jpg";

const AuthLayout = () => {
  return (
    <div className="flex flex-col lg:h-screen">
      <div className="flex-shrink-0">
        <Navbar />
      </div>
      <main className="flex-1 flex justify-center items-center overflow-hidden lg:flex-row flex-col m-3">
        <div className="w-full lg:w-2/5 bg-white p-6 shadow-lg rounded-xl max-w-md">
          <Outlet />
        </div>
        <div className="w-full lg:w-2/5 max-w-md lg:ml-8 mt-8 lg:mt-0">
          <div className="relative w-full h-[490px] rounded-md overflow-hidden">
            <img
              src={construction}
              alt="Construction site"
              className="w-full h-full object-cover rounded-2xl"
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default AuthLayout;