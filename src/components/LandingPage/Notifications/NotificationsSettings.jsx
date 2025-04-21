"use client";

import React, { useState } from "react";
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
} from "@mui/material";
import {
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  PersonOutline as PersonOutlineIcon,
  NotificationsNone as NotificationsNoneIcon,
} from "@mui/icons-material";
import notification from "../../../assets/notifications.svg";
import magicPen from "../../../assets/magicpen.svg";
import { t } from "i18next";
import { Trash2 } from "lucide-react";

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

  const teamMembers = [
    {
      id: 1,
      name: "Ralph Edwards",
      avatar: "https://via.placeholder.com/40/FFA726/FFFFFF?text=RE",
    },
    {
      id: 2,
      name: "Kristin Watson",
      avatar: "https://via.placeholder.com/40/EC407A/FFFFFF?text=KW",
    },
    {
      id: 3,
      name: "Floyd Miles",
      avatar: "https://via.placeholder.com/40/26A69A/FFFFFF?text=FM",
    },
    {
      id: 4,
      name: "Amanda Parkers",
      avatar: "https://via.placeholder.com/40/42A5F5/FFFFFF?text=AP",
    },
  ];

  const selectedClientAvatars = [
    "https://via.placeholder.com/30/FFA726/FFFFFF?text=A",
    "https://via.placeholder.com/30/EC407A/FFFFFF?text=B",
    "https://via.placeholder.com/30/26A69A/FFFFFF?text=C",
    "https://via.placeholder.com/30/42A5F5/FFFFFF?text=D",
    "https://via.placeholder.com/30/FFEE58/000000?text=E",
  ];
  const clientsToShow = 4;

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

  const handleSend = () => {
    if (!message.trim()) return;
    console.log("Sending message:", message);
    setMessage("");
  };

  const handleFinanceSend = () => {
    if (!financeMessage.trim()) return;
    console.log("Sending finance notification:", financeMessage);
    setFinanceMessage("");
  };

  const handleRemoveMember = (id) => {
    console.log(`Removing member with id: ${id}`);
  };

  const renderIcon = () => <img src={magicPen} className="h-10 w-10" />;

  const [selectedOption, setSelectedOption] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const teamMembers2 = [
    { id: 1, name: "Ralph Edwards", avatar: "RE" },
    { id: 2, name: "Kristin Watson", avatar: "KW" },
    { id: 3, name: "Floyd Miles", avatar: "FM" },
    { id: 4, name: "Amanda Parkers", avatar: "AP" },
  ];

  return (
    <Box className="p-4 md:p-6 min-h-screen w-full bg-gray-100">
      {/* --- Personalized Notifications Section --- */}
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

        <Box className="flex items-center  mb-4 flex-wrap gap-2">
          <TextField
            fullWidth
            size="small"
            placeholder="Please,search for a client"
            variant="outlined"
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

      {/* --- Select Client & General Notification Section --- */}
      <Box className="bg-white rounded-lg shadow-sm p-4 md:p-5 mb-6">
        <Box className="flex flex-col gap-3 mb-4 ">
          <Typography variant="body1" className="font-medium">
            Finance Access Clients
          </Typography>
          <Select
            value={selectedOption}
            onChange={(e) => setSelectedOption(e.target.value)}
            displayEmpty
            fullWidth
            className="mb-4"
            inputProps={{ "aria-label": "Select one or more" }}
            IconComponent={ExpandMoreIcon}
            renderValue={(selected) => {
              if (!selected) {
                return (
                  <Typography className="text-gray-500">
                    Select one or more...
                  </Typography>
                );
              }
              return selected;
            }}
            sx={{
              "& .MuiSelect-select": {
                padding: "10px 14px",
              },
              backgroundColor: "#f9fafb",
              borderRadius: "0.375rem",
            }}
          >
            {/* You can map options here */}
            <MenuItem value="Client 1">Client 1</MenuItem>
            <MenuItem value="Client 2">Client 2</MenuItem>
            <MenuItem value="Client 3">Client 3</MenuItem>
          </Select>
        </Box>

        <Box>
          <Typography variant="body1" className="font-medium">
            Added Members
          </Typography>
        </Box>
        <Box className="space-y-3">
          {teamMembers2.map((member) => (
            <Box
              key={member.id}
              className="flex justify-between items-center p-2 rounded hover:bg-gray-50"
            >
              <Box className="flex items-center gap-3">
                <Avatar className="bg-blue-100 text-blue-600">
                  {member.avatar}
                </Avatar>
                <Typography variant="body1">{member.name}</Typography>
              </Box>
              <IconButton
                onClick={() => handleRemoveMember(member.id)}
                aria-label={`Remove ${member.name}`}
                className="text-red-500 hover:bg-red-50"
              >
                <Trash2 className="text-red-500" />
              </IconButton>
            </Box>
          ))}
        </Box>
      </Box>

      {/* --- Original Personalized Notifications Section --- */}
      <Box className="bg-white rounded-lg shadow-md p-4 mt-6 w-full h-[40vh]">
        <Box className="flex items-center gap-4">
          <img
            src={notification}
            className="bg-gray-200 px-3 py-3"
            alt="Notification Icon"
          />
          <Box>
            <p className="text-black-blacknew font-medium">
              {t("Finance_Notifications")}
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
            className="bg-white rounded-md"
          />
       <Button
              variant="contained"
              onClick={handleSend}
              sx={{
                float: "right",
                marginTop: "12px",
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
        </Box>
      </Box>
    </Box>
  );
};

export default NotificationSettings;
