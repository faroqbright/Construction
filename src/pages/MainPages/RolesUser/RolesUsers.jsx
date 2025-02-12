import React from "react";
import UserTable from "../../../components/LandingPage/RolesUsers/UserTable";

const RolesUsers = () => {
  return (
    <div className="flex flex-col lg:flex-row gap-4">
      <div className="w-full">
        <UserTable />
      </div>
    </div>
  );
};

export default RolesUsers;
