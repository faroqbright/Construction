import { useState, useEffect, useCallback, useRef } from "react";
import {
  Button,
  Pagination,
  PaginationItem,
  Modal,
  Box,
  TextField,
  Typography,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { FaEdit, FaTrash } from "react-icons/fa";
import { RiCloseLine } from "react-icons/ri";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import apiRequest from "../../../utils/apiRequest";
import { removeUserInfo } from "../../../features/auth/authSlice";
import RolePermissions from "../../../utils/RolePermissions";
import { useTranslation } from "react-i18next";
import "../../../utils/i18n";

const ProductionClientList = () => {
  const [openStates, setOpenStates] = useState({});
  const [open, setOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [editData, setEditData] = useState(null);
  const [formData, setFormData] = useState();
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const token = useSelector((state) => state?.auth?.userToken);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const modalRef = useRef(null);
  const [projecto, setProjecto] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleClickOutside = (event) => {
    if (modalRef.current && !modalRef.current.contains(event.target)) {
      setOpenStates({});
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const response = await apiRequest("get", "/clients", {}, token);
      if (response.data && Array.isArray(response.data.data)) {
        setUsers(response.data.data);
        setTotalPages(response.data.totalPages);
      }
    } catch (error) {
      if (error?.response?.status === 401) {
        dispatch(removeUserInfo());
        toast.success(t("You have been logged out."));
        navigate("/login");
      }
    }
  }, [token, dispatch, navigate, page]);

  const handleOpen = (user = null) => {
    setEditData(user);
    if (user) {
      setFormData({
        userName: user.userName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        password: "",
        userType: user.userType,
        companyName: user.companyName,
      });
    } else {
      setFormData({
        userName: "",
        email: "",
        phoneNumber: "",
        password: "",
        userType: "Production",
        companyName: "",
      });
    }
    setOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editData) {
      handleEditSubmit();
    } else {
      handleAdd();
    }
  };

  const handleClose = () => {
    setEditData(null);
    setOpen(false);
  };

  const toggleRow = (index) => {
    setOpenStates((prevState) => ({
      ...prevState,
      [index]: !prevState[index],
    }));
  };

  const handleAdd = async () => {
    if (!formData.userName.trim() || !formData.email.trim()) {
      toast.error(t("All fields are required."));
      return;
    }
    try {
      const response = await apiRequest("post", "/clients", formData, token);

      if (response.data.statusCode === 201) {
        const password = response.data.data.generatedPassword;
        toast.success(
          `${t(response.data.message)} Password: ${password}`
        );
        fetchUsers();
        handleClose();
      } else {
        toast.error(t("Failed to add user."));
      }
    } catch (error) {
      toast.error(t(error.response?.data?.message) || t(error.message));
    }
  };

  const handleDelete = async (userId) => {
    try {
      await apiRequest("delete", `/clients/${userId}`, {}, token);
      toast.success(t("User deleted successfully."));
      fetchUsers();
    } catch (error) {
      toast.error(t("Failed to delete user."));
    }
  };

  const handleEditSubmit = async () => {
    try {
      const updatedData = {
        userName: formData.userName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        userType: formData.userType,
        companyName: formData.companyName,
      };
      await apiRequest("patch", `/clients/${editData._id}`, updatedData, token);

      toast.success(t("User updated successfully."));
      fetchUsers();
      handleClose();
    } catch (error) {
      toast.error(t("Failed to update user."));
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

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

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const hasCLientCreatePermission = RolePermissions(
    "ClientsManagement",
    "create"
  );
  const hasCLientUpdatePermission = RolePermissions(
    "ClientsManagement",
    "update"
  );
  const hasCLientDeletePermission = RolePermissions(
    "ClientsManagement",
    "delete"
  );

  const { t } = useTranslation();

  useEffect(() => {
    const fetchProjecto = async () => {
      setLoading(true);
      try {
        const response = await apiRequest("get", "/companies", {}, token);
        if (response?.data?.statusCode === 200) {
          setProjecto(response?.data?.data || []);
        }
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    fetchProjecto();
  }, [token]);

  return (
    <>
      <div className="mx-5">
        <div className="flex justify-between items-center mb-4 mx-5">
          <h2 className="text-xl font-semibold">
            {t("Production_Clients_List")}
          </h2>
          {hasCLientCreatePermission && (
            <Button
              variant="contained"
              onClick={() => handleOpen(null)}
              sx={{
                backgroundColor: "black",
                color: "white",
                textTransform: "none",
                "&:hover": {
                  backgroundColor: "#333333",
                },
              }}
            >
              + {t("Create_New_Client")}
            </Button>
          )}
        </div>

        <div className="bg-white rounded-lg shadow">
          <table className="min-w-full text-sm text-left border border-gray-200">
            <thead>
              <tr>
                <th className="p-4 border-b"></th>
                <th className="p-4 border-b">{t("User_Name")}</th>
                <th className="p-4 border-b">{t("Email")}</th>
                <th className="p-4 border-b">{t("Company_Name")}</th>
                <th className="p-4 border-b">{t("Role")}</th>
                <th className="p-4 border-b">{t("Status")}</th>
                {(hasCLientUpdatePermission || hasCLientDeletePermission) && (
                  <th className="p-4 border-b">{t("Actions")}</th>
                )}
              </tr>
            </thead>
            <tbody>
              {users
                .filter((user) => user.userType === "Production")
                .map((user, idx) => (
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
                    <td className="p-4">{user.companyName}</td>
                    <td className="p-4">{t(user.userType)}</td>
                    <td className="p-4">
                      <span
                        className={`px-3 py-1 text-xs rounded ${
                          user.status === "Active"
                            ? "bg-green-100 text-green-600"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {t(user.status)}
                      </span>
                    </td>
                    {(hasCLientUpdatePermission ||
                      hasCLientDeletePermission) && (
                      <td className="p-4 relative">
                        <button
                          className="text-3xl"
                          onClick={() => toggleRow(idx)}
                        >
                          ...
                        </button>
                        {openStates[idx] && (
                          <div
                            ref={modalRef}
                            className="absolute p-2 -left-10 w-[130px] mt-2 bg-white shadow-lg z-20 rounded-md"
                            style={{ top: "70%" }}
                          >
                            {hasCLientUpdatePermission && (
                              <Button
                                onClick={() => handleOpen(user)}
                                size="small"
                              >
                                <FaEdit className="text-black-blacknew" />
                                <span className="mx-3 items-center flex text-black-blacknew">
                                  {t("Edit")}
                                </span>
                              </Button>
                            )}
                            {hasCLientDeletePermission && (
                              <Button
                                onClick={() => handleDelete(user._id)}
                                className="text-red-500"
                                size="small"
                              >
                                <FaTrash className="text-black-blacknew" />
                                <span className="mx-2 items-center flex text-black-blacknew">
                                  {t("Delete")}
                                </span>
                              </Button>
                            )}
                          </div>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end mt-4">
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
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

      <Modal open={open} onClose={handleClose}>
        <Box sx={modalStyles}>
          <div className="flex justify-between items-center mb-4">
            <Typography variant="h6">
              {editData ? t("Edit_Client") : t("Add_New_Client")}
            </Typography>
            <IconButton onClick={handleClose}>
              <RiCloseLine />
            </IconButton>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <TextField
              label={t("Name")}
              variant="outlined"
              fullWidth
              placeholder={t("Enter_User_Name")}
              value={formData?.userName}
              onChange={(e) =>
                setFormData({ ...formData, userName: e.target.value })
              }
            />
            <TextField
              label={t("Email")}
              variant="outlined"
              fullWidth
              placeholder={t("Enter_User_Email")}
              value={formData?.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />

            <FormControl fullWidth variant="outlined">
              <InputLabel>{t("Choose_User_Type")}</InputLabel>
              <Select
                value={formData?.userType || ""}
                onChange={(e) =>
                  setFormData({ ...formData, userType: e.target.value })
                }
                label={t("Choose_User_Type")}
              >
                <MenuItem value="Production">{t("Production")}</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth variant="outlined">
              <InputLabel>{t("Choose_Company")}</InputLabel>
              <Select
                value={formData?.companyName || ""}
                onChange={(e) =>
                  setFormData({ ...formData, companyName: e.target.value })
                }
                label={t("Choose_Company")}
              >
                {loading ? (
                  <MenuItem disabled>{t("Loading...")}</MenuItem>
                ) : (
                  projecto.map((project) => (
                    <MenuItem key={project._id} value={project.name}>
                      {project.name}
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>

            <div className="flex justify-end space-x-2">
              <Button
                variant="contained"
                type="submit"
                sx={{
                  backgroundColor: "black",
                  color: "white",
                  textTransform: "none",
                  "&:hover": { backgroundColor: "#333333" },
                }}
              >
                {editData ? t("Update") : t("Save")}
              </Button>
              <Button
                sx={{
                  backgroundColor: "#E9E9E9",
                  color: "black",
                }}
                onClick={handleClose}
              >
                {t("Close")}
              </Button>
            </div>
          </form>
        </Box>
      </Modal>
    </>
  );
};

export default ProductionClientList;