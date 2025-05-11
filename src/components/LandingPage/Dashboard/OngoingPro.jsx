import { useEffect, useState, useCallback } from "react";
import Notification from "../../../assets/Photo 4.svg";
import student2 from "../../../assets/Photo 2.svg";
import student3 from "../../../assets/Photo 3.svg";
import logo from "../../../assets/logo1.png";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "react-circular-progressbar/dist/styles.css";
import { Button } from "@mui/material";
import { useSelector } from "react-redux";
import apiRequest from "../../../utils/apiRequest";
import { Clock, User } from "lucide-react";
import "../../../utils/i18n";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";

const OngoingPro = () => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [datas, setDatas] = useState([]);
  const { t } = useTranslation();

  const token = useSelector((state) => state.auth.userToken);
  const fetchProjects = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        status: "Ongoing",
        page: 1,
      }).toString();

      const response = await apiRequest(
        "get",
        `/projects?${params}`,
        {},
        token
      );

      if (response.data && response.data.data.projects) {
        setDatas(response.data.data.projects);
      }
    } catch (error) {
    }
  }, [token]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const navigate = useNavigate();

  const handleViewProjectClick = (id) => {
    navigate(`/details/${id}`);
  };
  return (
    <div className="flex flex-col w-full max-w-4xl space-y-1 items-center overflow-x-hidden">
      <DatePicker
        selected={selectedDate}
        onChange={() => {}}
        inline
        calendarClassName="custom-calendar"
        className="w-[360px]"
        dayClassName={(date) =>
          date.toDateString() === new Date().toDateString()
            ? "!bg-red-500 font-bold text-white" // Added text-white for contrast
            : "text-gray-400"
        }
        filterDate={(date) => date.toDateString() === new Date().toDateString()}
      />

      <div className="w-[350px]">
        {datas.length > 0 ? (
          datas.slice(0, 1).map((project, index) => (
            <div
              key={project._id}
              className="bg-white p-6 rounded-lg shadow-lg w-full mt-6 text-xs md:text-sm relative"
            >
              <div
                onClick={() => handleViewProjectClick(project._id)}
                className="cursor-pointer"
              >
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-black-blacknew">
                    {t("Ongoing_Projects")}
                  </h2>
                </div>
                <div className="border-b pb-4 mb-4">
                  {project.projectBanner?.length > 0 ? (
                    <Swiper
                      spaceBetween={10}
                      slidesPerView={1}
                      grabCursor={true}
                    >
                      {project.projectBanner.map((banner, index) => (
                        <SwiperSlide
                          key={banner._id || index}
                          className="w-[300px]"
                        >
                          <img
                            className="w-full h-32 object-cover rounded"
                            src={banner.url}
                            alt={`Project Banner ${index + 1}`}
                          />
                        </SwiperSlide>
                      ))}
                    </Swiper>
                  ) : (
                    <div className="w-full h-32 flex flex-col items-center justify-center bg-gray-200 rounded">
                      <img src={logo} alt="" />
                    </div>
                  )}
                  <h3 className="text-lg font-semibold mt-4 text-black-blacknew">
                    {project.projectName}
                  </h3>
                  <p className="text-sm ">
                    <span className="text-black font-bold">
                      {t("Deadline")}
                    </span>
                    {project.deadline}
                  </p>
                  <div className="flex justify-between mt-5">
                    <p className="text-black font-semibold text-sm mb-3">
                      {t("Progress")}
                    </p>
                  </div>
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-black font-medium text-sm">
                        {t("Physical_Execution")}
                      </p>
                      <h6 className="text-gray-800 font-semibold">
                        {project?.financeDocuments?.[0]?.physicalExecution || 0}{' '}%
                      </h6>
                    </div>

                    <div className="relative w-full h-2 bg-gray-200 rounded-full">
                      <div
                        className={`absolute top-0 left-0 h-2 rounded-full bg-red-redNew ${
                          project.status === "Completed"
                            ? "bg-green-500"
                            : "bg-red-500"
                        }`}
                        style={{
                          width: `${project?.financeDocuments?.[0]?.physicalExecution}%`,
                        }}
                      ></div>
                      <div
                        className="absolute w-5 h-5 rounded-full bg-red-redNew border-2 border-red-redNew"
                        style={{
                          left: `calc(${project?.financeDocuments?.[0]?.physicalExecution}% - 10px)`,
                          top: "-6px",
                        }}
                      ></div>
                    </div>
                  </div>
                  <div className="mb-4 mt-2 relative">
                    <div className="flex justify-between">
                      <p className="black text-sm mb-1">
                        {t("Financial_Execution")}
                      </p>
                      <h6 className="text-red-redNew">
                        {project?.financeDocuments?.[0]?.financialExecution || 0}{' '}%
                      </h6>
                    </div>
                    <div className="w-full bg-gray-200 h-2 rounded-full relative">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          project?.financeDocuments?.[0]?.financialExecution > 0
                            ? "bg-red-500"
                            : "bg-gray-300"
                        }`}
                        style={{
                          width: `${project?.financeDocuments?.[0]?.financialExecution}%`,
                        }}
                      ></div>
                      <div
                        className="w-5 h-5 bg-red-redNew rounded-full absolute top-1/2 -translate-y-1/2 
                 flex items-center justify-center shadow-md cursor-pointer transition-all"
                        style={{
                          left: `calc(${project?.financeDocuments?.[0]?.financialExecution}% - 10px)`,
                        }}
                      >
                        <span className="w-2 h-2 bg-red-redNew rounded-full"></span>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between mt-3 items-center">
                    <div className="flex flex-row items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm text-black mb-1">
                        {" "}
                        {project.status === "Pending"
                          ? t("Pending")
                          : project.status === "Completed"
                          ? t("Completed")
                          : project.status === "Ongoing"
                          ? t("Ongoing")
                          : project.daysLeft}
                      </span>
                    </div>

                    <div className="flex absolute right-2">
                      {project.members.map((member) =>
                        member.avatar ? (
                          <img
                            key={member._id}
                            src={member.avatar}
                            alt={member.userName}
                            className="w-10 h-10 rounded-full mr-3"
                          />
                        ) : (
                          <User
                            key={member._id}
                            className="bg-slate-400 rounded-full p-2 text-white mr-2"
                            size={32}
                          />
                        )
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-xs font-bold">
                    {t("Daily_Notifications")}
                  </h4>
                  <h6 className="text-lightpurple">19/12/2024</h6>
                </div>
                <ul className="space-y-2">
                  <li className="text-xs flex gap-2">
                    <img
                      src={Notification}
                      alt="Notification Icon"
                      className="w-8"
                    />
                    Financial execution update required by <br />
                    2024-10-15
                  </li>
                  <li className="text-xs flex gap-2">
                    <img src={student2} alt="Student Icon" className="w-8" />
                    Project approaching deadline, review <br /> pending tasks
                  </li>
                  <li className="text-xs flex gap-2">
                    <img src={student3} alt="Student Icon" className="w-8" />
                    New inspection report submitted for <br />
                    approval
                  </li>
                  <li className="text-xs flex items-center gap-2">
                    <img
                      src={Notification}
                      alt="Notification Icon"
                      className="w-8"
                    />
                    {t("View_Client_Feedback")}
                  </li>
                </ul>
              </div>
              {project.documents?.length > 0 ? (
                project.documents.map((doc) => (
                  <Button
                    sx={{
                      mt: 4,
                      px: 6,
                      backgroundColor: "black",
                      color: "white",
                      borderRadius: "0.5rem",
                      "&:hover": {
                        backgroundColor: "#333",
                      },
                    }}
                    key={doc._id}
                    onClick={() => {
                      if (doc?.fileUrl) {
                        window.open(
                          doc.fileUrl,
                          "_blank",
                          "noopener,noreferrer"
                        );
                      } else {
                        console.error("File URL is missing!");
                      }
                    }}
                    className="w-full"
                  >
                    {t("View_Report")}
                  </Button>
                ))
              ) : (
                <p className="text-gray-500">{t("No_reports_available")}</p>
              )}
            </div>
          ))
        ) : (
          <p>{t("No_projects_available")}</p>
        )}
      </div>
    </div>
  );
};

export default OngoingPro;
