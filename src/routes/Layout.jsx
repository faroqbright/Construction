import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/LandingPage/CommonUi/Sidebar";
import Navbar from "../components/LandingPage/CommonUi/Navbar";
import Footer from "../components/LandingPage/CommonUi/Footer";

const Layout = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  return (
    <div className="relative h-screen flex flex-col">
      <Navbar toggleSidebar={toggleSidebar} isOpen={isSidebarOpen} />
      <div className="flex h-full font-raleway">
        <div
          className={`${
            isSidebarOpen ? "lg:w-64 w-0" : "lg:w-16 w-0"
          } transition-width duration-300 lg:block`} 
        >
          <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
        </div>
        <div className="flex-1 h-[87vh] 2xl:h-[88vh] overflow-y-auto mt-20">
          <main>
            <Outlet context={{ isSidebarOpen }} />
          </main>
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default Layout;
