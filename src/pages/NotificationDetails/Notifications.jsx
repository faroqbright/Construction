import React from "react";
import NotificationDetails from "../../components/Notifications/NotificationDetails";

const Notifications = () => {
  return (
    <div className="flex flex-col lg:flex-row gap-4">
      <div className="w-full">
        <NotificationDetails />
      </div>
    </div>
  );
};

export default Notifications;
