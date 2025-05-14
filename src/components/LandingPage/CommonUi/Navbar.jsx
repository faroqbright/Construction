import { useState, useEffect, useRef } from "react";
import { FiSettings, FiLogOut } from "react-icons/fi";
import { HiMenuAlt3 } from "react-icons/hi";
import noti from "../../../assets/notif.svg";
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
  const userInfo = useSelector((state) => state?.auth?.userInfo);
  const name = userInfo?.userName;
  const profileimg = userInfo?.avatar;
  const userId = userInfo?._id;
  const memberId = userInfo?._id;
  
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const profileDropdownRef = useRef(null);
  const notificationDropdownRef = useRef(null); 

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleApiLanguageChange = async (languageCode) => {
    if (!userId || !token) {
      return;
    }

    let languageSelectedForApi;
    if (languageCode && languageCode.toLowerCase().startsWith("pt")) {
      languageSelectedForApi = "portuguese";
    } else if (languageCode && languageCode.toLowerCase().startsWith("en")) {
      languageSelectedForApi = "english";
    } else {
      return; 
    }

    const endpoint = `/language/${userId}`;
    const payload = {
      languageSelected: languageSelectedForApi,
    };

    try {
      await apiRequest("put", endpoint, payload, token);
    } catch (error) {
      if (error?.response?.status === 401) {
        toast.error(t("Session expired. Please log in again.")); 
        dispatch(removeUserInfo());
        navigate("/login");
      }
    }
  };

  const fetchNotifications = async (isInitial = false) => {
    if (!userId) return;
  
    if (isInitial) setLoading(true);
  
    try {
      const response = await apiRequest("get", "/shownotifications", {}, token);
      if (response.data?.success && response.data?.data) {
        const filteredNotifications = response.data.data.filter(
          (notification) =>
            notification.memberId === userId 
            // notification.projectId === userId ||
            // notification._id === userId
        );
  
        const transformedNotifications = filteredNotifications.map(
          (notification) => ({
            id: notification._id,
            iconType: 'user',
            title: notification.title,
            description: notification.description,
            createdAt: new Date(notification.createdAt).toLocaleString(),
            isRead: notification.isRead,
          })
        );
        
        setNotifications((prev) => {
          const existingIds = new Set(prev.map((n) => n.id));
          const newOnes = transformedNotifications.filter(
            (n) => !existingIds.has(n.id)
          );
          const currentNonNew = prev.filter(p => !newOnes.find(n => n.id === p.id));
          return [...newOnes, ...currentNonNew];
        });
      }
    } catch (error) {
      if (error?.response?.status === 401) {
        toast.success(t("You have been logged out."));
        dispatch(removeUserInfo());
        navigate("/login");
      }
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  const handleDeleteNotifications = async () => {
    try {
      const response = await apiRequest(
        "delete",
        `/shownotifications/${memberId}`,
        {},
        token
      );

      if (response.data?.success) {
        toast.success(t("Notifications cleared successfully"));
        setNotifications([]);
      }
    } catch (error) {
      toast.error(t("Failed to clear notifications."));
    }
  };

  const handleClickOutside = (event) => {
    if (
      activeDropdown === "profile" &&
      profileDropdownRef.current &&
      !profileDropdownRef.current.contains(event.target)
    ) {
      setActiveDropdown(null);
    }
    if (
      activeDropdown === "notification" &&
      notificationDropdownRef.current &&
      !notificationDropdownRef.current.contains(event.target)
    ) {
      setActiveDropdown(null);
    }
  };
  

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [activeDropdown]);

  useEffect(() => {
    if (!userId || !token) return;

    fetchNotifications(true);

    const interval = setInterval(() => {
      fetchNotifications();
    }, 7000);

    return () => clearInterval(interval);
  }, [userId, token]);

  const toggleDropdown = (dropdown) => {
    if (dropdown === "notification" && activeDropdown !== "notification") {
      fetchNotifications();
    }
    setActiveDropdown((prev) => (prev === dropdown ? null : dropdown));
  };

  const handleLogout = async () => {
    try {
      const response = await apiRequest("post", "/users/logout", {}, token);

      if (response.data.statusCode === 200) {
        dispatch(removeUserInfo());
        navigate("/login");
      }
    } catch (error) {
      if (error?.response?.status === 401) {
        dispatch(removeUserInfo());
        toast.success(t("You have been logged out."));
        navigate("/login");
      }
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
                : t("User")}
            </h1>
          </div>
          <div className="flex items-center sm:space-x-4 space-x-2.5">
            <LanguageSwitcher onLanguageChange={handleApiLanguageChange} /> 
            
            <div className="sm:mr-4 relative">
              <img
                src={noti}
                alt="Notification"
                className="w-6 h-6 cursor-pointer"
                onClick={() => toggleDropdown("notification")}
              />
              {notifications.some((n) => !n.isRead) && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {notifications.filter((n) => !n.isRead).length}
                </span>
              )}
            </div>
            <div className="cursor-pointer">
              {profileimg ? (
                <img
                  src={profileimg}
                  alt="Profile"
                  className="w-10 h-10 rounded-full"
                  onClick={() => toggleDropdown("profile")}
                />
              ) : (
                <div
                  className="rounded-full"
                  onClick={() => toggleDropdown("profile")}
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

      {activeDropdown === "notification" && (
        <div
          className={`absolute top-[60px] w-96 ${
            isOpen && typeof window !== 'undefined' && window.innerWidth >= 1024 ? "right-[280px]" : "right-[100px]"
          } bg-white shadow-lg rounded-lg border border-border z-50`}
          ref={notificationDropdownRef} 
        >
          <div className="flex justify-between">
            <div className="p-4 border-b border-border">
              <h3 className="font-semibold text-lg">{t("Notifications")}</h3>
            </div>
            <button
              onClick={handleDeleteNotifications}
              className="font-semibold text-base pr-4 text-red-500 underline"
            >
              {t("Clear")}
            </button>
          </div>
          {loading ? (
            <div className="p-4 text-center">
              <p>{t("Loading notifications...")}</p>
            </div>
          ) : (
            <>
              <ul className="max-h-80 overflow-y-auto">
                {notifications.map((notification) => (
                  <li
                    key={notification.id}
                    className={`border-b border-border last:border-b-0 ${
                      !notification.isRead ? "bg-blue-50" : ""
                    }`}
                    onClick={() => {
                      navigate(`/notificationDetails/${notification.id}`, {
                        state: { 
                          notification: {
                            ...notification,
                            icon: undefined 
                          } 
                        },
                      });
                      setActiveDropdown(null);
                    }}
                  >
                    <div className="p-4 hover:bg-gray-50 cursor-pointer">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          {notification.iconType === 'user' ? <User size={20} className="text-gray-400" /> : (notification.icon || <User size={20} className="text-gray-400" />)}
                        </div>
                        <div className="flex-1 space-y-1">
                          <h4 className="text-sm font-medium">
                            {notification.title}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {notification.description}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {notification.createdAt}
                          </p>
                        </div>
                        {!notification.isRead && (
                          <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              {notifications.length === 0 && (
                <div className="p-4 text-center text-gray-500">
                  {t("No notifications available")}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {activeDropdown === "profile" && (
        <div
          className={`absolute top-[70px] w-44 ${
             isOpen && typeof window !== 'undefined' && window.innerWidth >= 1024 ? "right-[224px]" : "right-[44px]"
          } bg-white shadow-lg rounded-lg border border-border z-50`}
          ref={profileDropdownRef}
        >
          <ul className="py-2">
            <li
              onClick={() => {
                navigate("/settings");
                setActiveDropdown(null);
              }}
              className="flex items-center px-4 py-2 cursor-pointer hover:bg-gray-100"
            >
              <FiSettings size={20} className="mr-3" />
              <span className="text-sm font-medium">{t("Settings")}</span>
            </li>

            <li
              onClick={handleLogout}
              className="flex items-center px-4 py-2 cursor-pointer hover:bg-gray-100"
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