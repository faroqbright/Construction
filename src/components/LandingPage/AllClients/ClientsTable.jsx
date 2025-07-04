import { useState, useEffect, useCallback, useRef } from "react";
import {
  Button,
  Checkbox,
  Pagination,
  PaginationItem,
  Modal,
  Box,
  TextField,
  Typography,
  IconButton,
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

const ClientsTable = () => {
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
      const response = await apiRequest("get", "/companies", {}, token);
      console.log(response);
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
        name: user.name,
        email: user.email,
        number: user.number, 
      });
    } else {
      setFormData({
        name: "",
        email: "",
        number: "",
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
    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.number.trim()
    ) {
      toast.error(t("All fields are required."));
      return;
    }
    try {
      const response = await apiRequest(
        "post",
        "/companies",
        formData,
        token
      );

      if (response.data.statusCode === 201) {
        toast.success(t(response.data.message));
        fetchUsers();
        handleClose();
      }
    } catch (error) {
      toast.error(t(error.response?.data?.message) || t(error.message));
    }
  };

  const handleDelete = async (userId) => {
    try {
      await apiRequest("delete", `/companies/${userId}`, {}, token);
      toast.success(t("Company deleted successfully."));
      fetchUsers();
    } catch (error) {
    }
  };

  const handleEditSubmit = async () => {
    try {
      const updatedData = {
        name: formData.name,
        email: formData.email,
        number: formData.number,
      };
      await apiRequest("patch", `/companies/${editData._id}`, updatedData, token);

      toast.success(t("Company updated successfully"));
      fetchUsers();
      handleClose();
    } catch (error) {
      console.error("Error:", error);
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
    "CompanyManagement",
    "create"
  );
  const hasCLientUpdatePermission = RolePermissions(
    "CompanyManagement",
    "update"
  );
  const hasCLientDeletePermission = RolePermissions(
    "CompanyManagement",
    "delete"
  );

  const { t } = useTranslation();

  return (
    <>
      <div className="mx-5">
        <div className="flex justify-between items-center mb-4 mx-5">
          <h2 className="text-xl font-semibold">{t("All_Companies")}</h2>
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
              + {t("Create_New_Company")}
            </Button>
          )}
        </div>

        <div className="bg-white rounded-lg shadow">
          <table className="min-w-full text-sm text-left border border-gray-200">
            <thead>
              <tr>
                <th className="p-4 border-b">
                  {/* <Checkbox /> */}
                </th>
                
                <th className="p-4 border-b">{t("Company_Name")}</th>
                <th className="p-4 border-b">{t("Email")}</th>
              <th className="p-4 border-b">{t("Phone_Number")}</th>
                <th className="p-4 border-b">{t("Join_Date")}</th>
              <th className="p-4 border-b">{t("Status")}</th>
                {(hasCLientUpdatePermission || hasCLientDeletePermission) && (
                  <th className="p-4 border-b">{t("Actions")}</th>
                )}
              </tr>
            </thead>
            <tbody>
              {users.map((user, idx) => (
                <tr key={user._id} className="hover:bg-gray-50">
                  <td className="p-4">
                    {/* <Checkbox /> */}
                  </td>
                  <td className="p-4">{user.name}</td>
                  <td className="p-4">{user.email}</td>
                  <td className="p-4">{user.number}</td>
                  <td className="p-4">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-3 py-1 text-xs rounded ${
                        user.status === "active"
                          ? "bg-green-100 text-green-600"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {user.status}
                    </span>
                  </td>
                  {(hasCLientUpdatePermission || hasCLientDeletePermission) && (
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
                  previous: () => <span>{t("Previous")}</span>,
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
              {editData ? t("Edit_Client") : t("Add_New_Company")}
            </Typography>
            <IconButton onClick={handleClose}>
              <RiCloseLine />
            </IconButton>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <TextField
              label={t("Company_Name")}
              variant="outlined"
              fullWidth
              placeholder={t("Enter_Company_Name")}
              value={formData?.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
            <TextField
              label={t("Company_Email")}
              variant="outlined"
              fullWidth
              placeholder={t("Enter_Company_Email")}
              value={formData?.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
            <TextField
              label={t("Company_Phone_Number")}
              variant="outlined"
              fullWidth
              placeholder={t("Enter_Company_Phone_Number")}
              value={formData?.number}
              onChange={(e) =>
                setFormData({ ...formData, number: e.target.value })
              }
            />

            

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

export default ClientsTable;
