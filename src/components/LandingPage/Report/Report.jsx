import { useEffect, useState } from "react";
import {
  Button,
  Select,
  MenuItem,
  TextField,
  Pagination,
  PaginationItem,
} from "@mui/material";
import { GrFormNext, GrFormPrevious } from "react-icons/gr";
import { CiSearch } from "react-icons/ci";
import { MdOutlineFileDownload } from "react-icons/md";
import { InputAdornment, Stack, Chip, FormControl } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import "../../../utils/i18n";
import { useTranslation } from "react-i18next";
import { FaArrowLeft } from "react-icons/fa6";
import { useSelector } from "react-redux";
import apiRequest from "../../../utils/apiRequest";
import { CheckCircle, XCircle } from "lucide-react";
import { toast } from "react-toastify";
import { set } from "react-hook-form";

export default function Report() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const activeTab = queryParams.get("tab") || "All Projects";
  const [selectedTab, setSelectedTab] = useState("All Projects");
  const [page, setPage] = useState(1);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sortOption, setSortOption] = useState("Chronological");
  const token = useSelector((state) => state.auth.userToken);
  const [selectedMonth, setSelectedMonth] = useState("");
  const currentYear = new Date().getFullYear();

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  useEffect(() => {
    setSelectedTab(activeTab);
  }, [activeTab]);

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      try {
        const response = await apiRequest("get", "/documents", {}, token);

        if (response?.status === 200) {
          setDocuments(response?.data || []);
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [token]);

  const handleOpenFile = (fileUrl) => {
    if (!fileUrl) {
      toast.error("File URL not available!");
      return;
    }
    window.open(fileUrl, "_blank");
  };

  const handleViewDashboard = () => {
    navigate("/");
  };

  const recordsPerPage = 10;

  const handleTabChange = (tab) => {
    let tabQuery = tab;

    // Map Portuguese tab names to their query values
    if (tab === "Todos os Projectos") {
      tabQuery = "All Projects";
    } else if (tab === "Pendente") {
      tabQuery = "Pending";
    } else if (tab === "Aprovado") {
      tabQuery = "Approved";
    } else if (tab === "Rejeitado") {
      tabQuery = "Rejected";
    }

    setSelectedTab(tabQuery); // Set the selected tab to the query value
    setPage(1);

    navigate(`/report?tab=${tabQuery}`);
  };

  const sortDocuments = (docs) => {
    if (sortOption === "Alphabetical") {
      return [...docs].sort((a, b) => a.projName.localeCompare(b.projName));
    } else {
      return [...docs].sort(
        (a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt)
      );
    }
  };

  const filteredDocuments = Array.isArray(documents)
    ? sortDocuments(
        documents.filter((doc) => {
          const docDate = new Date(doc.uploadedAt);
          const monthYear = `${docDate.toLocaleString("default", {
            month: "long",
          })}, ${docDate.getFullYear()}`;

          const matchesTab =
            selectedTab === "All Projects" ||
            doc.status.toLowerCase() === selectedTab.toLowerCase();
          const matchesMonth = !selectedMonth || monthYear === selectedMonth; // Filter by selected month

          return matchesTab && matchesMonth;
        })
      )
    : [];

  const startIndex = (page - 1) * recordsPerPage;
  const paginatedDocuments = filteredDocuments?.slice(
    startIndex,
    startIndex + recordsPerPage
  );

  const handleStatusUpdate = async (docId, newStatus) => {
    try {
      const response = await apiRequest(
        "patch",
        `/documents/${docId}`,
        { status: newStatus },
        token
      );

      if (response?.status === 200 || response?.status === 201) {
        toast.success(`Status changed to ${newStatus} successfully!`);
        setDocuments((prevDocs) =>
          prevDocs.map((doc) =>
            doc._id === docId ? { ...doc, status: newStatus } : doc
          )
        );
      } else {
        toast.error("Status update failed. Please try again.");
      }
    } catch (error) {
      console.error("Status update error:", error);
      toast.error("An error occurred while updating status.");
    }
  };

  const handleSortChange = (event) => {
    setSortOption(event.target.value);
    setPage(1); // Reset to first page when sorting changes
  };

  const filterDocumentsByMonth = (documents, selectedMonth) => {
    if (!selectedMonth) return documents;

    const [month, year] = selectedMonth.split(", ");
    const targetDate = new Date(`${month} 1, ${year}`);

    return documents.filter((document) => {
      const docDate = new Date(document.uploadedAt);
      return (
        docDate.getMonth() === targetDate.getMonth() &&
        docDate.getFullYear() === targetDate.getFullYear()
      );
    });
  };

  const filteredDocumentsTwo = filterDocumentsByMonth(documents, selectedMonth);

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
          {/* Filter Icon with Outline */}
          {/* <div className="bg-white rounded-lg border border-gray-300">
            <IconButton className="rounded-lg">
              <FiFilter />
            </IconButton>
          </div> */}

          {/* Sort Select */}
          <div className="bg-white rounded-lg border border-gray-300">
            <FormControl className="min-w-[150px]" size="small">
              <Select
                value={sortOption}
                onChange={handleSortChange}
                className="rounded-lg border-none focus:ring-0"
              >
                <MenuItem value="Chronological">
                  {t("Sort")}: Chronological
                </MenuItem>
                <MenuItem value="Alphabetical">Alphabetical</MenuItem>
              </Select>
            </FormControl>
          </div>

          {/* Date Select */}
          <div className="bg-white rounded-lg border border-gray-300">
            <FormControl className="min-w-[150px]" size="small">
              <Select
                value={selectedMonth}
                onChange={(event) => setSelectedMonth(event.target.value)}
                displayEmpty
                className="rounded-lg border-none focus:ring-0"
                startAdornment={
                  <InputAdornment position="start">
                    <GrFormPrevious className="w-5 h-5" />
                  </InputAdornment>
                }
                endAdornment={
                  <InputAdornment position="end">
                    <GrFormNext className="w-5 h-5" />
                  </InputAdornment>
                }
              >
                <MenuItem value="">
                  <em>All Months</em>
                </MenuItem>
                {months.map((month) => {
                  const current = `${month}, ${currentYear}`;
                  const next = `${month}, ${currentYear + 1}`;
                  return [
                    <MenuItem key={current} value={current}>
                      {current}
                    </MenuItem>,
                    <MenuItem key={next} value={next}>
                      {next}
                    </MenuItem>,
                  ];
                })}
              </Select>
            </FormControl>
          </div>
        </div>

        {/* Search Field  */}
        <div className="bg-white rounded-lg border border-gray-300 ml-auto">
          <TextField
            placeholder={t("Write_Your_Message")}
            size="small"
            className="w-[24rem]"
            variant="outlined"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <CiSearch className="w-5 h-5 text-black font-bold" />
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "0.5rem", // Tailwind's rounded-lg equivalent
              },
            }}
          />
        </div>
      </div>
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2}
        className="mt-4 w-full"
      >
        {[t("All_Projects"), t("Pending"), t("Approved"), t("Rejected")].map(
          (tab) => (
            <Chip
              key={tab}
              label={tab}
              onClick={() => handleTabChange(tab)} // ✅ Add this to update selectedTab
              sx={{
                py: 3,
                px: 3,
                borderRadius: "9999px", // 🔹 Fully rounded buttons
                backgroundColor: selectedTab === tab ? "#B91724" : "white",
                color: selectedTab === tab ? "white" : "black",
                fontWeight: selectedTab === tab ? "bold" : "normal",
                cursor: "pointer", // ✅ Add cursor pointer for better UX
                "&:hover": {
                  backgroundColor:
                    selectedTab === tab ? "#B91724" : "lightgray",
                },
              }}
            />
          )
        )}
      </Stack>

      <div className="flex justify-between items-center w-full h-auto md:h-14 px-4 my-4">
        <h2 className="text-lg font-extrabold mb-6 mt-6">
          {t("All_Projects_Report")}s
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
      {/* Table */}
      <div className="bg-white rounded-lg shadow-md p-4 mt-4">
        <div className="overflow-x-auto">
          <table className="min-w-full text-black-blacknew border-gray-200 text-sm">
            <thead className="text-black-blacknew font-semibold">
              <tr className="bg-white">
                <th className="pr-10">
                  <input type="checkbox" />
                </th>
                <th className="p-4 text-left text-lg">{t("Project_Name")}</th>
                <th className="p-4 text-left text-lg">
                  {t("Attached_Report")}
                </th>
                <th className="p-4 text-left text-lg">{t("Status")}</th>
                <th className="p-4 text-left text-lg">{t("Created_By")}</th>
                <th className="p-4 text-left text-lg">{t("Created_At")}</th>
                <th className="p-4 text-left pl-14 text-lg">{t("Actions")}</th>
              </tr>
            </thead>
            <tbody>
              {paginatedDocuments.length > 0 ? (
                paginatedDocuments.map((doc, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="p-5">
                      <input type="checkbox" />
                    </td>
                    <td className="p-4 font-semibold">{doc.projName}</td>
                    <td className="p-4 font-normal">
                      {doc.fileName
                        ? doc.fileName.length > 20
                          ? `${doc.fileName.substring(0, 18)}....pdf`
                          : doc.fileName
                        : "No Report"}
                    </td>
                    <td className="p-4">
                      {doc.status
                        .split(" ")
                        .map(
                          (word) => word.charAt(0).toUpperCase() + word.slice(1)
                        )
                        .join(" ")}
                    </td>
                    <td className="p-4">
                      {doc.user
                        .split(" ")
                        .map(
                          (word) => word.charAt(0).toUpperCase() + word.slice(1)
                        )
                        .join(" ")}
                    </td>{" "}
                    <td className="p-4 font-normal">
                      {new Date(doc.uploadedAt).toLocaleDateString()}
                    </td>
                    <td>
                      <Button
                        startIcon={<MdOutlineFileDownload />}
                        sx={{ textTransform: "none", color: "#121619" }}
                        onClick={() => handleOpenFile(doc.fileUrl)}
                      ></Button>

                      <Button
                        startIcon={<CheckCircle />}
                        sx={{ textTransform: "none", color: "#121619" }}
                        onClick={() => handleStatusUpdate(doc._id, "approved")}
                      />

                      <Button
                        startIcon={<XCircle />}
                        sx={{ textTransform: "none", color: "#121619" }}
                        onClick={() => handleStatusUpdate(doc._id, "rejected")}
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="p-4 text-center">
                    {t("No_Data_Available")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}

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
            },
            "& .MuiPaginationItem-previousNext": {
              border: "none",
              backgroundColor: "transparent",
              color: "black",
            },
          }}
          renderItem={(item) => (
            <PaginationItem
              {...item}
              slots={{
                previous: () => <span>{t("Previous")}</span>,
                next: () => <span>{t("Next")}</span>,
              }}
            />
          )}
        />
      </div>
    </div>
  );
}
