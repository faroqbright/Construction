"use client";

import { useFirebaseNotifications } from "../../../hooks/useFirebaseNotifications";
import { useState, useEffect, useCallback } from "react";
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
  ListSubheader,
  InputAdornment,
  CircularProgress,
} from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  PersonOutline as PersonOutlineIcon,
  Search as SearchIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import notification from "../../../assets/notifications.svg";
import magicPen from "../../../assets/magicpen.svg";
import { t } from "i18next";
import { Trash2 } from "lucide-react";

import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import apiRequest from "../../../utils/apiRequest";
import { removeUserInfo } from "../../../features/auth/authSlice";

const NotificationToggle = ({
  icon,
  title,
  description,
  checked,
  onChange,
  id,
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

const NotificationSettings = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [clientSearchQuery, setClientSearchQuery] = useState("");
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
  const [message, setMessage] = useState("");
  const [clientTitle, setClientTitle] = useState("");
  const [financeMessage, setFinanceMessage] = useState("");
  const [financeTitle, setFinanceTitle] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [modalType, setModalType] = useState("");
  const [financeClients, setFinanceClients] = useState([]);
  const [isLoadingClients, setIsLoadingClients] = useState(false);
  const [selectedFinanceClients, setSelectedFinanceClients] = useState([]);
  const token = useSelector((state) => state?.auth?.userToken);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const clientsToShow = 3;

  const fetchNotifications = useCallback(async () => {
    if (!token) return;

    setIsLoadingNotifications(true);
    try {
      const response = await apiRequest(
        "get",
        "/notificationStatus/get-notificationStatus",
        {},
        token
      );

      if (response.data && Array.isArray(response.data.data)) {
        setNotifications(response.data.data);
      } else {
        console.warn(
          "Unexpected data format from notifications API:",
          response.data
        );
        setNotifications([]);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setNotifications([]);

      if (error?.response?.status === 401) {
        dispatch(removeUserInfo());
        toast.info("Session expired. Please log in again.");

        if (navigate) {
          navigate("/login");
        } else {
          console.error("Navigate function is not available.");
        }
      } else {
        toast.error(
          error?.response?.data?.message || "Failed to fetch notifications."
        );
      }
    } finally {
      setIsLoadingNotifications(false);
    }
  }, [token, dispatch, navigate]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const fetchClients = useCallback(async () => {
    if (!token) return;

    setIsLoadingClients(true);
    try {
      const response = await apiRequest("get", "/clients", {}, token);

      if (response.data && Array.isArray(response.data.data)) {
        const allClients = response.data.data;
        const financeTypeClients = allClients.filter(
          (user) => user.userType === "Finance"
        );
        setFinanceClients(financeTypeClients);
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
        if (navigate) {
          navigate("/login");
        } else {
          console.error("Navigate function is not available.");
        }
      } else {
        toast.error(
          error?.response?.data?.message || "Failed to fetch finance clients."
        );
      }
    } finally {
      setIsLoadingClients(false);
    }
  }, [token, dispatch, navigate]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiRequest("get", "/rolesUser", {}, token);
      if (response.data && response.data.data) {
        setUsers(response.data.data);
      } else {
        console.warn(
          "Received unexpected data structure for users:",
          response.data
        );
        setUsers([]);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      setUsers([]);
      if (error?.response?.status === 401) {
        dispatch(removeUserInfo());
        toast.info("Session expired. Please log in again.");
        if (navigate) {
          navigate("/login");
        }
      } else {
        toast.error(error?.response?.data?.message || "Failed to fetch users");
      }
    } finally {
      setLoading(false);
    }
  }, [token, dispatch, navigate]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filteredFinanceClients = financeClients.filter(
    (client) =>
      client.userName.toLowerCase().includes(clientSearchQuery.toLowerCase()) ||
      client.email.toLowerCase().includes(clientSearchQuery.toLowerCase())
  );

  const filteredUsers = users.filter(
    (user) =>
      (user.userName?.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(userSearchQuery.toLowerCase())) &&
      (modalType !== "edit" ||
        !selectedUsers.some((selected) => selected._id === user._id))
  );

  const handleToggle = async (notificationId) => {
    if (!token || !notificationId) return;

    const notificationIndex = notifications.findIndex(
      (n) => n._id === notificationId
    );
    if (notificationIndex === -1) {
      console.error(`Notification with ID ${notificationId} not found`);
      return;
    }

    const currentNotification = notifications[notificationIndex];
    const newStatus = !currentNotification.status;

    const updatedNotifications = [...notifications];
    updatedNotifications[notificationIndex] = {
      ...currentNotification,
      status: newStatus,
    };
    setNotifications(updatedNotifications);

    try {
      const response = await apiRequest(
        "put",
        `/notificationStatus/${notificationId}`,
        { status: newStatus },
        token
      );

      if (!response?.data?.success) {
        console.warn(
          "Server indicated status update might not have succeeded:",
          response?.data
        );
        throw new Error("Status update failed on server");
      }
    } catch (error) {
      console.error("Error updating status:", error);

      updatedNotifications[notificationIndex] = {
        ...currentNotification,
        status: currentNotification.status,
      };
      setNotifications(updatedNotifications);

      toast.error(
        error?.response?.data?.message || "Failed to update notification status"
      );

      if (error?.response?.status === 401) {
        dispatch(removeUserInfo());
        toast.info("Session expired. Please log in again.");
        if (navigate) navigate("/login");
      }
    }
  };

  const handleMessageChange = (e) => {
    setMessage(e.target.value);
  };
  const handleFinanceMessageChange = (e) => {
    setFinanceMessage(e.target.value);
  };

  const renderIcon = () => (
    <img
      src={magicPen || "/placeholder.svg"}
      className="h-10 w-10"
      alt="Edit Icon"
    />
  );

  useFirebaseNotifications(token);

  const sendNotification = async ({
    title,
    description,
    type,
    clientIds,
    selectedItems,
    resetState,
    successMessagePrefix,
    validationErrorMessage,
  }) => {
    if (!title.trim() || !description.trim() || selectedItems.length === 0) {
      toast.error(validationErrorMessage);
      return;
    }

    try {
      const response = await apiRequest(
        "post",
        "/notifications/create-notifications",
        {
          title,
          description,
          type,
          clientIds,
        },
        token
      );

      if (response.data?.data) {
        const createdNotification = response.data.data;
        resetState();
        toast.success(
          `${successMessagePrefix} notification "${createdNotification.title}" sent successfully`
        );
      } else {
        console.warn(
          `Notification API call succeeded but response format was unexpected for type ${type}:`,
          response.data
        );
        resetState();
        toast.info(
          `${successMessagePrefix} notification sent, but confirmation response was unclear.`
        );
      }
    } catch (error) {
      console.error(`Error sending ${type} notification:`, error);
      toast.error(
        error?.response?.data?.message || `Failed to send ${type} notification`
      );

      // Centralized 401 handling
      if (error?.response?.status === 401) {
        dispatch(removeUserInfo());
        toast.info("Session expired. Please log in again.");
        if (navigate) {
          navigate("/login");
        }
      }
    } finally {
    }
  };

  const resetClientForm = () => {
    setClientTitle("");
    setMessage("");
    setSelectedUsers([]);
    setUserSearchQuery("");
  };

  const resetFinanceForm = () => {
    setFinanceTitle("");
    setFinanceMessage("");
    setSelectedFinanceClients([]);
    setClientSearchQuery("");
  };

  const handleSend = async () => {
    await sendNotification({
      title: clientTitle,
      description: message,
      type: "client",
      clientIds: selectedUsers.map((user) => user._id),
      selectedItems: selectedUsers,
      resetState: resetClientForm,
      successMessagePrefix: "Client",
      validationErrorMessage:
        "Please enter a title, message and select at least one user",
    });
  };

  const handleFinanceSend = async () => {
    await sendNotification({
      title: financeTitle,
      description: financeMessage,
      type: "financial",
      clientIds: selectedFinanceClients,
      selectedItems: selectedFinanceClients,
      resetState: resetFinanceForm,
      successMessagePrefix: "Financial",
      validationErrorMessage:
        "Please enter a title, message and select at least one finance client",
    });
  };

  return (
    <Box className="p-4 md:p-6 min-h-screen w-full bg-gray-100">
      <Box className="shadow-sm py-4 md:py-5 mb-6">
        <Box className="space-y-4">
          {isLoadingNotifications ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
              <CircularProgress />
            </Box>
          ) : notifications.length === 0 ? (
            <Typography sx={{ textAlign: "center", color: "grey.600", p: 2 }}>
              No notification settings found.
            </Typography>
          ) : (
            [...notifications]
              .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
              .map((notificationItem) => (
                <NotificationToggle
                  key={notificationItem._id}
                  id={notificationItem._id}
                  icon={renderIcon()}
                  title={notificationItem.title}
                  description={notificationItem.description}
                  checked={notificationItem.status}
                  onChange={() => handleToggle(notificationItem._id)}
                />
              ))
          )}
        </Box>
      </Box>

      <Box className="bg-white rounded-lg shadow-sm p-4 md:p-5 mb-6">
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

        <Box className="flex items-center flex-wrap gap-2 relative mb-4">
          <TextField
            fullWidth
            size="small"
            placeholder="Search for a client..."
            variant="outlined"
            value={userSearchQuery}
            onChange={(e) => setUserSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: loading ? (
                <InputAdornment position="start">
                  <CircularProgress size={20} />
                </InputAdornment>
              ) : (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
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
          {filteredUsers.length > 0 &&
            userSearchQuery.length > 0 &&
            !loading && (
              <Box
                className="absolute z-10 mt-1 w-full max-w-[300px] bg-white border border-gray-200 rounded-md shadow-lg"
                sx={{ top: "calc(100% + 4px)", left: 0 }}
              >
                <Box className="max-h-60 overflow-y-auto py-1">
                  {filteredUsers.map((user) => (
                    <Box
                      key={user._id}
                      className="flex items-center px-3 py-2 cursor-pointer hover:bg-gray-100"
                      onClick={() => {
                        if (
                          !selectedUsers.some(
                            (selected) => selected._id === user._id
                          )
                        ) {
                          setSelectedUsers([...selectedUsers, user]);
                        }
                        setUserSearchQuery("");
                      }}
                    >
                      <Avatar className="h-6 w-6 mr-2 text-xs">
                        {user.userName
                          ? user.userName.charAt(0).toUpperCase()
                          : "U"}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" className="font-medium">
                          {user.userName || "Unnamed User"}
                        </Typography>
                        <Typography variant="caption" className="text-gray-500">
                          {user.email || "No email"}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}
          {userSearchQuery.length > 0 &&
            filteredUsers.length === 0 &&
            !loading && (
              <Typography
                variant="caption"
                sx={{
                  position: "absolute",
                  top: "calc(100% + 8px)",
                  left: 0,
                  color: "grey.600",
                  width: "300px",
                  textAlign: "center",
                  bgcolor: "white",
                  p: 1,
                  borderRadius: "4px",
                  border: "1px solid",
                  borderColor: "grey.200",
                  boxShadow: 1,
                  zIndex: 10,
                }}
              >
                No users found matching "{userSearchQuery}"
              </Typography>
            )}

          <Box className="flex items-center gap-2 ml-2">
            <AvatarGroup
              max={clientsToShow}
              sx={{
                bgcolor: "white",
                "& .MuiAvatar-root": {
                  width: 28,
                  height: 28,
                  fontSize: "0.75rem",
                  borderWidth: "1px",
                  cursor: "pointer",
                },
              }}
              onClick={() => {
                setModalType("view");
                setIsEditModalOpen(true);
              }}
            >
              {selectedUsers.map((user, index) => (
                <Avatar
                  key={user._id || index}
                  alt={user.userName || `User ${index + 1}`}
                  title={user.userName || `User ${index + 1}`}
                >
                  {user.userName
                    ? user.userName.charAt(0).toUpperCase()
                    : `U${index + 1}`}
                </Avatar>
              ))}
            </AvatarGroup>
            {selectedUsers.length > clientsToShow && (
              <Typography variant="caption" className="text-blue-500 ml-1">
                +{selectedUsers.length - clientsToShow} more
              </Typography>
            )}
            <Link
              component="button"
              variant="caption"
              underline="hover"
              sx={{ color: "rgb(59 130 246)", ml: 2, cursor: "pointer" }}
              onClick={(e) => {
                e.preventDefault();
                setModalType("edit");
                setIsEditModalOpen(true);
              }}
            >
              Edit Selected Clients
            </Link>
          </Box>
        </Box>

        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Title here.."
            value={clientTitle}
            onChange={(e) => setClientTitle(e.target.value)}
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
        </Box>

        <Box className="flex flex-col md:flex-row gap-4 mt-0">
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
          <div className="flex items-end justify-end mt-2 md:mt-0">
            <Button
              variant="contained"
              onClick={handleSend}
              disabled={
                !clientTitle.trim() ||
                !message.trim() ||
                selectedUsers.length === 0
              }
              sx={{
                color: "black",
                backgroundColor: "#E9E9E9",
                boxShadow: "none",
                "&:hover": {
                  backgroundColor: "#DCDCDC",
                  boxShadow: "none",
                },
                "&.Mui-disabled": {
                  backgroundColor: "grey.300",
                  color: "grey.500",
                  cursor: "not-allowed",
                  pointerEvents: "auto", 
                },
                textTransform: "none",
                fontSize: "0.8125rem",
                padding: "6px 12px",  
                whiteSpace: "nowrap",  
              }}
            >
              Send
            </Button>
          </div>
        </Box>
      </Box>

      <Box className="bg-white rounded-lg shadow-sm p-4 md:p-5 mb-6">
        <Box className="flex flex-col gap-3 mb-4 ">
          <Typography variant="body1" className="font-medium">
            Finance Access Clients
          </Typography>
          <Select
            multiple
            value={selectedFinanceClients}  
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
                    Select one or more finance clients...
                  </Typography>
                );
              }
              const selectedNames = financeClients  
                .filter((client) => selected.includes(client._id))
                .map((client) => client.userName);
              return selectedNames.join(", ");
            }}
            MenuProps={{
              autoFocus: false,
              PaperProps: {
                sx: { maxHeight: 300 },
              },
            }}
            sx={{
              "& .MuiSelect-select": {
                padding: "10px 14px",
              },
              backgroundColor: "#f9fafb",
              borderRadius: "0.375rem",
            }}
            disabled={isLoadingClients}  
          >
            <ListSubheader>
              <TextField
                size="small"
                autoFocus
                placeholder="Search finance clients..."
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
                value={clientSearchQuery}
                onChange={(e) => setClientSearchQuery(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
                sx={{ padding: "8px", backgroundColor: "white" }}  
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
                  ? "No clients match search."
                  : "No finance clients found."}
              </MenuItem>
            )}

            {!isLoadingClients &&
              filteredFinanceClients.map((client) => (
                <MenuItem key={client._id} value={client._id}>
                  {client.userName} {client.email ? `(${client.email})` : ""}
                </MenuItem>
              ))}
          </Select>
        </Box>

        {selectedFinanceClients.length > 0 && (
          <Box className="mb-4">
            <Typography variant="body1" className="font-medium mb-2">
              Selected Finance Clients ({selectedFinanceClients.length})
            </Typography>
            <Box className="space-y-2 max-h-40 overflow-y-auto border rounded p-2 bg-gray-50">
              {financeClients
                .filter((client) => selectedFinanceClients.includes(client._id))
                .map((member) => (
                  <Box
                    key={member._id}
                    className="flex justify-between items-center p-2 rounded hover:bg-gray-100"
                  >
                    <Box className="flex items-center gap-3">
                      <Avatar
                        sx={{ width: 28, height: 28, fontSize: "0.75rem" }}
                        className="bg-blue-100 text-blue-600"
                      >
                        {member.userName?.charAt(0).toUpperCase()}
                      </Avatar>
                      <Typography variant="body2">{member.userName}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {member.email}
                      </Typography>
                    </Box>
                    <IconButton
                      size="small"
                      onClick={() =>
                        setSelectedFinanceClients((prev) =>
                          prev.filter((id) => id !== member._id)
                        )
                      }
                      aria-label={`Remove ${member.userName}`}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      title={`Remove ${member.userName}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </IconButton>
                  </Box>
                ))}
            </Box>
          </Box>
        )}

        <Box className="mt-6">
          <Box className="flex items-center gap-4 mb-4">
            <img
              src={notification || "/placeholder.svg"} 
              className="bg-gray-200 p-2 rounded" 
              style={{ height: "40px", width: "40px" }}  
              alt="Notification Icon"
            />
            <Box>
              <p className="text-black-blacknew font-medium">
                {" "}
                Finance Notification
              </p>
              <p className="text-lightpurple-light text-sm">
                {" "}
                Send notifications to selected finance users.
              </p>
            </Box>
          </Box>
          <Box className="space-y-4">
            <TextField
              fullWidth
              size="small"
              placeholder="Title here.."
              value={financeTitle}  
              onChange={(e) => setFinanceTitle(e.target.value)}  
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
            <TextField
              fullWidth
              multiline
              rows={3}
              placeholder="Please write the finance notification message..."  
              value={financeMessage}
              onChange={handleFinanceMessageChange}
              sx={{
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
            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
              {" "}
              <Button
                variant="contained"
                onClick={handleFinanceSend}  
                disabled={
                  !financeTitle.trim() ||
                  !financeMessage.trim() ||
                  selectedFinanceClients.length === 0
                }  
                sx={{
                  marginTop: "0px",  
                  color: "black",
                  backgroundColor: "#E9E9E9",
                  boxShadow: "none",
                  "&:hover": {
                    backgroundColor: "#DCDCDC",
                    boxShadow: "none",
                  },
                  "&.Mui-disabled": {
                    backgroundColor: "grey.300",
                    color: "grey.500",
                    cursor: "not-allowed",
                    pointerEvents: "auto",
                  },
                  textTransform: "none",
                  fontSize: "0.8125rem",
                  padding: "6px 12px",  
                  whiteSpace: "nowrap",
                }}
              >
                Send
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>

      {isEditModalOpen && (
        <Box
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={() => setIsEditModalOpen(false)}
        >
          <Box
            className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md my-8 overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
            sx={{ maxHeight: "calc(100vh - 64px)" }}
          >
            <Box className="flex justify-between items-center mb-4 flex-shrink-0">
              <Typography variant="h6" className="font-medium">
                {modalType === "edit"
                  ? "Edit Selected Clients"
                  : "Selected Clients"}
              </Typography>
              <IconButton
                onClick={() => setIsEditModalOpen(false)}
                size="small"
                sx={{ color: "grey.500" }}
              >
                <CloseIcon />
              </IconButton>
            </Box>

            {modalType === "edit" && (
              <TextField
                fullWidth
                size="small"
                placeholder="Search to add more clients..."
                variant="outlined"
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: loading ? (
                    <InputAdornment position="start">
                      {" "}
                      <CircularProgress size={20} />{" "}
                    </InputAdornment>
                  ) : (
                    <InputAdornment position="start">
                      {" "}
                      <SearchIcon />{" "}
                    </InputAdornment>
                  ),
                }}
                className="mb-4 flex-shrink-0"
                sx={{
                  bgcolor: "white",
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "0.375rem",
                    "& fieldset": { borderColor: "grey.200" },
                    "&:hover fieldset": { borderColor: "grey.300" },
                    "&.Mui-focused fieldset": { borderColor: "primary.main" },
                  },
                }}
              />
            )}

            {modalType === "edit" && userSearchQuery.length > 0 && !loading && (
              <Box className="max-h-40 overflow-y-auto mb-4 border rounded-md flex-shrink-0">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <Box
                      key={user._id}
                      className="flex items-center px-3 py-2 cursor-pointer hover:bg-gray-100"
                      onClick={() => {
                        setSelectedUsers([...selectedUsers, user]);
                        setUserSearchQuery("");
                      }}
                    >
                      <Avatar className="h-6 w-6 mr-2 text-xs">
                        {user.userName
                          ? user.userName.charAt(0).toUpperCase()
                          : "U"}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" className="font-medium">
                          {user.userName || "Unnamed User"}
                        </Typography>
                        <Typography variant="caption" className="text-gray-500">
                          {user.email || "No email"}
                        </Typography>
                      </Box>
                    </Box>
                  ))
                ) : (
                  <Typography
                    variant="body2"
                    sx={{ p: 2, textAlign: "center", color: "grey.600" }}
                  >
                    No users match search.
                  </Typography>
                )}
              </Box>
            )}

            <Typography
              variant="subtitle1"
              className="font-medium mb-2 text-base flex-shrink-0"
            >
              {modalType === "edit"
                ? "Currently Selected Clients"
                : "Selected Clients"}{" "}
              ({selectedUsers.length})
            </Typography>
            <Box className="flex-grow overflow-y-auto mb-4 border rounded-md p-2 bg-gray-50/50">
              {selectedUsers.length === 0 ? (
                <Typography
                  variant="body2"
                  className="text-gray-500 py-4 text-center"
                >
                  No clients selected
                </Typography>
              ) : (
                selectedUsers.map((user) => (
                  <Box
                    key={user._id}
                    className="flex justify-between items-center p-2 rounded hover:bg-gray-100 mb-1 last:mb-0"
                  >
                    {/* User Info */}
                    <Box className="flex items-center gap-3 overflow-hidden">
                      <Avatar className="h-8 w-8 text-xs flex-shrink-0">
                        {user.userName
                          ? user.userName.charAt(0).toUpperCase()
                          : "U"}
                      </Avatar>
                      <Box className="overflow-hidden">
                        <Typography
                          variant="body2"
                          className="font-medium truncate"
                        >
                          {" "}
                          {/* Added truncate */}
                          {user.userName || "Unnamed User"}
                        </Typography>
                        <Typography
                          variant="caption"
                          className="text-gray-500 truncate"
                        >
                          {" "}
                          {/* Added truncate */}
                          {user.email || "No email"}
                        </Typography>
                      </Box>
                    </Box>
                    {modalType === "edit" && (
                      <IconButton
                        onClick={() => {
                          setSelectedUsers(
                            selectedUsers.filter((u) => u._id !== user._id)
                          );
                        }}
                        size="small"
                        aria-label={`Remove ${user.userName}`}
                        title={`Remove ${user.userName}`}
                        className="flex-shrink-0"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </IconButton>
                    )}
                  </Box>
                ))
              )}
            </Box>

            {/* Modal Footer */}
            <Box className="flex justify-end gap-2 mt-auto flex-shrink-0">
              <Button
                variant="outlined"
                onClick={() => setIsEditModalOpen(false)}
                sx={{
                  borderColor: "grey.300",
                  color: "grey.700",
                  "&:hover": {
                    borderColor: "grey.400",
                    backgroundColor: "grey.50",
                  },
                }}
              >
                {modalType === "edit" ? "Cancel" : "Close"}
              </Button>
              {modalType === "edit" && (
                <Button
                  variant="contained"
                  onClick={() => setIsEditModalOpen(false)}
                  sx={{
                    color: "black",
                    backgroundColor: "#E9E9E9",
                    boxShadow: "none",
                    "&:hover": {
                      backgroundColor: "#DCDCDC",
                      boxShadow: "none",
                    },
                  }}
                >
                  Done
                </Button>
              )}
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default NotificationSettings;
