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
  Menu,
  IconButton,
  ListItemIcon,
  Typography,
  Box,
  Modal,
} from "@mui/material";
import { CiSearch } from "react-icons/ci";
import { MdOutlineFileDownload } from "react-icons/md";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FaArrowLeft } from "react-icons/fa6";
import { useSelector } from "react-redux";
import apiRequest from "../../../utils/apiRequest";
import { CheckCircle, XCircle, Trash2, MoreVertical } from "lucide-react";
import { toast } from "react-toastify";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  borderRadius: "8px",
};

function ConfirmationModal({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  cancelText,
}) {
  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={modalStyle}>
        <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
          {title}
        </Typography>
        <Typography sx={{ mb: 4 }}>{message}</Typography>
        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button variant="outlined" onClick={onClose}>
            {cancelText}
          </Button>
          <Button variant="contained" color="error" onClick={onConfirm}>
            {confirmText}
          </Button>
        </Stack>
      </Box>
    </Modal>
  );
}

const RAW_TAB_VALUES = {
  ALL: "all",
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
};

const TAB_TRANSLATION_KEYS = {
  [RAW_TAB_VALUES.ALL]: "tab_all_projects",
  [RAW_TAB_VALUES.PENDING]: "tab_pending",
  [RAW_TAB_VALUES.APPROVED]: "tab_approved",
  [RAW_TAB_VALUES.REJECTED]: "tab_rejected",
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
  const [anchorEl, setAnchorEl] = useState(null);
  const [currentDoc, setCurrentDoc] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [docToDelete, setDocToDelete] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabFromUrl = params.get("tab");
    if (tabFromUrl && Object.values(RAW_TAB_VALUES).includes(tabFromUrl)) {
      setSelectedTab(tabFromUrl);
    } else {
      setSelectedTab(RAW_TAB_VALUES.ALL);
    }
  }, [location.search]);

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      try {
        const response = await apiRequest("get", "/documents", {}, token);
        setDocuments(response?.data || []);
      } catch (error) {
        console.error("Failed to fetch documents:", error);
        setDocuments([]);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchProjects();
  }, [token]);

  const handleMenuOpen = (event, doc) => {
    setAnchorEl(event.currentTarget);
    setCurrentDoc(doc);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setCurrentDoc(null);
  };

  const handleOpenFile = (fileUrl) => {
    if (!fileUrl) {
      toast.error(t("file_url_not_available"));
      return;
    }
    window.open(fileUrl, "_blank", "noopener,noreferrer");
  };

  const handleViewDashboard = () => navigate("/");
  const recordsPerPage = 10;

  const handleTabChange = (tabValue) => {
    setPage(1);
    setSelectedTab(tabValue);
    navigate(`/report?tab=${encodeURIComponent(tabValue)}`, { replace: true });
  };

  const sortDocuments = (docs) => {
    const sorted = [...docs];
    if (sortOption === "Alphabetical") {
      return sorted.sort((a, b) =>
        (a.projName || "").localeCompare(b.projName || "")
      );
    }
    return sorted.sort(
      (a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt)
    );
  };

  const filteredDocuments = Array.isArray(documents)
    ? sortDocuments(
        documents.filter((doc) => {
          const matchesTab =
            selectedTab === RAW_TAB_VALUES.ALL ||
            doc.status?.toLowerCase() === selectedTab;
          const matchesMonth =
            !selectedMonth ||
            (doc.uploadedAt &&
              new Date(doc.uploadedAt).getMonth() === selectedMonth.getMonth() &&
              new Date(doc.uploadedAt).getFullYear() ===
                selectedMonth.getFullYear());
          const matchesSearch =
            searchQuery === "" ||
            doc.projName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            doc.fileName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            doc.user?.toLowerCase().includes(searchQuery.toLowerCase());
          return matchesTab && matchesMonth && matchesSearch;
        })
      )
    : [];

  const paginatedDocuments = filteredDocuments.slice(
    (page - 1) * recordsPerPage,
    page * recordsPerPage
  );

  const handleStatusUpdate = async (docId, newStatus) => {
    const originalDocuments = [...documents];
    setDocuments((prev) =>
      prev.map((doc) =>
        doc._id === docId ? { ...doc, status: newStatus } : doc
      )
    );
    handleMenuClose();

    try {
      await apiRequest(
        "patch",
        `/documents/${docId}`,
        { status: newStatus },
        token
      );
      if (newStatus === "approved") {
        toast.success(t("report_approved_successfully"));
      } else if (newStatus === "rejected") {
        toast.success(t("report_rejected_successfully"));
      }
    } catch (error) {
      setDocuments(originalDocuments);
      toast.error(t("status_update_failed_error"));
    }
  };

  const handleDeleteReport = async () => {
    if (!docToDelete) return;

    const docIdToDelete = docToDelete._id;
    const originalDocuments = [...documents];

    setDocuments((prev) => prev.filter((doc) => doc._id !== docIdToDelete));
    setModalOpen(false);

    try {
      await apiRequest("delete", `/documents/${docIdToDelete}`, {}, token);
      toast.success(t("report_deleted_successfully"));
    } catch (error) {
      setDocuments(originalDocuments);
      toast.error(t("report_delete_failed"));
    } finally {
      setDocToDelete(null);
    }
  };

  const handleSortChange = (e) => setSortOption(e.target.value);

  const getDisplayStatus = (status) => {
    if (!status) return t("status_no_report");
    const lowerStatus = status.toLowerCase();
    const translationKey = TAB_TRANSLATION_KEYS[lowerStatus];
    return translationKey ? t(translationKey) : status;
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
                <MenuItem
                  value="Chronological"
                  disabled
                  style={{
                    display: sortOption !== "Chronological" ? "none" : "flex",
                  }}
                >
                  {t("Sort")}: {t("Chronological")}
                </MenuItem>
                <MenuItem
                  value="Chronological"
                  style={{
                    display: sortOption === "Chronological" ? "none" : "flex",
                  }}
                >
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
            onChange={(e) => setSearchQuery(e.target.value)}
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
            label={t(TAB_TRANSLATION_KEYS[tabValue])}
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
      <div className="flex justify-between items-center w-full md:h-14 px-4 my-4">
        <h2 className="text-lg font-extrabold my-6">
          {t("Projects_Report_List")}
        </h2>
        <Button
          variant="contained"
          sx={{
            backgroundColor: "black",
            color: "white",
            textTransform: "none",
            "&:hover": { backgroundColor: "#333333" },
          }}
          onClick={() => navigate("/submitLandlordReport")}
        >
          + {t("Create_New_Report")}
        </Button>
      </div>
      <div className="bg-white rounded-lg shadow-md p-4 mt-4">
        <div className="overflow-x-auto">
          <table className="min-w-full text-black-blacknew border-gray-200 text-sm">
            <thead className="text-black-blacknew font-semibold">
              <tr className="bg-white">
                <th className="pr-10"></th>
                <th className="p-4 text-left text-lg">{t("Project_Name")}</th>
                <th className="p-4 text-left text-lg">
                  {t("Attached_Report")}
                </th>
                <th className="p-4 text-left text-lg">{t("Status")}</th>
                <th className="p-4 text-left text-lg">{t("Created_By")}</th>
                <th className="p-4 text-left text-lg">{t("Created_At")}</th>
                <th className="p-4 text-center text-lg">{t("Actions")}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="p-4 text-center">
                    {t("Loading...")}
                  </td>
                </tr>
              ) : paginatedDocuments.length > 0 ? (
                paginatedDocuments.map((doc) => (
                  <tr key={doc._id} className="hover:bg-gray-50 border-b">
                    <td className="p-5"></td>
                    <td className="p-4 font-semibold">{doc.projName || "-"}</td>
                    <td className="p-4 font-normal">
                      {doc.fileName ? (
                        doc.fileName.length > 20 ? (
                          `${doc.fileName.substring(
                            0,
                            18
                          )}...${doc.fileName.slice(-4)}`
                        ) : (
                          doc.fileName
                        )
                      ) : (
                        <span className="text-gray-400 italic">
                          {t("status_no_report")}
                        </span>
                      )}
                    </td>
                    <td className="p-4">{getDisplayStatus(doc.status)}</td>
                    <td className="p-4">
                      {doc.user
                        ? doc.user
                            .split(" ")
                            .map(
                              (w) => w.charAt(0).toUpperCase() + w.slice(1)
                            )
                            .join(" ")
                        : "-"}
                    </td>
                    <td className="p-4 font-normal">
                      {doc.uploadedAt
                        ? new Date(doc.uploadedAt).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="p-4 text-center">
                      <IconButton onClick={(e) => handleMenuOpen(e, doc)}>
                        <MoreVertical size={20} />
                      </IconButton>
                    </td>
                  </tr>
                ))
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
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem
          onClick={() => {
            handleOpenFile(currentDoc?.fileUrl);
            handleMenuClose();
          }}
          disabled={!currentDoc?.fileUrl}
        >
          <ListItemIcon>
            <MdOutlineFileDownload size={23} />
          </ListItemIcon>
          <Typography variant="inherit">{t("Download_Report")}</Typography>
        </MenuItem>
        <MenuItem
          onClick={() =>
            handleStatusUpdate(currentDoc?._id, RAW_TAB_VALUES.APPROVED)
          }
          disabled={
            currentDoc?.status?.toLowerCase() === RAW_TAB_VALUES.APPROVED
          }
        >
          <ListItemIcon>
            <CheckCircle size={20} color="green" />
          </ListItemIcon>
          <Typography variant="inherit">{t("Approve")}</Typography>
        </MenuItem>
        <MenuItem
          onClick={() =>
            handleStatusUpdate(currentDoc?._id, RAW_TAB_VALUES.REJECTED)
          }
          disabled={
            currentDoc?.status?.toLowerCase() === RAW_TAB_VALUES.REJECTED
          }
        >
          <ListItemIcon>
            <XCircle size={20} color="orange" />
          </ListItemIcon>
          <Typography variant="inherit">{t("Reject")}</Typography>
        </MenuItem>
        <MenuItem
          onClick={() => {
            setDocToDelete(currentDoc);
            setModalOpen(true);
            handleMenuClose();
          }}
        >
          <ListItemIcon>
            <Trash2 size={20} color="red" />
          </ListItemIcon>
          <Typography variant="inherit">{t("Delete_Report")}</Typography>
        </MenuItem>
      </Menu>

      <ConfirmationModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setDocToDelete(null);
        }}
        onConfirm={handleDeleteReport}
        title={t("confirm_deletion_title")}
        message={t("confirm_deletion_message")}
        confirmText={t("confirm")}
        cancelText={t("cancel")}
      />

      {filteredDocuments.length > recordsPerPage && (
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
                "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.04)" },
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
                  previous: () => (
                    <span className="px-1">{t("Previous")}</span>
                  ),
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