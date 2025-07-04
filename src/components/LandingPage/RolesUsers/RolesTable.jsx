import { useState, useEffect, useCallback, useRef } from "react";
import {
  Button,
  Checkbox,
  Modal,
  Box,
  TextField,
  MenuItem,
  Pagination,
  PaginationItem,
} from "@mui/material";
import { FaEdit, FaTrash, FaUnlockAlt } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import apiRequest from "../../../utils/apiRequest";
import { toast } from "react-toastify";
import ManageAccessModal from "./ManageAccessModal";
import { useNavigate } from "react-router-dom";
import { removeUserInfo } from "../../../features/auth/authSlice";
import RolePermissions from "../../../utils/RolePermissions";
import { useTranslation } from "react-i18next";
import "../../../utils/i18n";
import { useSideBar } from "../../../utils/RoleContext";

export default function RolesTable() {
  const [loading, setLoading] = useState(true);
  const [opens, setOpens] = useState(false);
  const [roleName, setRoleName] = useState("");
  const [status, setStatus] = useState("Active");
  const [edit, setEdit] = useState(false);
  const [roleEdit, setRoleEdit] = useState("");
  const [roleId, setRoleId] = useState("");
  const [statusEdit, setStatusEdit] = useState("Active");
  const [openRow, setOpenRow] = useState(null);
  const [roles, setRoles] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rolesPerPage] = useState(5);
  const [roleData, setRoleData] = useState(null);
  const token = useSelector((state) => state?.auth?.userToken);
  const [manageAccessOpen, setManageAccessOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const modalRef = useRef(null);
  const { setClickedItem } = useSideBar();

  const hasCreatePermission = RolePermissions("RolesManagement", "create");
  const hasDeletePermission = RolePermissions("RolesManagement", "delete");
  const hasUpdatePermission = RolePermissions("RolesManagement", "update");

  const fetchRoles = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiRequest("get", "/roles", {}, token);
      if (
        response.data &&
        response.data.data &&
        Array.isArray(response.data.data)
      ) {
        setRoles(response.data.data);
      }
    } catch (error) {
      if (error && error?.status === 401) {
        dispatch(removeUserInfo());
        toast.success(t("You have been logged out."));
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  }, [token]);

  const DelChatHistory = async (RoleId) => {
    setOpenRow(null);
    try {
      const response = await apiRequest(
        "delete",
        `/roles/${RoleId}`,
        {},
        token
      );
      if (response.status === 200) {
        fetchRoles();
      }
    } catch (error) {}
  };

  const handleAdd = async () => {
    if (!roleName.trim()) {
      toast.error(t("Role name is required."));
      return;
    }
    try {
      const response = await apiRequest(
        "post",
        "/roles",
        {
          roleName,
          status,
        },
        token
      );

      if (response.data.statusCode === 201) {
        toast.success(t(response.data.message));
        fetchRoles();
        setRoleName("");
        setStatus("Active");
        handleCloses();
        setClickedItem(true);
      }
    } catch (error) {
      toast.error(t(error.response?.data?.message) || t(error.message));
    }
  };

  const handleEdit = async () => {
    if (!roleEdit.trim()) {
      toast.error(t("Role name is required."));
      return;
    }
    try {
      const response = await apiRequest(
        "put",
        `/roles/${roleId}`,
        { roleName: roleEdit, status: statusEdit },
        token
      );
      if (response.status === 200) {
        toast.success(t("Role updated successfully."));
        fetchRoles();
        setEdit(false);
      }
    } catch (error) {
      toast.error(t(error.response?.data?.message) || t(error.message));
    }
  };

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  const handleOpens = () => setOpens(true);
  const handleCloses = () => setOpens(false);
  const handleOpenEdit = (role) => {
    setRoleEdit(role.roleName);
    setRoleId(role._id);
    setStatusEdit(role.status);
    setEdit(true);
    setOpenRow(null);
  };
  const handleCloseEdit = () => setEdit(false);

  const indexOfLastRole = currentPage * rolesPerPage;
  const indexOfFirstRole = indexOfLastRole - rolesPerPage;
  const currentRoles = roles.slice(indexOfFirstRole, indexOfLastRole);

  const paginate = (event, value) => {
    setCurrentPage(value);
  };

  const toggleButton = (idx) => {
    setOpenRow(openRow === idx ? null : idx);
  };

  const handleClickOutside = (event) => {
    if (modalRef.current && !modalRef.current.contains(event.target)) {
      setOpenRow(null);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleManageAccessOpen = async (id) => {
    setRoleId(id);
    setManageAccessOpen(true);
    setOpenRow(null);

    if (!id || !token) {
      return;
    }

    try {
      const response = await apiRequest("get", `/roles/${id}`, {}, token);
      if (response && response.status === 200) {
        setRoleData(response.data.data);
      }
    } catch (error) {
      if (error && error?.status === 401) {
        dispatch(removeUserInfo());
        toast.success(t("You have been logged out."));
        navigate("/login");
      }
    }
  };

  const handleManageAccessClose = () => setManageAccessOpen(false);
  const { t } = useTranslation();

  return (
    <div className="mb-8 px-4 py-2">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">{t("All_Roles")}</h2>
        {hasCreatePermission ? (
          <Button
            onClick={handleOpens}
            variant="contained"
            sx={{
              backgroundColor: "black",
              color: "white",
              textTransform: "none",
              "&:hover": { backgroundColor: "#333333" },
            }}
          >
            + {t("Create_New_Role")}
          </Button>
        ) : null}
      </div>

      <Modal open={opens} onClose={handleCloses}>
        <Box className="bg-white rounded-lg shadow-lg p-6 w-[400px] mx-auto mt-20 font-raleway">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-black-blacknew">
              {t("Add_New_Role")}
            </h2>
            <button
              onClick={handleCloses}
              className="text-black hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          <form>
            <div className="mb-4">
              <TextField
                label={t("Name")}
                placeholder={t("Enter_Role_Name")}
                variant="outlined"
                fullWidth
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
                className="rounded-md"
                size="small"
              />
            </div>
            <div className="mb-4">
              <TextField
                select
                label={t("Status")}
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                fullWidth
                className="rounded-md"
                size="small"
              >
                <MenuItem value="Active">{t("Active")}</MenuItem>
                <MenuItem value="inactive">{t("Inactive")}</MenuItem>
              </TextField>
            </div>
            <div className="flex justify-between items-center">
              <a
                href="#"
                className="text-black-blacknew font-raleway hover:underline text-sm font-medium underline"
              >
                {/* {t("Manage_Access")} */}
              </a>
              <div className="flex justify-end space-x-3">
                <Button
                  onClick={handleAdd}
                  variant="contained"
                  sx={{
                    backgroundColor: "black",
                    color: "white",
                    borderRadius: "0.5rem",
                    paddingX: 4,
                    "&:hover": { backgroundColor: "#333333" },
                  }}
                >
                  {t("Save")}
                </Button>
                <Button
                  sx={{
                    width: "3rem",
                    backgroundColor: "#E9E9E9",
                    color: "black",
                    paddingX: 4,
                  }}
                  onClick={handleCloses}
                  variant="contained"
                >
                  {t("Close")}
                </Button>
              </div>
            </div>
          </form>
        </Box>
      </Modal>

      <Modal open={edit} onClose={handleCloseEdit}>
        <Box
          className="bg-white rounded-lg shadow-lg p-6 w-[400px] mx-auto mt-20 font-raleway"
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-black">
              {t("Edit Role")}
            </h2>

            <button
              onClick={handleCloseEdit}
              className="text-black hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          <form>
            <div className="mb-4">
              <TextField
                label={t("Name")}
                placeholder={t("Enter_Role_Name")}
                variant="outlined"
                fullWidth
                value={roleEdit}
                onChange={(e) => setRoleEdit(e.target.value)}
                className="rounded-md"
                size="small"
              />
            </div>
            <div className="mb-4">
              <TextField
                select
                label={t("Status")}
                value={statusEdit}
                onChange={(e) => setStatusEdit(e.target.value)}
                fullWidth
                className="rounded-md"
                size="small"
              >
                <MenuItem value="Active">{t("Active")}</MenuItem>
                <MenuItem value="inactive">{t("Inactive")}</MenuItem>
              </TextField>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex justify-end space-x-3">
                <Button
                  onClick={handleEdit}
                  variant="contained"
                  sx={{
                    backgroundColor: "black",
                    color: "white",
                    borderRadius: "0.5rem",
                    paddingX: 4,
                    "&:hover": { backgroundColor: "#333333" },
                  }}
                >
                  {t("Update")}
                </Button>
                <Button
                  onClick={handleCloseEdit}
                  variant="contained"
                  sx={{
                    backgroundColor: "#E9E9E9",
                    color: "black",
                  }}
                >
                  {t("Close")}
                </Button>
              </div>
            </div>
          </form>
        </Box>
      </Modal>

      <div className="overflow-visible bg-white rounded-lg shadow">
        <table className="min-w-full text-sm text-left border border-gray-200">
          <thead>
            <tr>
              <th className="p-4 border-b">
                {/* <Checkbox /> */}
              </th>
              <th className="p-4 border-b">{t("Role_Name")}</th>
              <th className="p-4 border-b">{t("Created_By")}</th>
              <th className="p-4 border-b">{t("Created_At")}</th>
              <th className="p-4 border-b">{t("Status")}</th>
              {(hasUpdatePermission || hasDeletePermission) && (
                <th className="p-4 border-b">{t("Actions")}</th>
              )}
            </tr>
          </thead>
          <tbody>
            {currentRoles.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-4">
                  {t("No_Role_Available")}
                </td>
              </tr>
            ) : (
              currentRoles.map((role, idx) => (
                <tr key={role._id} className="hover:bg-gray-50">
                  <th className="p-4">
                    {/* <Checkbox /> */}
                  </th>
                  <td className="p-4">{role.roleName}</td>
                  <td className="p-4">{role.createdBy}</td>
                  <td className="p-4">
                    {new Date(role.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-3 py-1 text-xs rounded ${
                        role.status === "Active"
                          ? "bg-green-100 text-green-600"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {t(role.status)}
                    </span>
                  </td>
                  {(hasUpdatePermission || hasDeletePermission) && (
                    <td className="p-4 relative">
                      <button
                        className="text-3xl"
                        onClick={() => toggleButton(idx)}
                      >
                        ...
                      </button>
                      {openRow === idx && (
                        <div
                          ref={modalRef}
                          style={{
                            bottom: `${
                              hasUpdatePermission || hasDeletePermission
                                ? "calc(100% - 160px)"
                                : "calc(100% - 130px)"
                            }`,
                          }}
                          className="absolute -left-2 w-[150px] mt-2 bg-white shadow-lg z-20 rounded-md"
                        >
                          {hasUpdatePermission ? (
                            <Button
                              onClick={() => handleOpenEdit(role)}
                              className="flex items-center justify-start w-full"
                              size="small"
                            >
                              <FaEdit className="text-black-blacknew p-1 text-2xl" />
                              <span className="ml-3 text-black-blacknew">
                                {t("Edit")}
                              </span>
                            </Button>
                          ) : null}
                          {hasDeletePermission ? (
                            <Button
                              className="text-red-500 flex items-center justify-start w-full"
                              size="small"
                              onClick={() => DelChatHistory(role._id)}
                            >
                              <FaTrash className="text-black-blacknew p-1 text-2xl" />
                              <span className="ml-2 text-black-blacknew">
                                {t("Delete")}
                              </span>
                            </Button>
                          ) : null}
                          {hasUpdatePermission ? (
                            <Button
                              className="flex items-center gap-2 justify-start w-full text-white"
                              onClick={() => handleManageAccessOpen(role._id)}
                            >
                              <FaUnlockAlt className="text-black-blacknew p-1 text-2xl" />
                              <span className="ml-1 text-black-blacknew">
                                {t("Access")}
                              </span>
                            </Button>
                          ) : null}
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end mt-4">
        <Pagination
          count={Math.ceil(roles.length / rolesPerPage)}
          page={currentPage}
          onChange={paginate}
          sx={{
            "& .Mui-selected": {
              backgroundColor: "#FBBA06 !important",
              color: "white",
            },
          }}
          renderItem={(item) => (
            <PaginationItem
              {...item}
              components={{
                previous: () => <span>{t("Previos")}</span>,
                next: () => <span>{t("Next")}</span>,
              }}
              sx={{
                "&.MuiPaginationItem-previous, &.MuiPaginationItem-next": {
                  color: "black",
                  fontWeight: "bold",
                },
              }}
            />
          )}
        />
      </div>

      <ManageAccessModal
        open={manageAccessOpen}
        onClose={handleManageAccessClose}
        roleId={roleId}
        roleData={roleData}
      />
    </div>
  );
}
