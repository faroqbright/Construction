import React from "react";
import NotificationSettings from "../../../components/LandingPage/Notifications/NotificationsSettings";

const Notifications = () => {
  return (
    <div className="flex flex-col lg:flex-row gap-4">
      <div className="w-full">
        <NotificationSettings />
      </div>
    </div>
  );
};

export default Notifications;
