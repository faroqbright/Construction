import React, { useState, useEffect, useRef } from "react";
import { FiSettings, FiLogOut } from "react-icons/fi";
import { HiMenuAlt3 } from "react-icons/hi";
import noti from "../../../assets/notif.svg";
import profile from "../../../assets/Profil.svg";
import apiRequest from "../../../utils/apiRequest";
import { removeUserInfo } from "../../../features/auth/authSlice";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import LanguageSwitcher from "./LanguageSwitcher";
import "../../../utils/i18n";
import { useTranslation } from "react-i18next";
import { User } from "lucide-react";

function Navbar({ toggleSidebar, isOpen }) {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const token = useSelector((state) => state?.auth?.userToken);
  const name = useSelector((state) => state?.auth?.userInfo?.userName);
  const profileimg = useSelector((state) => state?.auth?.userInfo?.avatar);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const profileDropdownRef = useRef(null);

  const handleClickOutside = (event) => {
    if (
      profileDropdownRef.current &&
      !profileDropdownRef.current.contains(event.target)
    ) {
      setActiveDropdown(null);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleDropdown = (dropdown) => {
    setActiveDropdown((prev) => (prev === dropdown ? null : dropdown));
  };

  const handleLogout = async () => {
    try {
      if (!token) {
        throw new Error("No token found");
      }
      const response = await apiRequest("post", "/users/logout", {}, token);

      if (response.data.statusCode === 200) {
        dispatch(removeUserInfo());
        navigate("/login");
      }
    } catch (error) {
      if (error?.response?.status === 401) {
        dispatch(removeUserInfo());
        toast.success("You have been logged out.");
        navigate("/login");
      } else {
        console.error("Error:", error);
      }
      console.error("Error:", error);
    }
  };

  return (
    <nav
      className={`bg-white transition-transform duration-300 ${
        isOpen ? "lg:ml-[222px]" : "ml-0"
      } fixed top-0 left-0 w-full lg:ml-8 z-10 py-2`}
    >
      <div className="flex justify-between items-center sm:px-4 px-3 mx-auto w-full">
        <div className="flex items-center space-x-1">
          {!isOpen && (
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-full sm:left-4 left-1 top-4 absolute lg:hidden"
            >
              <HiMenuAlt3 size={20} />
            </button>
          )}
        </div>
        <header
          className={`flex justify-between sm:mx-5 mx-0 ${
            isOpen ? "lg:mr-[254px]" : "ml-0"
          } lg:mr-16 items-center w-full`}
        >
          <div className="ml-7 lg:ml-6">
            <h1 className="sm:text-2xl text-xl font-bold">
              {t("Hi")
                .split(" ")
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ")}
              ,{" "}
              {name
                ? name
                    .split(" ")
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(" ")
                : "Unknown"}
            </h1>

            {/* <p className="text-gray-500 text-sm sm:text-base">
              {t("Lets_finish_your_projects_today!")}
            </p> */}
          </div>
          <div className="flex items-center sm:space-x-4 space-x-2.5">
            <LanguageSwitcher />
            <div className="sm:mr-4">
              <img src={noti} alt="Notification" className="w-6 h-6" />
            </div>
            <div className="cursor-pointer">
              {profileimg ? (
                <img
                  src={profileimg}
                  alt="Profile"
                  className="w-10 h-10 rounded-full"
                  onClick={() => toggleDropdown("profile")}
                  ref={profileDropdownRef}
                />
              ) : (
                <div
                  className="rounded-full"
                  onClick={() => toggleDropdown("profile")}
                  ref={profileDropdownRef}
                >
                  <User
                    className="bg-slate-400 rounded-full px-1 py-2 text-white "
                    size={40}
                  />
                </div>
              )}
            </div>
          </div>
        </header>
      </div>

      {activeDropdown === "profile" && (
        <div
          className={`absolute top-[70px] w-44 ${
            isOpen ? "right-56" : "right-11"
          } bg-white shadow-lg rounded-lg border border-border z-50`}
          ref={profileDropdownRef}
        >
          <ul className="py-2">
            <li
              onClick={() => {
                navigate("/settings");
                setActiveDropdown(null); // Close the dropdown after navigation
              }}
              className="flex items-center px-4 py-2 cursor-pointer hover:bg-gray-100"
            >
              <FiSettings size={20} className="mr-3" />
              <span className="text-sm font-medium">{t("Settings")}</span>
            </li>

            <li
              onClick={handleLogout}
              className="flex items-center px-4 py-2 cursor-pointer"
            >
              <FiLogOut size={20} className="mr-3" />
              <span className="text-sm font-medium">{t("Logout")}</span>
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
}
export default Navbar;
