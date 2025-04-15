import React, { useState, useEffect, useCallback, useRef } from "react";
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

const BusinessAreaTable = () => {
  const [openStates, setOpenStates] = useState({});
  const [open, setOpen] = useState(false);
  const [businessAreas, setBusinessAreas] = useState([]);
  const [editData, setEditData] = useState(null);
  const [roles, setRoles] = useState([]);
  const [projects, setProjects] = useState([]);
  const [formData, setFormData] = useState({
    businessArea: "",
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const token = useSelector((state) => state?.auth?.userToken);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const modalRef = useRef(null);

  const _id = useSelector((state) => state?.auth?.userInfo?._id);

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

  const fetchBusinessAreas = useCallback(async () => {
    try {
      const response = await apiRequest("get", `/businessArea`, {}, token);
      if (response.data && Array.isArray(response.data.data)) {
        setBusinessAreas(response.data.data);
        setTotalPages(response.data.totalPages);
      }
    } catch (error) {
      if (error?.response?.status === 401) {
        dispatch(removeUserInfo());
        toast.success("You have been logged out.");
        navigate("/login");
      } else {
        console.error("Error:", error);
      }
    }
  }, [token, dispatch, navigate, page]);

  const handleOpen = async (businessArea = null) => {
    setEditData(businessArea);

    if (businessArea) {
      setFormData({
        businessArea: businessArea.businessArea,
      });
    } else {
      setFormData({
        businessArea: "",
      });
    }

    await fetchRoles();
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
      !formData.businessArea.trim()
    ) {
      toast.error("All fields are required.");
      return;
    }
    try {
      if (!token) {
        throw new Error("No token found");
      }

      const payload = {
        businessArea: formData.businessArea,
      };

      const response = await apiRequest(
        "post",
        `/businessArea`,
        payload,
        token
      );

      if (response.status === 200 || response.status === 201) {
        toast.success(response.data.message);
        fetchBusinessAreas();
        handleClose();
      } else {
        toast.error("Failed to add business area.");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Something went wrong. Please try again."
      );
      console.error("Error:", error);
    }
  };

  const handleDelete = async (businessAreaId) => {
    try {
      await apiRequest("delete", `/businessArea/${businessAreaId}`, {}, token);
      toast.success("Business area deleted successfully.");
      fetchBusinessAreas();
    } catch (error) {
      toast.error("Failed to delete business area.");
      console.error("Error:", error);
    }
  };

  const handleEditSubmit = async () => {
    try {
      const updatedData = {
        businessArea: formData.businessArea,
      };

      await apiRequest(
        "patch",
        `/businessArea/${editData._id}`,
        updatedData,
        token
      );

      toast.success("Business area updated successfully.");
      fetchBusinessAreas();
      handleClose();
    } catch (error) {
      toast.error("Failed to update business area.");
      console.error("Error:", error);
    }
  };

  useEffect(() => {
    fetchBusinessAreas();
  }, [fetchBusinessAreas]);

  const fetchRoles = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiRequest("get", "/rolesUser", {}, token);
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
        toast.success("You have been logged out.");
        navigate("/login");
      } else {
        console.error("Error:", error);
      }
    } finally {
      setLoading(false);
    }
  }, [token]);

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

  const hasCreatePermission = RolePermissions(
    "BusinessAreaManagement",
    "create"
  );
  const hasUpdatePermission = RolePermissions(
    "BusinessAreaManagement",
    "update"
  );
  const hasDeletePermission = RolePermissions(
    "BusinessAreaManagement",
    "delete"
  );

  const { t } = useTranslation();

  return (
    <>
      <div className="mx-5">
        <div className="flex justify-between mb-4 mx-5">
          <h2 className="text-xl font-semibold">{t("Business_Areas")}</h2>
          {hasCreatePermission && (
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
              + {t("Create_New_Business_Area")}
            </Button>
          )}
        </div>

        <div className="bg-white rounded-lg shadow">
          <table className="min-w-full text-sm text-left border border-gray-200">
            <thead>
              <tr>
                <th className="p-4 border-b">
                  <Checkbox />
                </th>
                <th className="p-4 border-b">{t("Business_Area_Name")}</th>
                <th className="p-4 border-b">{t("Created_At")}</th>
                {(hasUpdatePermission || hasDeletePermission) && (
                  <th className="p-4 border-b">{t("Actions")}</th>
                )}
              </tr>
            </thead>
            <tbody>
              {businessAreas.map((businessArea, idx) => (
                <tr key={businessArea._id} className="hover:bg-gray-50">
                  <td className="p-4">
                    <Checkbox />
                  </td>
                  <td className="p-4">{businessArea.businessArea}</td>
                  <td className="p-4">
                    {new Date(businessArea.createdAt).toLocaleDateString()}
                  </td>
                  {(hasUpdatePermission || hasDeletePermission) && (
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
                          {hasUpdatePermission && (
                            <Button
                              onClick={() => handleOpen(businessArea)}
                              size="small"
                            >
                              <FaEdit className="text-black-blacknew" />
                              <span className="mx-3 items-center flex text-black-blacknew">
                                {t("Edit")}
                              </span>
                            </Button>
                          )}
                          {hasDeletePermission && (
                            <Button
                              onClick={() => handleDelete(businessArea._id)}
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
              {editData ? t("Edit_Business_Area") : t("Add_Business_Area")}
            </Typography>
            <IconButton onClick={handleClose}>
              <RiCloseLine />
            </IconButton>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <TextField
              label={t("Business_Area_Name")}
              variant="outlined"
              fullWidth
              placeholder={t("Business_Area_Name")}
              value={formData?.businessArea}
              onChange={(e) =>
                setFormData({ ...formData, businessArea: e.target.value })
              }
              required
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

export default BusinessAreaTable;
