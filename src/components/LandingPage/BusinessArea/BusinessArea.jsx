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
  Autocomplete
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
  const [formData, setFormData] = useState({
    businessArea: "",
    role: "",
  });
  const [page, setPage] = useState(1);
  const [roles, setRoles] = useState([]);
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

  const fetchRoles = useCallback(async () => {
    try {
      const response = await apiRequest("get", `/roles`, {}, token);
      if (response.data && Array.isArray(response.data.data)) {
        setRoles(response.data.data);
      }
    } catch (error) {
    }
  }, [token]);

  const fetchBusinessAreas = useCallback(async () => {
    try {
      const response = await apiRequest("get", `/businessArea`, {}, token);
      if (response.data && Array.isArray(response.data.data)) {
        setBusinessAreas(response.data.data.reverse());
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

  const handleOpen = async (businessArea = null) => {
    setEditData(businessArea);

    if (businessArea) {
      setFormData({
        businessArea: businessArea.businessArea,
        role: businessArea.role?._id || "",
      });
    } else {
      setFormData({
        businessArea: "",
        role: "",
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
    if (!formData.businessArea.trim() || !formData.role.trim()) {
      toast.error(t("All fields are required."));
      return;
    }
    try {

      const payload = {
        businessArea: formData.businessArea,
        role: formData.role,
      };

      const response = await apiRequest(
        "post",
        `/businessArea`,
        payload,
        token
      );

      if (response.status === 200 || response.status === 201) {
        toast.success(t(response.data.message));
        fetchBusinessAreas();
        handleClose();
      } else {
        toast.error(t("Failed to add business area."));
      }
    } catch (error) {
      toast.error(t(error.response?.data?.message) || t(error.message));
    }
  };

  const handleDelete = async (businessAreaId) => {
    try {
      await apiRequest("delete", `/businessArea/${businessAreaId}`, {}, token);
      toast.success(t("Business area deleted successfully."));
      fetchBusinessAreas();
    } catch (error) {
      toast.error(t("Failed to delete business area."));
    }
  };

  const handleEditSubmit = async () => {
    try {
      const updatedData = {
        businessArea: formData.businessArea,
        role: formData.role,
      };

      await apiRequest(
        "patch",
        `/businessArea/${editData._id}`,
        updatedData,
        token
      );

      toast.success(t("Business area updated successfully."));
      fetchBusinessAreas();
      handleClose();
    } catch (error) {
      toast.error(t("Failed to update business area."));
    }
  };

  useEffect(() => {
    fetchRoles();
    fetchBusinessAreas();
  }, [fetchBusinessAreas, fetchRoles]);

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
      <div className="mx-5 mt-8">
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
                  {/* <Checkbox /> */}
                </th>
                <th className="p-4 border-b">{t("Business_Area")}</th>
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
                    {/* <Checkbox /> */}
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
            <Autocomplete
              options={roles}
              getOptionLabel={(option) => option.roleName}
              value={roles.find((role) => role._id === formData.role) || null}
              onChange={(event, newValue) =>
                setFormData({ ...formData, role: newValue?._id || "" })
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={t("Role")}
                  variant="outlined"
                  fullWidth
                  required
                />
              )}
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
