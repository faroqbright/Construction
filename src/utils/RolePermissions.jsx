import { useSelector } from 'react-redux';

const RolePermissions = (module, action) => {
  const permissions = useSelector(
    (state) => state?.auth?.userInfo?.role?.permissions
  );
  const Admin = useSelector((state) => state?.auth?.userInfo?.isMain);

  const rolesManagementPermissions = permissions?.filter(
    (perm) => perm?.module === module
  );

  return Admin || rolesManagementPermissions?.some((perm) => perm[action]);
};

export default RolePermissions;