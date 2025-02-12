import React from "react";
import RolesTable from "./RolesTable";
import UsersTable from "./UsersTable";
import RolePermissions from "../../../utils/RolePermissions";

const UserTable = () => {
  const hasRoleReadPermission = RolePermissions("RolesManagement", "read");
  const hasUserReadPermission = RolePermissions("UsersManagement", "read");

  return (
    <div>
      {hasRoleReadPermission ? (
      <RolesTable />
      ): null}
      {hasUserReadPermission ? (
      <UsersTable />
      ): null}
    </div>
  );
};

export default UserTable;
