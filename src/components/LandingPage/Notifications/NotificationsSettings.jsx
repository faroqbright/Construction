import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
// import { fetchNotifications } from "../../../Redux/Api/api";
import {
  Skeleton,
  Box,
  Button,
  TextField,
  Avatar,
} from "@mui/material";
import notification from "../../../assets/notifications.svg";

const NotificationSettings = () => {
  // const dispatch = useDispatch();

  // Get notifications state from Redux store
  // const { notifications, loading, error } = useSelector(
  //   (state) => state.notification
  // );

  // Fetch notifications on component mount
  // useEffect(() => {
  //   dispatch(fetchNotifications());
  // }, [dispatch]);

  const handleToggle = (id) => {
    console.log(`Toggled notification with id: ${id}`);
    // Logic to update the state or dispatch another action
  };

  return (
    <>
      <Box className="p-6 min-h-screen w-full">
        {/* Notifications List */}
        {/* {loading ? ( */}
          <Box className="space-y-4">
            {[1, 2, 3].map((_, index) => (
              <Box key={index} className="flex items-center space-x-3">
                <Skeleton variant="circular" width={40} height={40} />
                <Box className="flex-1 space-y-2">
                  <Skeleton variant="text" width="60%" />
                  <Skeleton variant="text" width="40%" />
                </Box>
                <Skeleton variant="rectangular" width={40} height={24} />
              </Box>
            ))}
          </Box>
        {/* ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <Box className="rounded-lg p-4 space-y-4">
            {notifications.data?.map((notification) => (
              <Box
                key={notification.id}
                className="flex items-center bg-white space-x-3 justify-between p-3"
              >
                <Box className="flex items-center gap-4">
                  <img src={edit} className="" alt="Edit Icon" />
                  <Box>
                    <p className="text-black font-medium">
                      {notification.title}
                    </p>
                    <p className="text-lightpurple-light text-sm">
                      {notification.description}
                    </p>
                  </Box>
                </Box>

                <Switch
                  checked={notification.enabled}
                  onChange={() => handleToggle(notification.id)}
                  sx={{
                    "& .MuiSwitch-track": { backgroundColor: "gray" },
                    "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                      backgroundColor: "#1A1A18",
                    },
                    "& .MuiSwitch-switchBase.Mui-checked": {
                      color: "white",
                    },
                    "& .MuiSwitch-switchBase": {
                      color: "white",
                    },
                  }}
                />
              </Box>
            ))}
          </Box>
        )} */}

        {/* Personalized Notifications Section */}
        <Box className="bg-white rounded-lg shadow-md p-4 mt-6 w-full h-[40vh]">
          <Box className="flex items-center gap-4">
            <img
              src={notification}
              className="bg-gray-200 px-3 py-3"
              alt="Notification Icon"
            />
            <Box>
              <p className="text-black-blacknew font-medium">
                Personalized Notifications
              </p>
              <p className="text-lightpurple-light text-sm">
                Lorem Ipsum is simply dummy text of the printing and typesetting
                industry.
              </p>
            </Box>
          </Box>

          {/* Text Area and Send Button */}
          <Box className="mt-4">
            <TextField
              fullWidth
              multiline
              rows={3}
              placeholder="Write your message..."
              className="bg-gray-50 rounded-md"
            />
            <Button
              variant="contained"
              className="mt-3"
              style={{
                float: "right",
                color: "black",
                backgroundColor: "#E9E9E9",
                marginTop: "1rem",
              }}
            >
              Send
            </Button>
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default NotificationSettings;
