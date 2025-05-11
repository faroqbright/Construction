import RolesTable from "./RolesTable";
import UsersTable from "./UsersTable";
import RolePermissions from "../../../utils/RolePermissions";
import BusinessAreas from "../../../pages/BusinessArea/BusinessArea";

const UserTable = () => {
  const hasRoleReadPermission = RolePermissions("RolesManagement", "read");
  const hasUserReadPermission = RolePermissions("UsersManagement", "read");

  return (
    <div>
      {hasRoleReadPermission ? <RolesTable /> : null}
      {hasUserReadPermission ? <UsersTable /> : null}
      <BusinessAreas/>
    </div>
  );
};

export default UserTable;
