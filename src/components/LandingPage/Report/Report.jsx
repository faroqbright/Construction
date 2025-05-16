import { useEffect, useState } from "react";
import {
  Button,
  Select,
  MenuItem,
  TextField,
  Pagination,
  PaginationItem,
  InputAdornment,
  Stack,
  Chip,
  FormControl,
} from "@mui/material";
import { CiSearch } from "react-icons/ci";
import { MdOutlineFileDownload } from "react-icons/md";
import { useLocation, useNavigate } from "react-router-dom";
import "../../../utils/i18n"; // Ensure i18n is initialized
import { useTranslation } from "react-i18next";
import { FaArrowLeft } from "react-icons/fa6";
import { useSelector } from "react-redux";
import apiRequest from "../../../utils/apiRequest";
import { CheckCircle, XCircle } from "lucide-react";
import { toast } from "react-toastify";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { t } from "i18next";


const RAW_TAB_VALUES = {
  ALL: "all", 
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
};

const TAB_I18N_KEYS = {
  [RAW_TAB_VALUES.ALL]: t("tab_all_projects"),
  [RAW_TAB_VALUES.PENDING]: t("tab_pending"),
  [RAW_TAB_VALUES.APPROVED]: t("tab_approved"),
  [RAW_TAB_VALUES.REJECTED]: t("tab_rejected"),
  STATUS_NO_REPORT: "status_no_report", 
};


export default function Report() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const token = useSelector((state) => state.auth.userToken);
  const [searchQuery, setSearchQuery] = useState("");

  const getInitialTab = () => {
    const queryParams = new URLSearchParams(location.search);
    const tabFromUrl = queryParams.get("tab");
    return tabFromUrl && Object.values(RAW_TAB_VALUES).includes(tabFromUrl)
      ? tabFromUrl
      : RAW_TAB_VALUES.ALL;
  };

  const [selectedTab, setSelectedTab] = useState(getInitialTab());
  const [page, setPage] = useState(1);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sortOption, setSortOption] = useState("Chronological");
  const [selectedMonth, setSelectedMonth] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabFromUrl = params.get("tab");
    const targetTab =
      tabFromUrl && Object.values(RAW_TAB_VALUES).includes(tabFromUrl)
        ? tabFromUrl
        : RAW_TAB_VALUES.ALL;
    setSelectedTab(targetTab);
  }, [location.search]);

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      try {
        const response = await apiRequest("get", "/documents", {}, token);
        if (response?.status === 200) {
          setDocuments(response?.data || []);
        } else {
          setDocuments([]);
        }
      } catch (error) {
        console.error("Failed to fetch documents:", error);
        setDocuments([]);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchProjects();
    }
  }, [token]);

  const handleOpenFile = (fileUrl) => {
    if (!fileUrl) {
      toast.error(t("file_url_not_available"));  
      return;
    }
    window.open(fileUrl, "_blank", "noopener,noreferrer");
  };

  const handleViewDashboard = () => {
    navigate("/");
  };

  const recordsPerPage = 10;

  const handleTabChange = (tabValue) => {
    setPage(1);  
    setSelectedTab(tabValue);
    navigate(`/report?tab=${encodeURIComponent(tabValue)}`, { replace: true });
  };

  const sortDocuments = (docs) => {
    const sortedDocs = [...docs];
    if (sortOption === "Alphabetical") {
      return sortedDocs.sort((a, b) =>
        (a.projName || "").localeCompare(b.projName || "")
      );
    } else {
      return sortedDocs.sort(
        (a, b) => (new Date(b.uploadedAt) || 0) - (new Date(a.uploadedAt) || 0)
      );
    }
  };

  const filteredDocuments = Array.isArray(documents)
    ? sortDocuments(
        documents.filter((doc) => {
          if (!doc) return false;  

          // Tab filter
          const matchesTab =
            selectedTab === RAW_TAB_VALUES.ALL ||
            (doc.status && doc.status.toLowerCase() === selectedTab.toLowerCase());

          if (!matchesTab) return false;  

          // Month filter
          let matchesMonth = true;
          if (selectedMonth instanceof Date && !isNaN(selectedMonth)) {
            if (!doc.uploadedAt) return false;  
            try {
              const docDate = new Date(doc.uploadedAt);
              if (!isNaN(docDate)) {
                matchesMonth =
                  docDate.getMonth() === selectedMonth.getMonth() &&
                  docDate.getFullYear() === selectedMonth.getFullYear();
              } else {
                matchesMonth = false;  
              }
            } catch (e) {
              matchesMonth = false;  
            }
          }

          // Search filter
          const matchesSearch = searchQuery === "" || 
            (doc.projName && doc.projName.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (doc.fileName && doc.fileName.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (doc.user && doc.user.toLowerCase().includes(searchQuery.toLowerCase()));

          return matchesMonth && matchesSearch;  
        })
      )
    : [];

  const startIndex = (page - 1) * recordsPerPage;
  const paginatedDocuments = filteredDocuments.slice(
    startIndex,
    startIndex + recordsPerPage
  );

  const handleStatusUpdate = async (docId, newStatus) => {
    if (!docId || !newStatus) return;

    const originalDocuments = [...documents];  
    
    setDocuments((prevDocs) =>
      prevDocs.map((doc) =>
        doc._id === docId ? { ...doc, status: newStatus.toLowerCase() } : doc  
      )
    );

    try {
      const response = await apiRequest(
        "patch",
        `/documents/${docId}`,
        { status: newStatus.toLowerCase() },  
        token
      );

      if (response?.status === 200 || response?.status === 201) {
        toast.success(t(response.data.message));
      } else {
        setDocuments(originalDocuments);
        toast.error(t("status_update_failed"));  
      }
    } catch (error) {
      console.error("Failed to update status:", error);
      setDocuments(originalDocuments);  
      toast.error(t("status_update_failed_error"));  
    }
  };

  const handleSortChange = (event) => {
    setSortOption(event.target.value);
    setPage(1);  
  };

  const getDisplayStatus = (status) => {
    if (!status) return t(TAB_I18N_KEYS.STATUS_NO_REPORT);
    const lowerStatus = status.toLowerCase();
    if (lowerStatus === RAW_TAB_VALUES.APPROVED) return t(TAB_I18N_KEYS[RAW_TAB_VALUES.APPROVED]);
    if (lowerStatus === RAW_TAB_VALUES.REJECTED) return t(TAB_I18N_KEYS[RAW_TAB_VALUES.REJECTED]);
    if (lowerStatus === RAW_TAB_VALUES.PENDING) return t(TAB_I18N_KEYS[RAW_TAB_VALUES.PENDING]);
    return status; 
  };


  return (
    <div className="min-h-screen px-4 py-2">
      <div className="flex items-center space-x-3 mb-10">
        <button
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-md hover:bg-gray-200 transition"
          onClick={handleViewDashboard}
        >
          <FaArrowLeft className="text-black w-5 h-5" />
        </button>
        <span className="text-black font-bold text-lg">{t("Reports")}</span>
      </div>
      <div className="flex justify-between items-center mb-10">
        <div className="flex items-center space-x-4">
          <div className="bg-white rounded-lg border border-gray-300">
            <FormControl className="min-w-[150px]" size="small">
              <Select
                value={sortOption}
                onChange={handleSortChange}
                className="rounded-lg border-none focus:ring-0"
                displayEmpty
              >
                <MenuItem value="Chronological" disabled style={{ display: sortOption !== "Chronological" ? 'none' : 'flex' }}>
                  {t("Sort")}: {t("Chronological")}
                </MenuItem>
                 <MenuItem value="Chronological" style={{ display: sortOption === "Chronological" ? 'none' : 'flex' }}>
                  {t("Chronological")}
                </MenuItem>
                <MenuItem value="Alphabetical">{t("Alphabetical")}</MenuItem>
              </Select>
            </FormControl>
          </div>

          <div className="bg-white rounded-lg border border-gray-300 p-2">
            <DatePicker
              selected={selectedMonth}
              onChange={(date) => {
                setSelectedMonth(date);
                setPage(1);
              }}
              dateFormat="MMMM yyyy"
              placeholderText={t("Select_month_and_year")}
              showMonthYearPicker
              isClearable
              className="w-full outline-none bg-white text-gray-700"
              calendarClassName="custom-calendar-size"
            />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-300 ml-auto">
          <TextField
            placeholder={t("Search_reports")}  
            size="small"
            className="w-[24rem]"
            variant="outlined"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <CiSearch className="w-5 h-5 text-black font-bold" />
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "0.5rem",
                "& .MuiOutlinedInput-notchedOutline": { border: "none" },
              },
            }}
          />
        </div>
      </div>
      <Stack
        direction={{ xs: "column", sm: "row" }}  
        spacing={2}
        className="mt-4 w-full flex-wrap"  
      >
        {Object.values(RAW_TAB_VALUES).map((tabValue) => (
          <Chip
            key={tabValue}
            label={t(TAB_I18N_KEYS[tabValue])}  
            onClick={() => handleTabChange(tabValue)}
            sx={{
              py: 3,
              px: 3,
              borderRadius: "9999px",  
              backgroundColor: selectedTab === tabValue ? "#B91724" : "white",
              color: selectedTab === tabValue ? "white" : "black",
              fontWeight: selectedTab === tabValue ? "bold" : "normal",
              cursor: "pointer",
              border: selectedTab !== tabValue ? "1px solid #e0e0e0" : "none",
              "&:hover": {
                backgroundColor:
                  selectedTab === tabValue ? "#A3131F" : "#f5f5f5",  
              },
            }}
          />
        ))}
      </Stack>

      <div className="flex justify-between items-center w-full h-auto md:h-14 px-4 my-4">
        <h2 className="text-lg font-extrabold mb-6 mt-6">
          {t("Projects_Report_List")} 
        </h2>
        <div className="w-full flex justify-end p-4">
          <Button
            variant="contained"
            sx={{
              backgroundColor: "black",
              color: "white",
              textTransform: "none",
              "&:hover": {
                backgroundColor: "#333333",
              },
            }}
            onClick={() => navigate("/submitLandlordReport")}
          >
            + {t("Create_New_Report")}
          </Button>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-md p-4 mt-4">
        <div className="overflow-x-auto">
          <table className="min-w-full text-black-blacknew border-gray-200 text-sm">
            <thead className="text-black-blacknew font-semibold">
              <tr className="bg-white">
                <th className="pr-10">
                  <input type="checkbox" />  
                </th>
                <th className="p-4 text-left text-lg">{t("Project_Name")}</th>
                <th className="p-4 text-left text-lg">{t("Attached_Report")}</th>
                <th className="p-4 text-left text-lg">{t("Status")}</th>
                <th className="p-4 text-left text-lg">{t("Created_By")}</th>
                <th className="p-4 text-left text-lg">{t("Created_At")}</th>
                <th className="p-4 text-left pl-14 text-lg">{t("Actions")}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="p-4 text-center text-gray-500">
                    {t("Loading...")}
                  </td>
                </tr>
              ) : paginatedDocuments && paginatedDocuments.length > 0 ? (
                paginatedDocuments.map((doc) => (
                    <tr
                      key={doc._id}  
                      className="hover:bg-gray-50 border-b"
                    >
                      <td className="p-5">
                        <input type="checkbox" />  
                      </td>
                      <td className="p-4 font-semibold">
                        {doc.projName || "-"}
                      </td>
                      <td className="p-4 font-normal">
                        {doc.fileName ? (
                          doc.fileName.length > 20 ? (
                            `${doc.fileName.substring(0, 18)}...${doc.fileName.slice(-4)}`
                          ) : (
                            doc.fileName
                          )
                        ) : (
                          <span className="text-gray-400 italic">
                            {t(TAB_I18N_KEYS.STATUS_NO_REPORT)}
                          </span>
                        )}
                      </td>
                      <td className="p-4">  
                        {getDisplayStatus(doc.status)}
                      </td>
                      <td className="p-4">
                        {doc.user
                          ? doc.user
                              .split(" ")
                              .map(
                                (word) =>
                                  word.charAt(0).toUpperCase() + word.slice(1)
                              )
                              .join(" ")
                          : "-"}
                      </td>
                      <td className="p-4 font-normal">
                        {doc.uploadedAt
                          ? new Date(doc.uploadedAt).toLocaleDateString()  
                          : "-"}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-start gap-x-2 pl-8">
                          <Button
                            startIcon={<MdOutlineFileDownload />}
                            sx={{ textTransform: "none", color: "#121619", minWidth: "auto", padding: "4px" }}
                            onClick={() => handleOpenFile(doc.fileUrl)}
                            disabled={!doc.fileUrl}
                            title={t("Download_Report")}
                          />
                          <Button
                            startIcon={<CheckCircle />}
                            sx={{ textTransform: "none", color: "#10B981", minWidth: "auto", padding: "4px" }}
                            onClick={() => handleStatusUpdate(doc._id, RAW_TAB_VALUES.APPROVED)}
                            disabled={doc.status?.toLowerCase() === RAW_TAB_VALUES.APPROVED}
                            title={t("Approve")}
                          />
                          <Button
                            startIcon={<XCircle />}
                            sx={{ textTransform: "none", color: "#EF4444", minWidth: "auto", padding: "4px" }}
                            onClick={() => handleStatusUpdate(doc._id, RAW_TAB_VALUES.REJECTED)}
                            disabled={doc.status?.toLowerCase() === RAW_TAB_VALUES.REJECTED}
                            title={t("Reject")}
                          />
                        </div>
                      </td>
                    </tr>
                  )
                )
              ) : (
                <tr>
                  <td colSpan="7" className="p-6 text-center text-gray-500">
                    {t("No_Data_Available")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {filteredDocuments && filteredDocuments.length > recordsPerPage && (
        <div className="flex justify-end items-center mt-4">
          <Pagination
            count={Math.ceil(filteredDocuments.length / recordsPerPage)}
            page={page}
            onChange={(event, value) => setPage(value)}
            variant="outlined"
            shape="rounded"
            sx={{
              "& .Mui-selected": {
                backgroundColor: "#B91724 !important",
                color: "white !important",
                borderRadius: "50%",
              },
              "& .MuiPaginationItem-root": {
                color: "black",
                borderRadius: "50%",
                "&:hover": {
                  backgroundColor: "rgba(0, 0, 0, 0.04)",
                },
              },
              "& .MuiPaginationItem-previousNext": {
                border: "none",
                backgroundColor: "transparent",
                color: "black",
                "&.Mui-disabled": { opacity: 0.5 },
              },
            }}
            renderItem={(item) => (
              <PaginationItem
                {...item}
                slots={{
                  previous: () => <span className="px-1">{t("Previous")}</span>,
                  next: () => <span className="px-1">{t("Next")}</span>,
                }}
              />
            )}
          />
        </div>
      )}
    </div>
  );
}