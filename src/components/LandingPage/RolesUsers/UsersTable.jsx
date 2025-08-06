import { useState, useEffect, useCallback, useRef } from "react";
import {
  Button,
  Modal,
  Box,
  TextField,
  Typography,
  IconButton,
  Pagination,
  PaginationItem,
  Autocomplete,
} from "@mui/material";
import { FaEdit, FaTrash } from "react-icons/fa";
import { RiCloseLine } from "react-icons/ri";
import { toast } from "react-toastify";
import apiRequest from "../../../utils/apiRequest";
import { useSelector } from "react-redux";
import RolePermissions from "../../../utils/RolePermissions";
import { useTranslation } from "react-i18next";
import "../../../utils/i18n";
import { useSideBar } from "../../../utils/RoleContext";

export default function UsersTable() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openUser, setOpenUser] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openStates, setOpenStates] = useState(false);
  const [currentUser, setCurrentUser] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);
  const [roleSearchTerm, setRoleSearchTerm] = useState("");
  const [roleSearchTermEdit, setRoleSearchTermEdit] = useState("");
  const modalRef = useRef(null);
  const { clickedItem, setClickedItem } = useSideBar();

  const hasCreatePermission = RolePermissions("UsersManagement", "create");
  const hasDeletePermission = RolePermissions("UsersManagement", "delete");
  const hasUpdatePermission = RolePermissions("UsersManagement", "update");

  const token = useSelector((state) => state.auth.userToken);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiRequest("get", "/rolesUser", {}, token);
      if (response.data && response.data.data) {
        setUsers(response.data.data);
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  }, [token]);

  const fetchRoles = useCallback(async () => {
    try {
      const response = await apiRequest("get", "/roles", {}, token);
      if (response.data) {
        setRoles(response.data.data);
      }
    } catch (error) {}
  }, [token]);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  useEffect(() => {
    if (clickedItem) {
      fetchRoles();
      setClickedItem(null);
    }
  }, [clickedItem, setClickedItem, fetchRoles]);

  const addUser = async (user) => {
    try {
      const response = await apiRequest("post", "/rolesUser", user, token);
      if (response.data.statusCode === 201) {
        const password = response.data.data.generatedPassword;
        toast.success(
          `${t(response.data.message)} Password: ${password}`
        );
        fetchUsers();
        setOpenUser(false);
        setRoleSearchTerm("");
      }
    } catch (error) {
      toast.error(t(error.response?.data?.message));
    }
  };

  const fetchUserById = async (userId) => {
    setOpenStates(false);
    try {
      const response = await apiRequest(
        "get",
        `/rolesUser/${userId}`,
        {},
        token
      );
      if (response.status === 200 && response.data) {
        setCurrentUser({
          userName: response.data.data.userName,
          _id: response.data.data._id,
          phoneNumber: response.data.data.phoneNumber,
          email: response.data.data.email,
          role: response.data.data.role?._id,
          status: response.data.data.status,
        });
        setRoleSearchTermEdit(response.data.data.role?.roleName || "");
        setOpenEdit(true);
      }
    } catch (error) {}
  };

  const editUser = async (userId, updatedUser) => {
    try {
      const response = await apiRequest(
        "patch",
        `/rolesUser/${userId}`,
        updatedUser,
        token
      );
      if (response.status === 200) {
        toast.success(t("User updated successfully."));
        fetchUsers();
        setOpenEdit(false);
        setOpenStates(null);
        setRoleSearchTermEdit("");
      }
    } catch (error) {
      toast.error(t(error.response?.data?.message));
    }
  };

  const deleteUser = async (userId) => {
    setOpenStates(null);
    try {
      const response = await apiRequest(
        "delete",
        `/rolesUser/${userId}`,
        {},
        token
      );
      if (response.status === 200) {
        toast.success(t("User deleted successfully."));
        fetchUsers();
      }
    } catch (error) {}
  };

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const toggleRow = (idx) => {
    if (!openEdit) {
      setOpenStates((prevOpenState) => (prevOpenState === idx ? null : idx));
    }
  };

  const handleClickOutside = (event) => {
    if (modalRef.current && !modalRef.current.contains(event.target)) {
      setOpenStates(null);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleOpenUser = () => setOpenUser(true);
  const handleCloseUser = () => {
    setOpenUser(false);
    setRoleSearchTerm("");
  };

  const handleCloseEdit = () => {
    setOpenEdit(false);
    setRoleSearchTermEdit("");
  };

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);

  const paginate = (event, value) => {
    setCurrentPage(value);
  };

  const { t } = useTranslation();

  const filteredRoles = roles.filter((role) =>
    role.roleName.toLowerCase().includes(roleSearchTerm.toLowerCase())
  );

  const filteredRolesEdit = roles.filter((role) =>
    role.roleName.toLowerCase().includes(roleSearchTermEdit.toLowerCase())
  );

  const modalStyles = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    bgcolor: "background.paper",
    boxShadow: 24,
    borderRadius: "8px",
    p: 4,
    width: "400px",
    maxHeight: "90vh",
    overflow: "auto",
  };

  return (
    <div className="px-4 py-2">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">{t("All_Users")}</h2>
        {hasCreatePermission ? (
          <Button
            variant="contained"
            onClick={handleOpenUser}
            sx={{
              backgroundColor: "black",
              color: "white",
              textTransform: "none",
              "&:hover": {
                backgroundColor: "#333333",
              },
            }}
          >
            + {t("Create_New_User")}
          </Button>
        ) : null}

        <Modal open={openUser} onClose={handleCloseUser}>
          <Box sx={modalStyles}>
            <div className="flex justify-between items-center mb-4">
              <Typography variant="h6">{t("Add_New_User")}</Typography>
              <IconButton onClick={handleCloseUser}>
                <RiCloseLine />
              </IconButton>
            </div>

            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const newUser = {
                  userName: formData.get("userName"),
                  email: formData.get("email"),
                  phoneNumber: formData.get("phoneNumber"),
                  role: currentUser.role,
                  status: t("Active"),
                };
                addUser(newUser);
              }}
            >
              <TextField
                name="userName"
                label={t("Name")}
                variant="outlined"
                fullWidth
                required
              />
              <TextField
                name="email"
                label={t("Email")}
                variant="outlined"
                fullWidth
                required
              />
              <TextField
                name="phoneNumber"
                label={t("Phone_Number_(optional)")}
                variant="outlined"
                fullWidth
              />
              <Autocomplete
                options={filteredRoles}
                getOptionLabel={(option) => option.roleName}
                fullWidth
                onChange={(event, newValue) => {
                  setCurrentUser((prev) => ({
                    ...prev,
                    role: newValue?._id || "",
                  }));
                }}
                inputValue={roleSearchTerm}
                onInputChange={(event, newInputValue) => {
                  setRoleSearchTerm(newInputValue);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    name="role"
                    label={t("Role")}
                    variant="outlined"
                    required
                  />
                )}
              />
              <div className="flex justify-end space-x-2">
                <Button
                  type="submit"
                  variant="contained"
                  sx={{
                    backgroundColor: "black",
                    color: "white",
                    textTransform: "none",
                    "&:hover": { backgroundColor: "#333333" },
                  }}
                >
                  {t("Save")}
                </Button>
                <Button
                  sx={{ backgroundColor: "#E9E9E9", color: "black" }}
                  onClick={handleCloseUser}
                >
                  {t("Close")}
                </Button>
              </div>
            </form>
          </Box>
        </Modal>
      </div>

      <div className="bg-white rounded-lg shadow ">
        <table className="min-w-full text-sm text-left border border-gray-200">
          <thead>
            <tr>
              <th className="p-4 border-b"></th>
              <th className="p-4 border-b">{t("User_Name")}</th>
              <th className="p-4 border-b">{t("Email")}</th>
              <th className="p-4 border-b">{t("Role")}</th>
              <th className="p-4 border-b">{t("Status")}</th>
              {(hasUpdatePermission || hasDeletePermission) && (
                <th className="p-4 border-b">{t("Actions")}</th>
              )}
            </tr>
          </thead>
          <tbody>
            {currentUsers.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-4">
                  {t("No users available.")}
                </td>
              </tr>
            ) : (
              currentUsers.map((user, idx) => (
                <tr key={user._id} className="hover:bg-gray-50">
                  <td className="p-4"></td>
                  <td className="p-4">
                    {user.userName
                      .split(" ")
                      .map(
                        (word) => word.charAt(0).toUpperCase() + word.slice(1)
                      )
                      .join(" ")}
                  </td>
                  <td className="p-4">{user.email}</td>
                  <td className="p-4">{user?.role?.roleName || "null"}</td>
                  <td className="p-4">
                    <span
                      className={`px-3 py-1 text-xs rounded ${
                        user?.status === "Active" || user?.status === "Activo"
                          ? "bg-green-100 text-green-600"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {t(user?.status) || "null"}
                    </span>
                  </td>
                  {(hasUpdatePermission || hasDeletePermission) && (
                    <td className="p-4 relative">
                      <button
                        className="text-3xl"
                        onClick={() => toggleRow(idx)}
                      >
                        ...
                      </button>
                      {openStates === idx && (
                        <div
                          ref={modalRef}
                          style={{
                            bottom: `${
                              hasUpdatePermission || hasDeletePermission
                                ? "calc(100% - 120px)"
                                : "calc(100% - 110px)"
                            }`,
                          }}
                          className="absolute -left-12 w-[150px] mt-2 bg-white shadow-lg z-20 rounded-md"
                        >
                          {hasUpdatePermission ? (
                            <Button
                              onClick={() => fetchUserById(user._id)}
                              className="flex items-center gap-2 py-3 w-full"
                              size="small"
                            >
                              <FaEdit className="text-black-blacknew p-1 mr-2 text-2xl" />
                              <span className=" text-black-blacknew mr-1">
                                {t("Edit")}
                              </span>
                            </Button>
                          ) : null}
                          {hasDeletePermission ? (
                            <Button
                              onClick={() => deleteUser(user._id)}
                              className="flex items-center gap-2 text-red-500 w-full p-2"
                              size="small"
                            >
                              <FaTrash className="text-black-blacknew p-1 text-2xl" />
                              <span className=" text-black-blacknew">
                                {t("Delete")}
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

      <Modal open={openEdit} onClose={handleCloseEdit}>
        <Box sx={modalStyles}>
          <div className="flex justify-between items-center mb-4">
            <Typography variant="h6">Edit User</Typography>
            <IconButton onClick={handleCloseEdit}>
              <RiCloseLine />
            </IconButton>
          </div>

          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const updatedUser = {
                userName: formData.get("userName"),
                email: formData.get("email"),
                phoneNumber: formData.get("phoneNumber"),
                role: currentUser.role,
                status: formData.get("status"),
              };
              editUser(currentUser._id, updatedUser);
            }}
          >
            <TextField
              name="userName"
              label={t("Name")}
              variant="outlined"
              fullWidth
              required
              value={currentUser.userName || ""}
              onChange={(e) =>
                setCurrentUser((prev) => ({
                  ...prev,
                  userName: e.target.value,
                }))
              }
            />
            <TextField
              name="email"
              label={t("Email")}
              variant="outlined"
              fullWidth
              required
              value={currentUser.email || ""}
              onChange={(e) =>
                setCurrentUser((prev) => ({ ...prev, email: e.target.value }))
              }
            />
            <TextField
              name="phoneNumber"
              label={t("Phone_Number")}
              variant="outlined"
              fullWidth
              value={currentUser.phoneNumber || ""}
              onChange={(e) =>
                setCurrentUser((prev) => ({
                  ...prev,
                  phoneNumber: e.target.value,
                }))
              }
            />
            <Autocomplete
              options={filteredRolesEdit}
              getOptionLabel={(option) => option.roleName}
              fullWidth
              value={
                roles.find((role) => role._id === currentUser.role) || null
              }
              onChange={(event, newValue) => {
                setCurrentUser((prev) => ({
                  ...prev,
                  role: newValue?._id || "",
                }));
              }}
              inputValue={roleSearchTermEdit}
              onInputChange={(event, newInputValue) => {
                setRoleSearchTermEdit(newInputValue);
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  name="role"
                  label={t("Role")}
                  variant="outlined"
                  required
                />
              )}
            />
            <div className="flex justify-end space-x-2">
              <Button
                type="submit"
                variant="contained"
                sx={{
                  backgroundColor: "black",
                  color: "white",
                  textTransform: "none",
                  "&:hover": { backgroundColor: "#333333" },
                }}
              >
                {t("Save")}
              </Button>
              <Button
                sx={{ backgroundColor: "#E9E9E9", color: "black" }}
                onClick={handleCloseEdit}
              >
                {t("Close")}
              </Button>
            </div>
          </form>
        </Box>
      </Modal>

      <div className="flex justify-end mt-4">
        <Pagination
          count={Math.ceil(users.length / usersPerPage)}
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
    </div>
  );
}