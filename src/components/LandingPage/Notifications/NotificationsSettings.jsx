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
import notificationIconAsset from "../../../assets/notifications.svg";
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
  const [isUserSearchDropdownOpen, setIsUserSearchDropdownOpen] =
    useState(false);

  const token = useSelector((state) => state?.auth?.userToken);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const clientsToShow = 3;

  const translationMap = {
    "Enable dynamic generation and display of project reports with real-time data updates and flexible filtering options, ensuring stakeholders always view the most current and relevant information":
      {
        titleKey: "notification_title_project_reports",
        descKey: "notification_desc_project_reports",
      },
    "Facilitate real-time project approval workflows with instant status updates, automated notifications, and role-based actions to streamline decision-making and enhance transparency.":
      {
        titleKey: "notification_title_approval_workflows",
        descKey: "notification_desc_approval_workflows",
      },
    "Deliver live project updates with automatic status tracking, progress highlights, and real-time collaboration insights to keep teams aligned and informed at every stage.":
      {
        titleKey: "notification_title_project_updates",
        descKey: "notification_desc_project_updates",
      },
    "Provide real-time financial updates with dynamic dashboards, budget tracking, and instant alerts to ensure informed decision-making and financial transparency across projects.":
      {
        titleKey: "notification_title_financial_updates",
        descKey: "notification_desc_financial_updates",
      },
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

  const fetchUsers = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setIsLoadingClients(true);
    try {
      const [clientsApiResponse, rolesUserApiResponse] = await Promise.all([
        apiRequest("get", "/clients", {}, token),
        apiRequest("get", "/rolesUser", {}, token),
      ]);
      const clientsData = clientsApiResponse?.data?.data || [];
      const rolesUserData = rolesUserApiResponse?.data?.data || [];

      const processedClientsOnly = clientsData.filter((u) => u && u._id);
      const financeTypeClientsFromClientsApi = processedClientsOnly.filter(
        (u) => u.userType === "Finance"
      );
      const uniqueClientsForLowerSection =
        financeTypeClientsFromClientsApi.reduce((acc, current) => {
          const x = acc.find((item) => item._id === current._id);
          if (!x) return acc.concat([current]);
          return acc;
        }, []);
      setUsers(uniqueClientsForLowerSection);

      let combinedDataForUpperSection = [];
      if (Array.isArray(clientsData)) {
        combinedDataForUpperSection.push(
          ...clientsData.filter((u) => u && u._id)
        );
      }
      if (Array.isArray(rolesUserData)) {
        combinedDataForUpperSection.push(
          ...rolesUserData.filter((u) => u && u._id)
        );
      }
      const uniqueCombinedUsersForUpperSection =
        combinedDataForUpperSection.reduce((acc, current) => {
          const x = acc.find((item) => item._id === current._id);
          if (!x) return acc.concat([current]);
          return acc;
        }, []);
      setFinanceClients(uniqueCombinedUsersForUpperSection);
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

  const filteredUsers = users.filter((user) => {
    const nameMatches = (user.userName?.toLowerCase() || "").includes(
      userSearchQuery.toLowerCase()
    );
    const emailMatches = (user.email?.toLowerCase() || "").includes(
      userSearchQuery.toLowerCase()
    );
    if (userSearchQuery && !(nameMatches || emailMatches)) return false;
    if (selectedUsers.some((selected) => selected._id === user._id))
      return false;
    return true;
  });

  const usersAvailableForSelection = users.filter(
    (u) => !selectedUsers.some((selected) => selected._id === u._id)
  );
  const usersToShowInDropdown = userSearchQuery
    ? usersAvailableForSelection.filter(
        (user) =>
          (user.userName?.toLowerCase() || "").includes(
            userSearchQuery.toLowerCase()
          ) ||
          (user.email?.toLowerCase() || "").includes(
            userSearchQuery.toLowerCase()
          )
      )
    : usersAvailableForSelection;

  const handleToggle = async (notificationId) => {
    if (!token || !notificationId) return;
    const notificationIndex = notifications.findIndex(
      (n) => n._id === notificationId
    );
    if (notificationIndex === -1) return;
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
      if (response.data.message) toast.success(t(response.data.message));
    } catch (error) {
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

  const handleMessageChange = (e) => setMessage(e.target.value);
  const handleFinanceMessageChange = (e) => setFinanceMessage(e.target.value);
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
    try {
      const results = [];
      for (const item of selectedItems) {
        const memberId = typeof item === "string" ? item : item._id;
        if (!memberId) continue;
        const response = await apiRequest(
          "post",
          "/shownotifications",
          { title, description, type, memberId },
          token
        );
        results.push(response.data);
      }
      const allSuccess = results.every((result) => result?.success);
      if (allSuccess && results.length > 0) {
        resetState();
        toast.success(t("notifications sent successfully"));
      } else if (results.length > 0) {
        toast.warn(t("Some notifications may have failed to send."));
      } else if (selectedItems.length > 0 && results.length === 0) {
        toast.error(t("Failed to send notifications, no valid recipients."));
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
    }
  };

  const resetClientForm = () => {
    setClientTitle("");
    setMessage("");
    setSelectedUsers([]);
    setUserSearchQuery("");
    setIsUserSearchDropdownOpen(false);
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
      selectedItems: selectedUsers,
      resetState: resetClientForm,
      validationErrorMessage: t(
        "Please enter a title, message and select at least one user"
      ),
    });
  };
  const handleFinanceSend = async () => {
    await sendNotification({
      title: financeTitle,
      description: financeMessage,
      type: "financial",
      selectedItems: selectedFinanceClients,
      resetState: resetFinanceForm,
      validationErrorMessage: t(
        "Please enter a title, message and select at least one finance client"
      ),
    });
  };

  const handleUserSearchFocus = () => setIsUserSearchDropdownOpen(true);
  const handleUserSearchBlur = () => {
    setTimeout(() => setIsUserSearchDropdownOpen(false), 150);
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
              {t("No notification settings found.")}
            </Typography>
          ) : (
            [...notifications]
              .filter((n) => n.title !== "Project Approval")
              .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
              .map((notificationItem) => {
                const mapping = translationMap[notificationItem.title];

                const titleToTranslate = mapping
                  ? mapping.titleKey
                  : notificationItem.title;
                const descToTranslate = mapping
                  ? mapping.descKey
                  : notificationItem.description || "";

                return (
                  <NotificationToggle
                    key={notificationItem._id}
                    icon={renderIcon()}
                    title={t(titleToTranslate)}
                    description={t(descToTranslate)}
                    checked={notificationItem.status}
                    onChange={() => handleToggle(notificationItem._id)}
                  />
                );
              })
          )}
        </Box>
      </Box>

      <Box className="bg-white rounded-lg shadow-sm p-4 md:p-5 mb-6">
        <Box className="flex flex-col gap-3 mb-4 ">
          <Typography variant="body1" className="font-medium">
            {t("Select_Client")}
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
            renderValue={(selectedIds) => {
              if (selectedIds.length === 0)
                return (
                  <Typography className="text-gray-500">
                    {t("Select_one_or_more_finance_clients...")}
                  </Typography>
                );
              const selectedNames = financeClients
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
            disabled={isLoadingClients}
          >
            <ListSubheader>
              <TextField
                size="small"
                autoFocus
                placeholder={t("Search_finance_clients...")}
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
                {t("Notification")}
              </p>
              <p className="text-lightpurple-light text-sm">
                {t("Send_notifications")}
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

      <Box className="bg-white rounded-lg shadow-sm p-4 md:p-5 mb-6">
        <Box className="flex items-center gap-3 mb-4">
          <Avatar variant="square" sx={{ bgcolor: "grey.200", px: 3, py: 3 }}>
            <PersonOutlineIcon sx={{ color: "grey.700" }} />
          </Avatar>
          <Box>
            <Typography variant="body1" className="font-medium">
              {t("Finance")}
            </Typography>
            <Typography variant="caption" className="text-gray-500">
              {t("Please_select_a_finance_that_you_wish_to_notify")}
            </Typography>
          </Box>
        </Box>
        <Box className="flex items-center flex-wrap gap-2 relative mb-4">
          <TextField
            fullWidth
            size="small"
            placeholder={t("Search_for_a_finance...")}
            variant="outlined"
            value={userSearchQuery}
            onChange={(e) => setUserSearchQuery(e.target.value)}
            onFocus={handleUserSearchFocus}
            onBlur={handleUserSearchBlur}
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
          {isUserSearchDropdownOpen && (
            <Box
              className="absolute z-10 mt-1 w-full max-w-[300px] bg-white border border-gray-200 rounded-md shadow-lg"
              sx={{ top: "calc(100% + 4px)", left: 0 }}
            >
              <Box className="max-h-60 overflow-y-auto py-1">
                {loading ? (
                  <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
                    <CircularProgress size={20} />
                  </Box>
                ) : usersToShowInDropdown.length > 0 ? (
                  usersToShowInDropdown.map((user) => (
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
                        setIsUserSearchDropdownOpen(false);
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
                    {userSearchQuery
                      ? t('No users found matching "{query}"', {
                          query: userSearchQuery,
                        })
                      : users.length === 0
                      ? t("No finance users available.")
                      : t("No more finance users to select.")}
                  </Typography>
                )}
              </Box>
            </Box>
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
              {t("Edit_Selected_Finance")}
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
                value={userSearchQuery}
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
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <Box
                      key={user._id}
                      className="flex items-center px-3 py-2 cursor-pointer hover:bg-gray-100"
                      onClick={() => {
                        if (!selectedUsers.some((su) => su._id === user._id))
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