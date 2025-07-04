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

export default function Finance() {
  const [openStates, setOpenStates] = useState({});
  const [open, setOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [editData, setEditData] = useState(null);
  const [formData, setFormData] = useState({
    projName: "",
    reference: "",
    fileName: "",
    file: null,
  });
  const [page, setPage] = useState(1);
  const [projecto, setProjecto] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
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
      const response = await apiRequest("get", "/finance", {}, token);
      if (response.status === 200) {
        setUsers(response.data);
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
        projName: user.projName,
        reference: user.reference,
        fileName: user.fileName,
        file: user.file,
      });
      setSelectedProject(user.projName);
      setSelectedFile(user.file);
    } else {
      setFormData({
        projName: "",
        reference: "",
        fileName: "",
        file: null,
      });
      setSelectedProject("");
      setSelectedFile(null);
    }
    setOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleEditSubmit();
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

  const handleDelete = async (userId) => {
    try {
      await apiRequest("delete", `/finance/${userId}`, {}, token);
      toast.success(t("Invoice deleted successfully."));
      fetchUsers();
    } catch (error) {
      toast.error(t("Failed to delete invoice."));
    }
  };

  useEffect(() => {
    const fetchProjecto = async () => {
      setLoading(true);
      try {
        const response = await apiRequest("get", "/projects", {}, token);
        if (response?.data?.statusCode === 200) {
          setProjecto(response?.data?.data?.projects || []);
        }
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    fetchProjecto();
  }, [token]);

  const handleEditSubmit = async () => {
    try {
      const formDataPayload = new FormData();

      if (selectedFile) {
        formDataPayload.append("file", selectedFile);
      }

      formDataPayload.append("projName", selectedProject);
      formDataPayload.append("reference", formData.reference || "");
      formDataPayload.append("fileName", formData.fileName || "");

      await apiRequest(
        "patch",
        `/finance/${editData._id}`,
        formDataPayload,
        token,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      toast.success(t("Invoice updated successfully."));
      fetchUsers();
      handleClose();
    } catch (error) {
      toast.error(t("Failed to update Invoice."));
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const hasCLientCreatePermission = RolePermissions(
    "FinanceManagement",
    "create"
  );
  const hasCLientUpdatePermission = RolePermissions(
    "FinanceManagement",
    "update"
  );
  const hasCLientDeletePermission = RolePermissions(
    "FinanceManagement",
    "delete"
  );

  const { t } = useTranslation();

  return (
    <>
      <div className="mx-5">
        <div className="flex justify-between items-center mb-4 mx-5">
          <h2 className="text-xl font-semibold">{t("Invoices")}</h2>
          {hasCLientCreatePermission && (
            <Button
              variant="contained"
              onClick={() => navigate("/SubmitFinance")}
              sx={{
                backgroundColor: "black",
                color: "white",
                textTransform: "none",
                "&:hover": {
                  backgroundColor: "#333333",
                },
              }}
            >
              + {t("Upload_Invoice")}
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
                <th className="p-4 border-b">{t("Project_Name")}</th>
                <th className="p-4 border-b">{t("Reference")}</th>
                <th className="p-4 border-b">{t("Invoice_Name")}</th>
                <th className="p-4 border-b">{t("Uploaded_By")}</th>
                <th className="p-4 border-b">{t("Date")}</th>
                <th className="p-4 border-b">{t("Actions")}</th>
                {(hasCLientUpdatePermission || hasCLientDeletePermission) && (
                  <th className="p-4 border-b">{t("")}</th>
                )}
              </tr>
            </thead>
            <tbody>
              {Array.isArray(users)
                ? users.map((user, idx) => (
                    <tr key={user._id} className="hover:bg-gray-50">
                      <td className="p-4">
                        {/* <Checkbox /> */}
                      </td>
                      <td className="p-4">
                        {user.projName
                          .split(" ")
                          .map(
                            (word) =>
                              word.charAt(0).toUpperCase() + word.slice(1)
                          )
                          .join(" ")}
                      </td>{" "}
                      <td className="p-4 text-center">
                        {user.reference ? user.reference : "-"}
                      </td>
                      <td className="p-4">
                        {user?.fileName?.split(" ")
                          .map(
                            (word) =>
                              word.charAt(0).toUpperCase() + word.slice(1)
                          )
                          .join(" ")}
                      </td>
                      <td className="p-4">
                        {user.user
                          .split(" ")
                          .map(
                            (word) =>
                              word.charAt(0).toUpperCase() + word.slice(1)
                          )
                          .join(" ")}
                      </td>
                      <td className="p-4">
                        {new Date(user.uploadedAt).toLocaleDateString()}
                      </td>
                      <td className="p-4 relative">
                        <button
                          className="flex items-center justify-center px-10 py-2 bg-[#F5FFE8] border-2 border-[#0ECB0A]  text-[#0ECB0A] rounded-full transition-all duration-300"
                          onClick={() => {
                            const link = document.createElement("a");
                            link.href = user.fileUrl;
                            link.setAttribute(
                              "download",
                              user.fileUrl.split("/").pop()
                            );
                            link.setAttribute("target", "_blank");
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                          }}
                        >
                          {t("View")}
                        </button>
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
                  ))
                : null}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end mt-4">
          <Pagination
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
            <Typography className="font-semibold text-lg">
              {t("Document_Details")}
            </Typography>
            <IconButton onClick={handleClose}>
              <RiCloseLine />
            </IconButton>
          </div>

          <select
            className="border border-gray-300 rounded-md p-2 w-full focus:ring-2 focus:ring-blue-500"
            value={selectedProject}
            onChange={(e) => {
              setSelectedProject(e.target.value);
              setFormData((prev) => ({ ...prev, projName: e.target.value }));
            }}
          >
            <option value="">{t("Select_a_project")}</option>
            {loading ? (
              <option>Loading...</option>
            ) : (
              projecto.map((project) => (
                <option key={project._id} value={project.projectName}>
                  {project.projectName}{" "}
                </option>
              ))
            )}
          </select>

          <form className="space-y-4 mt-4" onSubmit={handleSubmit}>
            <div className="flex justify-between items-center border border-gray-300 rounded-md p-2">
              <Typography className="text-gray-700">
                {selectedFile
                  ? selectedFile.name
                  : editData?.fileName || "No file selected"}
              </Typography>
              <button
                type="button"
                className="bg-[#F9F9F9] text-[#1A1A18] text-[14px] font-[500] border px-4 py-2 rounded-md"
                onClick={() => document.getElementById("fileInput").click()}
              >
                {t("Upload_Files")}
              </button>
              <input
                type="file"
                id="fileInput"
                accept="application/pdf"
                style={{ display: "none" }}
                onChange={(e) => {
                  const file = e.target.files[0];
                  setSelectedFile(file);
                  setFormData((prev) => ({ ...prev, file }));
                }}
              />
            </div>

            <TextField
              label="Reference"
              value={formData.reference}
              onChange={(e) =>
                setFormData({ ...formData, reference: e.target.value })
              }
              fullWidth
              margin="normal"
            />

            <TextField
              label="fileName"
              value={formData.fileName}
              onChange={(e) =>
                setFormData({ ...formData, fileName: e.target.value })
              }
              fullWidth
              margin="normal"
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
                  "&:hover": { backgroundColor: "#d1d1d1" },
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
}

const modalStyles = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
};
