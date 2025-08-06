import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { HiMenuAlt3 } from "react-icons/hi";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import logo from "../../../assets/logo1.png";
import book from "../../../assets/book.png";
import user from "../../../assets/user-octagon.png";
import group from "../../../assets/Group.png";
import client from "../../../assets/client.png";
import message from "../../../assets/message.png";
import users from "../../../assets/user.png";
import solar from "../../../assets/solar_user-broken.png";
import dash from "../../../assets/category-2.png";
import report from "../../../assets/iconoir_reports.png";
import building from "../../../assets/building-2.png";
import { useSelector } from "react-redux";
import "../../../utils/i18n";
import { useTranslation } from "react-i18next";

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const [reportDropdown, setReportDropdown] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const accesuser = useSelector(
    (state) => state?.auth?.userInfo?.role?.permissions
  );
  const Admin = useSelector((state) => state?.auth?.userInfo?.isMain);

  const showRolesUsersButton =
    Admin ||
    accesuser?.some(
      (p) =>
        (p.module === "UsersManagement" || p.module === "RolesManagement") &&
        p.read
    );

  const sidebarItems = [
    { icon: dash, label: t("Dashboard"), to: "/", module: null },
    {
      icon: book,
      label: t("Project_Management"),
      to: "/project-management",
      module: "ProjectsManagement",
    },
    {
      icon: user,
      label: t("Billing"),
      to: "/finance",
      module: "FinanceManagement",
    },
    {
      icon: group,
      label: t("History"),
      to: "/history",
      module: "HistoryManagement",
    },
    ...(Admin
      ? [
          {
            icon: report,
            label: t("Reports"),
            to: "/report?tab=all",
            module: "ReportsManagement",
            isDropdown: true,
            dropdownItems: [
              { label: t("Pending_Reports"), to: "/report?tab=pending" },
              { label: t("Approved_Reports"), to: "/report?tab=approved" },
              { label: t("Rejected_Reports"), to: "/report?tab=rejected" },
            ],
          },
        ]
      : [
          {
            icon: report,
            label: t("Reports"),
            to: "/userReports",
            module: "ReportsManagement",
          },
        ]),
    {
      icon: client,
      label: t("Client_Evaluation"),
      to: "/client-evaluation",
      module: "EvaluationManagement",
    },
    {
      icon: message,
      label: t("Notifications"),
      to: "/notifications",
      module: null,
    },
    ...(showRolesUsersButton
      ? [
          {
            icon: users,
            label: t("Roles_&_Users"),
            to: "/roles-users",
            module: null,
          },
        ]
      : []),
    {
      icon: solar,
      label: t("All_Clients"),
      to: "/all-companies",
      module: "ClientsManagement",
    },
    {
      icon: building,
      label: t("All_Companies"),
      to: "/all-clients",
      module: "CompanyManagement",
    },
  ];

  const filteredItems = Admin
    ? sidebarItems
    : sidebarItems.filter((item) => {
        if (!item.module) return true;
        const modulePermissions = accesuser?.find(
          (p) => p.module === item.module
        );
        return modulePermissions
          ? (modulePermissions.create ||
              modulePermissions.update ||
              modulePermissions.delete ||
              modulePermissions.read) &&
              modulePermissions.read
          : false;
      });

  const handleReportClick = (event, item) => {
    if (item.isDropdown) {
      event.preventDefault();
      navigate(item.to);
      setReportDropdown(true);
    }
  };

  return (
    <div
      className={`relative bg-white h-screen shadow-md transition-all duration-300 ${
        isOpen ? "w-64" : "lg:w-16 w-0"
      } ${isOpen ? "absolute top-0 left-0 z-20" : "z-10"} overflow-hidden`}
    >
      <div className="sticky top-0 z-10 bg-white">
        <div
          className={`flex items-center ${
            isOpen ? "justify-between px-4" : "justify-center"
          } py-4`}
        >
          <HiMenuAlt3
            className="text-2xl cursor-pointer"
            onClick={toggleSidebar}
          />
          {isOpen && (
            <div className="flex-1 flex justify-center">
              <img src={logo} alt="Logo" className="w-24" />
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col h-[calc(100vh-64px)] overflow-y-auto scrollbar-custom">
        <ul className="text-lightpurple-light px-2 mt-[9px]">
          {filteredItems.map((item, index) => (
            <li key={index} className="mb-2">
              {item.isDropdown ? (
                <div>
                  <button
                    onClick={(e) => handleReportClick(e, item)}
                    className={`flex items-center ${
                      isOpen ? "p-3" : "p-[10px]"
                    } rounded-lg w-full transition duration-300 ${
                      reportDropdown
                        ? "bg-gray-100 text-black"
                        : "hover:bg-gray-200 group"
                    }`}
                  >
                    <img
                      src={item.icon}
                      alt={`${item.label} Icon`}
                      className={`transition-all duration-300 w-6 h-6 ${"group-hover:filter group-hover:invert group-hover:brightness-0"}`}
                    />
                    {isOpen && (
                      <span className="ml-3 text-sm transition-all duration-300">
                        {item.label}
                      </span>
                    )}
                    {isOpen && (
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          setReportDropdown(!reportDropdown);
                        }}
                        className="ml-auto cursor-pointer"
                      >
                        {reportDropdown ? (
                          <IoIosArrowUp className="text-lg" />
                        ) : (
                          <IoIosArrowDown className="text-lg" />
                        )}
                      </span>
                    )}
                  </button>
                  {reportDropdown && isOpen && (
                    <ul className="ml-12 mt-2 space-y-2">
                      {item.dropdownItems.map((dropdownItem, idx) => (
                        <li key={idx}>
                          <NavLink
                            to={dropdownItem.to}
                            className="flex items-center text-sm text-lightpurple-light font-semibold hover:text-black"
                          >
                            <span className="w-2.5 h-2.5 bg-lightpurple-light rounded-full mr-2"></span>
                            {dropdownItem.label}
                          </NavLink>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : (
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center ${
                      isOpen ? "p-3" : "p-[10px]"
                    } rounded-lg transition duration-300 ${
                      isActive
                        ? "bg-black-blacknew text-white group"
                        : "hover:bg-gray-200 group"
                    }`
                  }
                >
                  <img
                    src={item.icon}
                    alt={`${item.label} Icon`}
                    className={`transition-all duration-300 w-6 h-6 ${"group-hover:filter group-hover:invert group-hover:brightness-0"}`}
                  />
                  {isOpen && (
                    <span className="ml-3 text-sm transition-all duration-300">
                      {item.label}
                    </span>
                  )}
                </NavLink>
              )}
            </li>
          ))}
        </ul>
        {isOpen && (
          <div className="mt-auto w-full px-4 mb-4">
            <div className="bg-black-blacknew p-4 rounded-lg text-center shadow-lg">
              <h3 className="text-lg font-semibold text-white">
                {t("Help_Center")}
              </h3>
              <p className="text-sm text-gray-500 mb-3">
                {t("Having_Trouble?_Please_contact_us_for_more_questions.")}
              </p>
              <button className="px-4 py-2 bg-white text-black rounded-md shadow-md">
                {t("Go_To_Help_Center")}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;