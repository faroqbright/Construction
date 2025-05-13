"use client";

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
import notificationIconAsset from "../../../assets/notifications.svg"; // Renamed to avoid conflict with notifications state
import magicPen from "../../../assets/magicpen.svg";
import { Trash2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import apiRequest from "../../../utils/apiRequest";
import { removeUserInfo } from "../../../features/auth/authSlice";
import "../../../utils/i18n";
import { useTranslation } from "react-i18next";

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
  const [users, setUsers] = useState([]); // For "Select_Client" dropdown
  const [loading, setLoading] = useState(false); // For "Select_Client" search spinner
  const [clientSearchQuery, setClientSearchQuery] = useState(""); // For "Finance_Access_Clients" dropdown search
  const [userSearchQuery, setUserSearchQuery] = useState(""); // For "Select_Client" dropdown search
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
  const [message, setMessage] = useState("");
  const [clientTitle, setClientTitle] = useState("");
  const [financeMessage, setFinanceMessage] = useState("");
  const [financeTitle, setFinanceTitle] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [modalType, setModalType] = useState(""); // "view" or "edit"
  const [financeClients, setFinanceClients] = useState([]); // For "Finance_Access_Clients" dropdown
  const [isLoadingClients, setIsLoadingClients] = useState(false); // For "Finance_Access_Clients" dropdown spinner
  const [selectedFinanceClients, setSelectedFinanceClients] = useState([]); // Holds IDs of selected finance clients
  const token = useSelector((state) => state?.auth?.userToken);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const clientsToShow = 3;

  const translatableTitles = {
    "Project Reports": t("Project Reports"),
    "Project Updates": t("Project Updates"),
    "Financial Updates": t("Financial Updates"),
  };

  const translateDescriptions = {
    "Enable dynamic generation and display of project reports with real-time data updates and flexible filtering options, ensuring stakeholders always view the most current and relevant information":
      t(
        "Enable dynamic generation and display of project reports with real-time data updates and flexible filtering options, ensuring stakeholders always view the most current and relevant information"
      ),
    "Deliver live project updates with automatic status tracking, progress highlights, and real-time collaboration insights to keep teams aligned and informed at every stage.":
      t(
        "Deliver live project updates with automatic status tracking, progress highlights, and real-time collaboration insights to keep teams aligned and informed at every stage."
      ),
    "Provide real-time financial updates with dynamic dashboards, budget tracking, and instant alerts to ensure informed decision-making and financial transparency across projects.":
      t(
        "Provide real-time financial updates with dynamic dashboards, budget tracking, and instant alerts to ensure informed decision-making and financial transparency across projects."
      ),
  };

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
        setNotifications([]);
      }
    } catch (error) {
      setNotifications([]);
      if (error?.response?.status === 401) {
        dispatch(removeUserInfo());
        toast.success(t("You have been logged out."));
        navigate("/login");
      } else {
        toast.error(
          t(
            error?.response?.data?.message ||
              "Failed to fetch notification settings."
          )
        );
      }
    } finally {
      setIsLoadingNotifications(false);
    }
  }, [token, dispatch, navigate, t]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // fetchClients function and its useEffect are removed as this logic is merged into fetchUsers

  const fetchUsers = useCallback(async () => {
    if (!token) return;

    setLoading(true); // For "Select_Client" search UI
    setIsLoadingClients(true); // For "Finance_Access_Clients" dropdown UI

    try {
      const [clientsApiResponse, rolesUserApiResponse] = await Promise.all([
        apiRequest("get", "/clients", {}, token),
        apiRequest("get", "/rolesUser", {}, token),
      ]);

      const clientsData = clientsApiResponse?.data?.data;
      const rolesUserData = rolesUserApiResponse?.data?.data;

      // 1. Populate `users` state (for "Select_Client" dropdown)
      // This dropdown will show users from the `/rolesUser` endpoint only.
      let usersForGeneralSelector = [];
      if (Array.isArray(rolesUserData)) {
        usersForGeneralSelector = [...rolesUserData];
      }
      // De-duplicate (important if the source could have duplicates)
      const uniqueUsersForGeneralSelector = usersForGeneralSelector.reduce(
        (acc, current) => {
          if (current && current._id) {
            // Ensure current and current._id exist
            const x = acc.find((item) => item._id === current._id);
            if (!x) {
              return acc.concat([current]);
            }
          }
          return acc;
        },
        []
      );
      setUsers(uniqueUsersForGeneralSelector);

      // 2. Populate `financeClients` state (for "Finance_Access_Clients" dropdown)
      // This dropdown will show ALL users from BOTH `/clients` and `/rolesUser` (merged and de-duplicated).
      let allUsersFromBothApis = [];
      if (Array.isArray(clientsData)) {
        allUsersFromBothApis.push(...clientsData.filter((u) => u && u._id)); // Filter out invalid entries
      }
      if (Array.isArray(rolesUserData)) {
        allUsersFromBothApis.push(...rolesUserData.filter((u) => u && u._id)); // Filter out invalid entries
      }

      const uniqueCombinedUsers = allUsersFromBothApis.reduce(
        (acc, current) => {
          if (current && current._id) {
            // Ensure current and current._id exist
            const x = acc.find((item) => item._id === current._id);
            if (!x) {
              return acc.concat([current]);
            }
          }
          return acc;
        },
        []
      );
      setFinanceClients(uniqueCombinedUsers);
    } catch (error) {
      setUsers([]);
      setFinanceClients([]);
      if (error?.response?.status === 401) {
        dispatch(removeUserInfo());
        toast.success(t("You have been logged out."));
        navigate("/login");
      } else {
        toast.error(
          t(error?.response?.data?.message || "Failed to fetch user data.")
        );
      }
    } finally {
      setLoading(false);
      setIsLoadingClients(false);
    }
  }, [token, dispatch, navigate, t]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filteredFinanceClients = financeClients.filter(
    (client) =>
      (client.userName?.toLowerCase() || "").includes(
        clientSearchQuery.toLowerCase()
      ) ||
      (client.email?.toLowerCase() || "").includes(
        clientSearchQuery.toLowerCase()
      )
  );

  const filteredUsers = users.filter(
    (user) =>
      (user.userName?.toLowerCase() || "").includes(
        userSearchQuery.toLowerCase()
      ) ||
      ((user.email?.toLowerCase() || "").includes(
        userSearchQuery.toLowerCase()
      ) &&
        (modalType !== "edit" ||
          !selectedUsers.some((selected) => selected._id === user._id)))
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

      if (response.data.message) {
        toast.success(t(response.data.message));
      }
    } catch (error) {
      // Revert UI change on error
      updatedNotifications[notificationIndex] = {
        ...currentNotification,
        status: currentNotification.status,
      };
      setNotifications(updatedNotifications);
      toast.error(
        t(
          error?.response?.data?.message ||
            "Failed to update notification status."
        )
      );
      if (error?.response?.status === 401) {
        dispatch(removeUserInfo());
        toast.success(t("You have been logged out."));
        navigate("/login");
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

  const sendNotification = async ({
    title,
    description,
    type,
    selectedItems,
    resetState,
    validationErrorMessage,
  }) => {
    if (!title.trim() || !description.trim() || selectedItems.length === 0) {
      toast.error(t(validationErrorMessage));
      return;
    }

    setLoading(true); // Consider a specific loading state for sending notifications
    try {
      const results = [];
      for (const member of selectedItems) {
        const response = await apiRequest(
          "post",
          "/shownotifications",
          {
            title,
            description,
            type,
            memberId: member._id || member, // Handles if member is an object or just an ID string
          },
          token
        );
        results.push(response.data);
      }

      const allSuccess = results.every((result) => result?.success);

      if (allSuccess) {
        resetState();
        toast.success(t("notifications sent successfully"));
      } else {
        // Handle partial success if necessary
        toast.warn(t("Some notifications may have failed to send."));
      }
    } catch (error) {
      toast.error(
        t(error?.response?.data?.message || "Failed to send notifications.")
      );
      if (error?.response?.status === 401) {
        dispatch(removeUserInfo());
        toast.success(t("You have been logged out."));
        navigate("/login");
      }
    } finally {
      setLoading(false); // Reset general loading state
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
      selectedItems: selectedUsers, // selectedUsers are full objects
      resetState: resetClientForm,
      validationErrorMessage: t(
        "Please enter a title, message and select at least one user"
      ),
    });
  };

  const handleFinanceSend = async () => {
    // selectedFinanceClients holds IDs. We need to get the full user objects for `selectedItems`.
    // Or ensure `sendNotification` can robustly handle just IDs if `member._id` isn't present.
    // The current `sendNotification` expects `member._id || member`.
    // So, `selectedFinanceClients` can be passed directly if items are just IDs.
    // However, for consistency and if `selectedItems` is used for more than just `memberId`, mapping to objects is safer.
    const itemsForFinanceNotification = selectedFinanceClients.map((id) => {
      const client = financeClients.find((c) => c._id === id);
      return client || { _id: id }; // Fallback to just ID if client object not found
    });

    await sendNotification({
      title: financeTitle,
      description: financeMessage,
      type: "financial", // This type is semantic, even if recipients are broader
      selectedItems: itemsForFinanceNotification,
      resetState: resetFinanceForm,
      validationErrorMessage: t(
        "Please enter a title, message and select at least one finance client"
      ),
    });
  };

  return (
    <Box className="p-4 md:p-6 min-h-screen w-full bg-gray-100">
      {/* Notification Toggles Section */}
      <Box className="shadow-sm py-4 md:py-5 mb-6">
        <Box className="space-y-4">
          {isLoadingNotifications ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
              <CircularProgress />
            </Box>
          ) : notifications.length === 0 ? (
            <Typography sx={{ textAlign: "center", color: "grey.600", p: 2 }}>
              {t("No notification settings found.")}
            </Typography>
          ) : (
            [...notifications]
              .filter((n) => n.title !== "Project Approval")
              .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
              .map((notificationItem) => (
                <NotificationToggle
                  key={notificationItem._id}
                  id={notificationItem._id}
                  icon={renderIcon()}
                  title={
                    translatableTitles[notificationItem.title] ||
                    notificationItem.title
                  }
                  description={
                    translateDescriptions[notificationItem.description] ||
                    notificationItem.description
                  }
                  checked={notificationItem.status}
                  onChange={() => handleToggle(notificationItem._id)}
                />
              ))
          )}
        </Box>
      </Box>

      {/* Client Notification Section ("Select_Client") */}
      <Box className="bg-white rounded-lg shadow-sm p-4 md:p-5 mb-6">
        <Box className="flex items-center gap-3 mb-4">
          <Avatar variant="square" sx={{ bgcolor: "grey.200", px: 3, py: 3 }}>
            <PersonOutlineIcon sx={{ color: "grey.700" }} />
          </Avatar>
          <Box>
            <Typography variant="body1" className="font-medium">
              {t("Select_Client")}
            </Typography>
            <Typography variant="caption" className="text-gray-500">
              {t("Please_select_a_client_that_you_wish_to_notify")}
            </Typography>
          </Box>
        </Box>

        <Box className="flex items-center flex-wrap gap-2 relative mb-4">
          <TextField
            fullWidth
            size="small"
            placeholder={t("Search_for_a_client...")}
            variant="outlined"
            value={userSearchQuery}
            onChange={(e) => setUserSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: loading ? ( // `loading` state for this section's user fetch
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
                          {user.userName || t("Unnamed User")}
                        </Typography>
                        <Typography variant="caption" className="text-gray-500">
                          {user.email || t("No email")}
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
                {t('No users found matching "{query}"', {
                  query: userSearchQuery,
                })}
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
                +{selectedUsers.length - clientsToShow} {t("more")}
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
              {t("Edit_Selected_Clients")}
            </Link>
          </Box>
        </Box>

        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            size="small"
            placeholder={t("Title_here..")}
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
            placeholder={t("Please_write_down_your_notification_text_here")}
            value={message}
            onChange={handleMessageChange}
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
                "&:hover": { backgroundColor: "#DCDCDC", boxShadow: "none" },
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
              {t("Send")}
            </Button>
          </div>
        </Box>
      </Box>

      {/* Finance Clients Notification Section ("Finance_Access_Clients") */}
      <Box className="bg-white rounded-lg shadow-sm p-4 md:p-5 mb-6">
        <Box className="flex flex-col gap-3 mb-4 ">
          <Typography variant="body1" className="font-medium">
            {t("Finance_Access_Clients")}
          </Typography>
          <Select
            multiple
            value={selectedFinanceClients} // Array of IDs
            onChange={(e) => setSelectedFinanceClients(e.target.value)}
            displayEmpty
            fullWidth
            className="mb-4"
            inputProps={{ "aria-label": "Select Finance Client" }}
            IconComponent={ExpandMoreIcon}
            renderValue={(selectedIds) => {
              // selectedIds is an array of IDs
              if (selectedIds.length === 0) {
                return (
                  <Typography className="text-gray-500">
                    {t("Select_one_or_more_finance_clients...")}
                  </Typography>
                );
              }
              const selectedNames = financeClients // financeClients is array of user objects
                .filter((client) => selectedIds.includes(client._id))
                .map((client) => client.userName || t("Unnamed User"));
              return selectedNames.join(", ");
            }}
            MenuProps={{
              autoFocus: false,
              PaperProps: { sx: { maxHeight: 300 } },
            }}
            sx={{
              "& .MuiSelect-select": { padding: "10px 14px" },
              backgroundColor: "#f9fafb",
              borderRadius: "0.375rem",
            }}
            disabled={isLoadingClients} // `isLoadingClients` state for this section's user fetch
          >
            <ListSubheader>
              <TextField
                size="small"
                autoFocus
                placeholder={t("Search_finance_clients...")} // Changed placeholder text
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
                  ? t("No_clients_match_search.")
                  : t("No_finance_clients_found.")}
              </MenuItem>
            )}
            {!isLoadingClients &&
              filteredFinanceClients.map((client) => (
                <MenuItem key={client._id} value={client._id}>
                  {client.userName || t("Unnamed User")}{" "}
                  {client.email ? `(${client.email})` : ""}
                </MenuItem>
              ))}
          </Select>
        </Box>

        {selectedFinanceClients.length > 0 && (
          <Box className="mb-4">
            <Typography variant="body1" className="font-medium mb-2">
              {t("Selected_Finance_Clients")} ({selectedFinanceClients.length})
            </Typography>
            <Box className="space-y-2 max-h-40 overflow-y-auto border rounded p-2 bg-gray-50">
              {financeClients // This is the full list of users (now populating this section)
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
                        {(member.userName || "U")?.charAt(0).toUpperCase()}
                      </Avatar>
                      <Typography variant="body2">
                        {member.userName || t("Unnamed User")}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {member.email || t("No email")}
                      </Typography>
                    </Box>
                    <IconButton
                      size="small"
                      onClick={() =>
                        setSelectedFinanceClients((prev) =>
                          prev.filter((id) => id !== member._id)
                        )
                      }
                      aria-label={t("Remove {userName}", {
                        userName: member.userName || "user",
                      })}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      title={t("Remove {userName}", {
                        userName: member.userName || "user",
                      })}
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
              src={notificationIconAsset}
              className="bg-gray-200 p-2 rounded"
              style={{ height: "40px", width: "40px" }}
              alt="Notification Icon"
            />
            <Box>
              <p className="text-black-blacknew font-medium">
                {" "}
                {t("Finance_Notification")}
              </p>
              <p className="text-lightpurple-light text-sm">
                {" "}
                {t("Send_notifications_to_selected_finance_users.")}
              </p>
            </Box>
          </Box>
          <Box className="space-y-4">
            <TextField
              fullWidth
              size="small"
              placeholder={t("Title_here..")}
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
              placeholder={t(
                "Please_write_the_finance_notification_message..."
              )}
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
                  "&:hover": { backgroundColor: "#DCDCDC", boxShadow: "none" },
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
                {t("Send")}
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Edit/View Selected Clients Modal (for "Select_Client" section) */}
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
                  ? t("Edit_Selected_Clients")
                  : t("Selected_Clients")}
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
                placeholder={t("Search_to_add_more_clients...")}
                variant="outlined"
                value={userSearchQuery} // Uses userSearchQuery for the general client modal
                onChange={(e) => setUserSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: loading ? (
                    <InputAdornment position="start">
                      <CircularProgress size={20} />
                    </InputAdornment>
                  ) : (
                    <InputAdornment position="start">
                      <SearchIcon />
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
                {filteredUsers.length > 0 ? ( // Uses filteredUsers (from `users` state)
                  filteredUsers.map((user) => (
                    <Box
                      key={user._id}
                      className="flex items-center px-3 py-2 cursor-pointer hover:bg-gray-100"
                      onClick={() => {
                        if (!selectedUsers.some((su) => su._id === user._id)) {
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
                          {user.userName || t("Unnamed User")}
                        </Typography>
                        <Typography variant="caption" className="text-gray-500">
                          {user.email || t("No email")}
                        </Typography>
                      </Box>
                    </Box>
                  ))
                ) : (
                  <Typography
                    variant="body2"
                    sx={{ p: 2, textAlign: "center", color: "grey.600" }}
                  >
                    {t("No_users_match_search.")}
                  </Typography>
                )}
              </Box>
            )}

            <Typography
              variant="subtitle1"
              className="font-medium mb-2 text-base flex-shrink-0"
            >
              {modalType === "edit"
                ? t("Currently_Selected_Clients")
                : t("Selected_Clients")}{" "}
              ({selectedUsers.length})
            </Typography>
            <Box className="flex-grow overflow-y-auto mb-4 border rounded-md p-2 bg-gray-50/50">
              {selectedUsers.length === 0 ? (
                <Typography
                  variant="body2"
                  className="text-gray-500 py-4 text-center"
                >
                  {t("No_clients_selected")}
                </Typography>
              ) : (
                selectedUsers.map((user) => (
                  <Box
                    key={user._id}
                    className="flex justify-between items-center p-2 rounded hover:bg-gray-100 mb-1 last:mb-0"
                  >
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
                          {user.userName || t("Unnamed User")}
                        </Typography>
                        <Typography
                          variant="caption"
                          className="text-gray-500 truncate"
                        >
                          {user.email || t("No email")}
                        </Typography>
                      </Box>
                    </Box>
                    {modalType === "edit" && (
                      <IconButton
                        onClick={() =>
                          setSelectedUsers(
                            selectedUsers.filter((u) => u._id !== user._id)
                          )
                        }
                        size="small"
                        aria-label={t("Remove {userName}", {
                          userName: user.userName || "user",
                        })}
                        title={t("Remove {userName}", {
                          userName: user.userName || "user",
                        })}
                        className="flex-shrink-0"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </IconButton>
                    )}
                  </Box>
                ))
              )}
            </Box>

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
                {modalType === "edit" ? t("Cancel") : t("Close")}
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
                  {t("Done")}
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
