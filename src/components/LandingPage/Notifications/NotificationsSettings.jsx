"use client";

import { useFirebaseNotifications } from "../../../hooks/useFirebaseNotifications";
import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Button,
  TextField,
  Switch,
  Avatar,
  IconButton,
  Typography,
  AvatarGroup,
  Link,
  Select,
  MenuItem,
  ListSubheader, // Import ListSubheader
  InputAdornment, // Import InputAdornment
  CircularProgress, // Import CircularProgress for loading
} from "@mui/material";
import {
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  PersonOutline as PersonOutlineIcon,
  NotificationsNone as NotificationsNoneIcon,
  Search as SearchIcon, // Import SearchIcon
} from "@mui/icons-material";
import notification from "../../../assets/notifications.svg";
import magicPen from "../../../assets/magicpen.svg";
// Remove t import if not used directly here, or ensure i18n is set up
import { t } from "i18next";
import { Trash2 } from "lucide-react";

// --- API Integration Imports ---
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import apiRequest from "../../../utils/apiRequest"; // Adjust path if needed
import { removeUserInfo } from "../../../features/auth/authSlice"; // Adjust path if needed
// --- End API Integration Imports ---

// --- Reusable Notification Toggle Component ---
const NotificationToggle = ({
  icon,
  title,
  description,
  checked,
  onChange,
}) => {
  return (
    <Box className="flex items-center mb-5 justify-between py-3 border-b bg-white rounded-lg border-gray-100 last:border-b-0 hover:bg-gray-50/50 px-1">
      <Box className="flex items-center gap-3">
        {icon}
        <Box>
          <Typography variant="body1" className="font-medium text-sm">
            {title}
          </Typography>
          <Typography variant="caption" className="text-gray-500">
            {description}
          </Typography>
        </Box>
      </Box>
      <Switch
        checked={checked}
        onChange={onChange}
        size="small"
        sx={{
          "& .MuiSwitch-switchBase.Mui-checked": {
            color: "#000",
          },
          "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
            backgroundColor: "#000",
          },
        }}
      />
    </Box>
  );
};

// --- Main Component ---
const NotificationSettings = () => {
  const [notifications, setNotifications] = useState({
    projectReports: true,
    projectApproval: true,
    projectUpdates: true,
    financialUpdates: false,
  });
  const [message, setMessage] = useState("");
  const [financeMessage, setFinanceMessage] = useState("");

  // --- Client Fetching State ---
  const [financeClients, setFinanceClients] = useState([]); // State for fetched clients
  const [isLoadingClients, setIsLoadingClients] = useState(false); // Loading state for clients
  const [clientSearchQuery, setClientSearchQuery] = useState(""); // State for search input
  const [selectedFinanceClient, setSelectedFinanceClient] = useState(""); // State for the selected client ID
  const [selectedFinanceClients, setSelectedFinanceClients] = useState([]);

  // --- End Client Fetching State ---

  // --- Redux/Router Hooks ---
  const token = useSelector((state) => state?.auth?.userToken);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const selectedClientAvatars = [
    "https://via.placeholder.com/30/FFA726/FFFFFF?text=A",
    "https://via.placeholder.com/30/EC407A/FFFFFF?text=B",
    "https://via.placeholder.com/30/26A69A/FFFFFF?text=C",
    "https://via.placeholder.com/30/42A5F5/FFFFFF?text=D",
    "https://via.placeholder.com/30/FFEE58/000000?text=E",
  ];
  const clientsToShow = 4;
  
  // --- Client Fetching Logic ---
  const fetchClients = useCallback(async () => {
    if (!token) return; // Don't fetch if no token

    setIsLoadingClients(true);
    try {
      // Fetch all clients - filtering happens client-side below
      const response = await apiRequest("get", "/clients", {}, token);

      if (response.data && Array.isArray(response.data.data)) {
        // Filter for Finance clients specifically
        const fetchedFinanceClients = response.data.data.filter(
          (user) => user.userType === "Finance"
        );
        setFinanceClients(fetchedFinanceClients);
      } else {
        console.warn(
          "Received unexpected data structure for clients:",
          response.data
        );
        setFinanceClients([]);
      }
    } catch (error) {
      console.error("Error fetching clients:", error);
      setFinanceClients([]);
      if (error?.response?.status === 401) {
        dispatch(removeUserInfo());
        toast.info("Session expired. Please log in again.");
        // Check if navigate is available before calling
        if (navigate) {
          navigate("/login");
        } else {
          console.error("Navigate function is not available.");
          // Handle the absence of navigate, maybe reload or show a message
          // window.location.href = '/login'; // Fallback if needed
        }
      } else {
        toast.error(
          error?.response?.data?.message || "Failed to fetch finance clients."
        );
      }
    } finally {
      setIsLoadingClients(false);
    }
  }, [token, dispatch, navigate]); // Added navigate to dependencies

  // Effect to fetch clients on component mount or when token changes
  useEffect(() => {
    fetchClients();
  }, [fetchClients]); // fetchClients includes token dependency

  // Filter clients based on search query
  const filteredFinanceClients = financeClients.filter(
    (client) =>
      client.userName.toLowerCase().includes(clientSearchQuery.toLowerCase()) ||
      client.email.toLowerCase().includes(clientSearchQuery.toLowerCase())
  );
  // --- End Client Fetching Logic ---

  const handleToggle = (name) => {
    setNotifications((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  const handleMessageChange = (e) => {
    setMessage(e.target.value);
  };
  const handleFinanceMessageChange = (e) => {
    setFinanceMessage(e.target.value);
  };

  // const handleSend = () => {
  //   if (!message.trim()) return;
  //   console.log("Sending message:", message);
  //   // Add actual send logic here
  //   setMessage("");
  // };

  // const handleFinanceSend = () => {
  //   if (!financeMessage.trim()) return;
  //   console.log(
  //     "Sending finance notification:",
  //     financeMessage,
  //     "to client ID:",
  //     selectedFinanceClient
  //   );
  //   // Add actual send logic here using financeMessage and selectedFinanceClient
  //   setFinanceMessage("");
  //   // Optionally reset selection: setSelectedFinanceClient("");
  // };

  const handleRemoveMember = (id) => {
    console.log(`Removing member with id: ${id}`);
    // Implement removal logic if needed
  };

  const renderIcon = () => (
    <img src={magicPen} className="h-10 w-10" alt="Edit Icon" />
  );

  // Function to get the selected client's name for display
  const getSelectedClientName = () => {
    if (!selectedFinanceClient) return "";
    const client = financeClients.find((c) => c._id === selectedFinanceClient);
    return client ? client.userName : "";
  };

  useFirebaseNotifications(token);

  const handleSend = async () => {
    if (!message.trim()) return;

    try {
      await apiRequest(
        "post",
        "/notifications",
        {
          message,
          type: "client",
        },
        token
      );

      setMessage("");
      toast.success("Notification sent successfully");
    } catch (error) {
      console.error("Error sending notification:", error);
      toast.error(
        error.response?.data?.message || "Failed to send notification"
      );
    }
  };

  const handleFinanceSend = async () => {
    if (!financeMessage.trim() || selectedFinanceClients.length === 0) return;

    try {
      await apiRequest(
        "post",
        "/notifications",
        {
          message: financeMessage,
          type: "financial",
          clientIds: selectedFinanceClients,
        },
        token
      );

      setFinanceMessage("");
      toast.success("Financial notification sent successfully");
    } catch (error) {
      console.error("Error sending financial notification:", error);
      toast.error(
        error.response?.data?.message || "Failed to send financial notification"
      );
    }
  };

  return (
    <Box className="p-4 md:p-6 min-h-screen w-full bg-gray-100">
      {/* --- Personalized Notifications Section (Existing) --- */}
      <Box className="shadow-sm py-4 md:py-5 mb-6">
        <Box className="space-y-4">
          <NotificationToggle
            icon={renderIcon()}
            title="Project Reports"
            description="Lorem Ipsum is simply dummy text of the printing and typesetting industry."
            checked={notifications.projectReports}
            onChange={() => handleToggle("projectReports")}
          />
          <NotificationToggle
            icon={renderIcon()}
            title="Project Approval"
            description="Lorem Ipsum is simply dummy text of the printing and typesetting industry."
            checked={notifications.projectApproval}
            onChange={() => handleToggle("projectApproval")}
          />
          <NotificationToggle
            icon={renderIcon()}
            title="Project Updates"
            description="Lorem Ipsum is simply dummy text of the printing and typesetting industry."
            checked={notifications.projectUpdates}
            onChange={() => handleToggle("projectUpdates")}
          />
          <NotificationToggle
            icon={renderIcon()}
            title="Financial Updates"
            description="Enable this feature if you wish to send a financial notification to users."
            checked={notifications.financialUpdates}
            onChange={() => handleToggle("financialUpdates")}
          />
        </Box>
      </Box>

      {/* --- Select Client & General Notification Section (Existing) --- */}
      <Box className="bg-white rounded-lg shadow-sm p-4 md:p-5 mb-6">
        {/* This section remains unchanged as per the request */}
        <Box className="flex items-center gap-3 mb-4">
          <Avatar
            variant="square"
            sx={{
              bgcolor: "grey.200",
              px: 3,
              py: 3,
            }}
          >
            <PersonOutlineIcon sx={{ color: "grey.700" }} />
          </Avatar>

          <Box>
            <Typography variant="body1" className="font-medium">
              Select Client
            </Typography>
            <Typography variant="caption" className="text-gray-500">
              Please select a client that you wish to notify
            </Typography>
          </Box>
        </Box>

        <Box className="flex items-center  mb-4 flex-wrap gap-2">
          <TextField
            fullWidth
            size="small"
            placeholder="Please,search for a client"
            variant="outlined"
            // Add state and onChange if this search needs to be functional
            sx={{
              maxWidth: 300,
              bgcolor: "white",
              "& .MuiOutlinedInput-root": {
                borderRadius: "0.375rem",
                "& fieldset": { borderColor: "grey.200" },
                "&:hover fieldset": { borderColor: "grey.300" },
                "&.Mui-focused fieldset": { borderColor: "primary.main" },
              },
              "& .MuiOutlinedInput-input": {
                fontSize: "0.875rem",
                padding: "8px 10px",
              },
            }}
            InputLabelProps={{ shrink: false }}
          />
          <Box className="flex items-center gap-2">
            <AvatarGroup
              max={clientsToShow}
              sx={{
                bgcolor: "white",
                "& .MuiAvatar-root": {
                  width: 28,
                  height: 28,
                  fontSize: "0.75rem",
                  borderWidth: "1px",
                },
              }}
            >
              {selectedClientAvatars.map((src, index) => (
                <Avatar key={index} alt={`Client ${index + 1}`} src={src} />
              ))}
            </AvatarGroup>
            {selectedClientAvatars.length > clientsToShow && (
              <Typography variant="caption" className="text-blue-500 ml-1">
                +{selectedClientAvatars.length - clientsToShow} more
              </Typography>
            )}
            <Link
              href="#"
              variant="caption"
              underline="hover"
              sx={{ color: "rgb(59 130 246)", ml: 2 }}
            >
              Edit Selected Client
            </Link>
          </Box>
        </Box>

        <Box className="flex flex-row gap-14 mt-4">
          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder="Please write down your notification text here:"
            value={message}
            onChange={handleMessageChange}
            sx={{
              bgcolor: "grey.50",
              "& .MuiOutlinedInput-root": {
                borderRadius: "0.375rem",
                padding: "8px 12px",
                "& fieldset": { borderColor: "grey.200" },
                "&:hover fieldset": { borderColor: "grey.300" },
                "&.Mui-focused fieldset": { borderColor: "primary.main" },
              },
              "& .MuiOutlinedInput-input": {
                fontSize: "0.875rem",
                padding: "0px",
              },
            }}
          />
          <div className="flex items-end justify-end">
            <Button
              variant="contained"
              onClick={handleSend}
              sx={{
                color: "black",
                backgroundColor: "#E9E9E9",
                boxShadow: "none",
                "&:hover": {
                  backgroundColor: "#DCDCDC",
                  boxShadow: "none",
                },
                textTransform: "none",
                fontSize: "0.8125rem",
                padding: "4px 12px",
              }}
            >
              Send
            </Button>
          </div>
        </Box>
      </Box>

      {/* --- Finance Access Clients Section (MODIFIED) --- */}
      <Box className="bg-white rounded-lg shadow-sm p-4 md:p-5 mb-6">
        <Box className="flex flex-col gap-3 mb-4 ">
          <Typography variant="body1" className="font-medium">
            Finance Access Clients
          </Typography>
          <Select
            multiple
            value={selectedFinanceClients} // Now an array
            onChange={(e) => setSelectedFinanceClients(e.target.value)}
            displayEmpty
            fullWidth
            className="mb-4"
            inputProps={{ "aria-label": "Select Finance Client" }}
            IconComponent={ExpandMoreIcon}
            renderValue={(selected) => {
              if (selected.length === 0) {
                return (
                  <Typography className="text-gray-500">
                    Select one or more...
                  </Typography>
                );
              }
              const selectedNames = filteredFinanceClients
                .filter((client) => selected.includes(client._id))
                .map((client) => client.userName);
              return selectedNames.join(", ");
            }}
            MenuProps={{
              autoFocus: false,
              PaperProps: {
                sx: {
                  maxHeight: 300,
                },
              },
            }}
            sx={{
              "& .MuiSelect-select": {
                padding: "10px 14px",
              },
              backgroundColor: "#f9fafb",
              borderRadius: "0.375rem",
            }}
          >
            <ListSubheader>
              <TextField
                size="small"
                autoFocus
                placeholder="Search clients..."
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                value={clientSearchQuery}
                onChange={(e) => setClientSearchQuery(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
                sx={{ padding: "8px" }}
              />
            </ListSubheader>

            {isLoadingClients && (
              <MenuItem disabled sx={{ justifyContent: "center" }}>
                <CircularProgress size={20} />
              </MenuItem>
            )}

            {!isLoadingClients && filteredFinanceClients.length === 0 && (
              <MenuItem disabled>
                {clientSearchQuery
                  ? "No clients match your search."
                  : "No finance clients found."}
              </MenuItem>
            )}

            {!isLoadingClients &&
              filteredFinanceClients.map((client) => (
                <MenuItem key={client._id} value={client._id}>
                  {client.userName}
                </MenuItem>
              ))}
          </Select>
        </Box>

        {/* --- Added Members Section --- */}
        <Box>
          <Typography variant="body1" className="font-medium">
            Added Members
          </Typography>
        </Box>
        <Box className="space-y-3">
          {filteredFinanceClients
            .filter((client) => selectedFinanceClients.includes(client._id))
            .map((member) => (
              <Box
                key={member._id}
                className="flex justify-between items-center p-2 rounded hover:bg-gray-50"
              >
                <Box className="flex items-center gap-3">
                  <Avatar className="bg-blue-100 text-blue-600">
                    {member.userName?.charAt(0).toUpperCase()}
                  </Avatar>
                  <Typography variant="body1">{member.userName}</Typography>
                </Box>
                <IconButton
                  onClick={() =>
                    setSelectedFinanceClients((prev) =>
                      prev.filter((id) => id !== member._id)
                    )
                  }
                  aria-label={`Remove ${member.userName}`}
                  className="text-red-500 hover:bg-red-50"
                >
                  <Trash2 className="text-red-500" />
                </IconButton>
              </Box>
            ))}
        </Box>
      </Box>

      {/* --- Finance Notifications Section (Existing) --- */}
      <Box
        className="bg-white rounded-lg shadow-md p-4 mt-6 w-full "
        sx={{ minHeight: "250px" }} // Add desired height here
      >
        {" "}
        {/* Removed fixed height */}
        <Box className="flex items-center gap-4">
          <img
            src={notification}
            className="bg-gray-200 px-3 py-3" // Kept original style
            alt="Notification Icon"
          />
          <Box>
            <p className="text-black-blacknew font-medium">
              Finance Notifications {/* Use t() if i18n is configured */}
            </p>
            <p className="text-lightpurple-light text-sm">
              Send Finance Notifications to the Finance users.
            </p>
          </Box>
        </Box>
        <Box className="mt-4">
          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder="Please, write down the finance notification message you want to send to the selected users."
            className="bg-white rounded-md" // Kept original style
            value={financeMessage} // Bind value
            onChange={handleFinanceMessageChange} // Bind onChange
            sx={{
              // Ensure consistent styling if needed
              bgcolor: "white",
              "& .MuiOutlinedInput-root": {
                borderRadius: "0.375rem",
                padding: "8px 12px",
                "& fieldset": { borderColor: "grey.200" },
                "&:hover fieldset": { borderColor: "grey.300" },
                "&.Mui-focused fieldset": { borderColor: "primary.main" },
              },
              "& .MuiOutlinedInput-input": {
                fontSize: "0.875rem",
                padding: "0px",
              },
            }}
          />
          <Button
            variant="contained"
            onClick={handleFinanceSend} // Use specific handler for finance send
            // disabled={!selectedFinanceClient || !financeMessage.trim()} // Disable if no client selected or no message
            sx={{
              float: "right",
              marginTop: "12px",
              color: "black",
              backgroundColor: "#E9E9E9", // Kept original style
              boxShadow: "none", // Kept original style
              "&:hover": {
                backgroundColor: "#DCDCDC", // Kept original style
                boxShadow: "none", // Kept original style
              },
              textTransform: "none",
              fontSize: "0.8125rem",
              padding: "4px 12px",
              "&.Mui-disabled": {
                // Style for disabled state
                backgroundColor: "grey.300",
                color: "grey.500",
              },
            }}
          >
            Send
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default NotificationSettings;
