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
// import { GrFormNext, GrFormPrevious } from "react-icons/gr"; // Not used in renderItem, can be removed
import { CiSearch } from "react-icons/ci";
import { MdOutlineFileDownload } from "react-icons/md";
import { useLocation, useNavigate } from "react-router-dom";
import "../../../utils/i18n"; // Ensure this path is correct
import { useTranslation } from "react-i18next";
import { FaArrowLeft } from "react-icons/fa6";
import { useSelector } from "react-redux";
import apiRequest from "../../../utils/apiRequest"; // Ensure this path is correct
import { CheckCircle, XCircle } from "lucide-react";
import { toast } from "react-toastify";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function Report() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const activeTab = queryParams.get("tab") || "All Projects";
  const [selectedTab, setSelectedTab] = useState("All Projects"); // Used for filtering logic
  const [page, setPage] = useState(1);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sortOption, setSortOption] = useState("Chronological");
  const token = useSelector((state) => state.auth.userToken);
  // FIX 1: Initialize selectedMonth with null for DatePicker compatibility
  const [selectedMonth, setSelectedMonth] = useState(null);
  // const currentYear = new Date().getFullYear(); // Not actively used, can be removed if not needed elsewhere

  // const months = [ ... ]; // Not actively used, can be removed if not needed elsewhere

  // Sync selectedTab state with URL param on initial load or URL change
  useEffect(() => {
    const currentTabInUrl = queryParams.get("tab") || "All Projects";
    setSelectedTab(currentTabInUrl);
    // If using selectedTabTwo for UI, sync it as well if needed:
    setSelectedTabTwo(currentTabInUrl);
    // Reset page if tab changes via URL potentially
    // setPage(1); // Uncomment if resetting page on URL-driven tab change is desired
  }, [location.search]); // Depend on location.search to react to URL changes

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      try {
        const response = await apiRequest("get", "/documents", {}, token);

        if (response?.status === 200) {
          setDocuments(response?.data || []);
        } else {
          console.error("Failed to fetch documents:", response);
          setDocuments([]); // Clear documents on failure
        }
      } catch (error) {
        console.error("Error fetching documents:", error);
        toast.error("Error fetching reports."); // Basic error toast
        setDocuments([]); // Clear documents on error
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      // Only fetch if token exists
      fetchProjects();
    }
  }, [token]); // Re-fetch only when token changes

  const handleOpenFile = (fileUrl) => {
    if (!fileUrl) {
      toast.error("File URL not available!");
      return;
    }
    // Added rel="noopener noreferrer" for security
    window.open(fileUrl, "_blank", "noopener,noreferrer");
  };

  const handleViewDashboard = () => {
    navigate("/");
  };

  const recordsPerPage = 10;

  const TAB_KEYS = {
    ALL: "All Projects",
    PENDING: t("Pending"),
    APPROVED: t("Approved"),
    REJECTED: t("Rejected"),
  };

  const TAB_TRANSLATION_KEYS = {
    [TAB_KEYS.ALL]: "All_projects",
    [TAB_KEYS.PENDING]: "Pending",
    [TAB_KEYS.APPROVED]: "Approved",
    [TAB_KEYS.REJECTED]: "Rejected",
  };

  // This state controls the visual appearance of the tabs
  const [selectedTabTwo, setSelectedTabTwo] = useState(() => {
    return queryParams.get("tab") || TAB_KEYS.ALL; // Initialize based on URL
  });

  const handleTabChange = (tabKey) => {
    setPage(1);
    setSelectedTabTwo(tabKey); // Update visual state
    setSelectedTab(tabKey); // Update filter state
    // Update URL without full page reload
    navigate(`/report?tab=${encodeURIComponent(tabKey)}`, { replace: true });
  };

  const sortDocuments = (docs) => {
    // Create a mutable copy before sorting
    const sortedDocs = [...docs];
    if (sortOption === "Alphabetical") {
      // Add safety checks for projName
      return sortedDocs.sort((a, b) =>
        (a.projName || "").localeCompare(b.projName || "")
      );
    } else {
      // Chronological (assuming newest first)
      // Add safety checks for uploadedAt
      return sortedDocs.sort(
        (a, b) => (new Date(b.uploadedAt) || 0) - (new Date(a.uploadedAt) || 0)
      );
    }
  };

  // FIX 2: Corrected filtering logic
  const filteredDocuments = Array.isArray(documents)
    ? sortDocuments(
        // Apply sorting *after* filtering
        documents.filter((doc) => {
          if (!doc || !doc.status || !doc.uploadedAt) return false; // Basic safety check for required fields

          // --- Tab Filter (uses selectedTab synced from URL/click) ---
          const matchesTab =
            selectedTab === TAB_KEYS.ALL || // Compare with the state variable used for filtering
            doc.status.toLowerCase() === selectedTab.toLowerCase();

          // --- Month Filter ---
          let matchesMonth = true; // Default to true (don't filter by month if none selected)
          if (selectedMonth instanceof Date && !isNaN(selectedMonth)) {
            // Check if selectedMonth is a valid Date
            try {
              const docDate = new Date(doc.uploadedAt);
              if (!isNaN(docDate)) {
                // Check if docDate is valid
                matchesMonth =
                  docDate.getMonth() === selectedMonth.getMonth() &&
                  docDate.getFullYear() === selectedMonth.getFullYear();
              } else {
                matchesMonth = false; // Invalid document date
              }
            } catch (e) {
              matchesMonth = false; // Error parsing date
            }
          }
          // If selectedMonth is null or invalid, matchesMonth remains true

          // Combine filters
          return matchesTab && matchesMonth;
        })
      )
    : [];

  const startIndex = (page - 1) * recordsPerPage;
  // Use optional chaining on filteredDocuments as it might be undefined briefly
  const paginatedDocuments = filteredDocuments?.slice(
    startIndex,
    startIndex + recordsPerPage
  );

  const handleStatusUpdate = async (docId, newStatus) => {
    // Basic check
    if (!docId || !newStatus) return;

    // Optimistic UI update (optional, but good UX)
    const originalDocuments = [...documents];
    setDocuments((prevDocs) =>
      prevDocs.map((doc) =>
        doc._id === docId ? { ...doc, status: newStatus } : doc
      )
    );

    try {
      const response = await apiRequest(
        "patch",
        `/documents/${docId}`,
        { status: newStatus },
        token
      );

      // Check specifically for success status codes
      if (response?.status === 200 || response?.status === 201) {
        toast.success(`Status changed to ${newStatus} successfully!`);
        // Data already updated optimistically, or could re-fetch here if needed
      } else {
        toast.error("Status update failed. Please try again.");
        setDocuments(originalDocuments); // Revert optimistic update on failure
      }
    } catch (error) {
      console.error("Status update error:", error);
      toast.error("An error occurred while updating status.");
      setDocuments(originalDocuments); // Revert optimistic update on error
    }
  };

  const handleSortChange = (event) => {
    setSortOption(event.target.value);
    setPage(1); // Reset to first page when sorting changes
  };

  // FIX 3: Remove the unused function and state variable
  // const filterDocumentsByMonth = (documents, selectedDate) => { ... }; // REMOVED
  // const filteredDocumentsTwo = filterDocumentsByMonth(documents, selectedMonth); // REMOVED

  // --- JSX Structure (Identical to your original code) ---
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
          {/* Sort Select */}
          <div className="bg-white rounded-lg border border-gray-300">
            <FormControl className="min-w-[150px]" size="small">
              <Select
                value={sortOption}
                onChange={handleSortChange}
                className="rounded-lg border-none focus:ring-0"
                // Add displayEmpty and renderValue for better placeholder behavior if needed
              >
                <MenuItem value="Chronological">
                  {t("Sort")}: {t("Chronological")}
                </MenuItem>
                <MenuItem value="Alphabetical">{t("Alphabetical")}</MenuItem>
              </Select>
            </FormControl>
          </div>

          {/* Date Select */}
          <div className="bg-white rounded-lg border border-gray-300 p-2">
            <DatePicker
              selected={selectedMonth} // Use the state variable (now initialized to null)
              onChange={(date) => {
                setSelectedMonth(date); // date will be a Date object or null
                setPage(1); // Reset to first page when month changes
              }}
              dateFormat="MMMM yyyy" // Correct date format string
              placeholderText={t("Select_month_and_year")}
              showMonthYearPicker
              isClearable // Allows user to clear the date selection
              className="w-full outline-none bg-white text-gray-700"
              calendarClassName="custom-calendar-size" // Keep if you have custom styles
            />
          </div>
        </div>

        {/* Search Field  */}
        <div className="bg-white rounded-lg border border-gray-300 ml-auto">
          <TextField
            placeholder={t("Write_Your_Message")} // Consider changing placeholder to "Search..."
            size="small"
            className="w-[24rem]"
            variant="outlined"
            // Add value and onChange handlers here if you intend to implement search
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
                // Remove internal border if DatePicker/Select don't have it
                "& .MuiOutlinedInput-notchedOutline": { border: "none" },
              },
            }}
          />
        </div>
      </div>
      <Stack
        direction={{ xs: "column", md: "row" }} // Consider making it always "row" and add flex-wrap
        spacing={2}
        className="mt-4 w-full" // Add flex-wrap here if direction is always "row"
      >
        {Object.values(TAB_KEYS).map((tabKey) => (
          <Chip
            key={tabKey}
            label={t(TAB_TRANSLATION_KEYS[tabKey])}
            onClick={() => handleTabChange(tabKey)}
            sx={{
              py: 3,
              px: 3,
              borderRadius: "9999px",
              // Use selectedTabTwo for visual styling consistency
              backgroundColor: selectedTabTwo === tabKey ? "#B91724" : "white",
              color: selectedTabTwo === tabKey ? "white" : "black",
              fontWeight: selectedTabTwo === tabKey ? "bold" : "normal",
              cursor: "pointer",
              border: selectedTabTwo !== tabKey ? "1px solid #e0e0e0" : "none", // Add subtle border to non-selected
              "&:hover": {
                backgroundColor:
                  selectedTabTwo === tabKey ? "#B91724" : "#f5f5f5", // Lighter gray hover
              },
            }}
          />
        ))}
      </Stack>

      <div className="flex justify-between items-center w-full h-auto md:h-14 px-4 my-4">
        <h2 className="text-lg font-extrabold mb-6 mt-6">
          {t("All_Projects_Report")} {/* Typo? Maybe remove the 's' */}
        </h2>
        <div className="w-full flex justify-end p-4">
          {" "}
          {/* Might overlap with title, adjust layout if needed */}
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
            onClick={() => navigate("/submitLandlordReport")} // Ensure route is correct
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
                {/* Consider removing checkbox if not used for bulk actions */}
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
              {/* Add Loading State Display */}
              {loading ? (
                <tr>
                  <td colSpan="7" className="p-4 text-center text-gray-500">
                    {t("Loading...")}
                  </td>
                </tr>
              ) : paginatedDocuments && paginatedDocuments.length > 0 ? ( // Check paginatedDocuments directly
                paginatedDocuments.map(
                  (
                    doc // Use doc._id if available and unique, otherwise index is fallback
                  ) => (
                    <tr
                      key={doc._id || index}
                      className="hover:bg-gray-50 border-b"
                    >
                      {" "}
                      {/* Use unique key, add border */}
                      <td className="p-5">
                        {/* Ensure checkbox has associated state if selection is needed */}
                        <input type="checkbox" />
                      </td>
                      <td className="p-4 font-semibold">
                        {doc.projName || "-"}
                      </td>
                      <td className="p-4 font-normal">
                        {/* Improved filename display */}
                        {doc.fileName ? (
                          doc.fileName.length > 20 ? (
                            `${doc.fileName.substring(
                              0,
                              18
                            )}...${doc.fileName.slice(-4)}` // Show extension better
                          ) : (
                            doc.fileName
                          )
                        ) : (
                          <span className="text-gray-400 italic">
                            {t("No_Report")}
                          </span>
                        )}
                      </td>
                      <td className="p-4 capitalize">
                        {" "}
                        {/* Use capitalize class */}
                        {doc.status === "approved"
                          ? t("approved")
                          : doc.status === "rejected"
                          ? t("rejected")
                          : t("No_Report")}
                        {/* Display status directly, maybe add styling/badge */}
                      </td>
                      <td className="p-4">
                        {/* Capitalize name */}
                        {doc.user
                          ? doc.user
                              .split(" ")
                              .map(
                                (word) =>
                                  word.charAt(0).toUpperCase() + word.slice(1)
                              )
                              .join(" ")
                          : "-"}
                      </td>{" "}
                      <td className="p-4 font-normal">
                        {/* Format date consistently */}
                        {doc.uploadedAt
                          ? new Date(doc.uploadedAt).toLocaleDateString()
                          : "-"}
                      </td>
                      <td className="p-4">
                        {" "}
                        {/* Adjusted padding */}
                        {/* Action Buttons */}
                        <div className="flex items-center justify-start gap-x-2 pl-8">
                          {" "}
                          {/* Align actions better */}
                          <Button
                            startIcon={<MdOutlineFileDownload />}
                            sx={{
                              textTransform: "none",
                              color: "#121619",
                              minWidth: "auto",
                              padding: "4px",
                            }}
                            onClick={() => handleOpenFile(doc.fileUrl)}
                            disabled={!doc.fileUrl} // Disable if no URL
                            title={t("Download_Report")} // Tooltip
                          />
                          <Button
                            startIcon={<CheckCircle />}
                            sx={{
                              textTransform: "none",
                              color: "#10B981",
                              minWidth: "auto",
                              padding: "4px",
                            }} // Green color
                            onClick={() =>
                              handleStatusUpdate(doc._id, "approved")
                            }
                            disabled={doc.status?.toLowerCase() === "approved"} // Disable if already approved
                            title={t("Approve")} // Tooltip
                          />
                          <Button
                            startIcon={<XCircle />}
                            sx={{
                              textTransform: "none",
                              color: "#EF4444",
                              minWidth: "auto",
                              padding: "4px",
                            }} // Red color
                            onClick={() =>
                              handleStatusUpdate(doc._id, "rejected")
                            }
                            disabled={doc.status?.toLowerCase() === "rejected"} // Disable if already rejected
                            title={t("Reject")} // Tooltip
                          />
                        </div>
                      </td>
                    </tr>
                  )
                )
              ) : (
                <tr>
                  {/* Adjust colspan if checkbox column is removed */}
                  <td colSpan="7" className="p-6 text-center text-gray-500">
                    {" "}
                    {/* Increased padding */}
                    {t("No_Data_Available")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {/* Only render pagination if there are documents to paginate */}
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
                  // Add hover effect
                  backgroundColor: "rgba(0, 0, 0, 0.04)",
                },
              },
              "& .MuiPaginationItem-previousNext": {
                border: "none",
                backgroundColor: "transparent",
                color: "black",
                "&.Mui-disabled": {
                  // Style disabled arrows
                  opacity: 0.5,
                },
              },
            }}
            renderItem={(item) => (
              <PaginationItem
                {...item}
                // Use default icons, provide text via translation
                slots={{
                  previous: () => <span className="px-1">{t("Previous")}</span>, // Add padding for text
                  next: () => <span className="px-1">{t("Next")}</span>, // Add padding for text
                }}
              />
            )}
          />
        </div>
      )}
    </div>
  );
}
