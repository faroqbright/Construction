import React, { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import apiRequest from "../../../utils/apiRequest";
import { toast } from "react-toastify";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import ChangeLogModal from "../../ChangeLog/ChangeLog";
import { Modal, Box } from "@mui/material";
import "../../../utils/i18n";
import { useTranslation } from "react-i18next";
import { User } from "lucide-react";

export default function EditProject() {
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();
  const token = useSelector((state) => state.auth.userToken);
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const isCreateMode = !id;
  const location = useLocation();
  const isViewMode = location.pathname.startsWith("/details/view");
  const [error, setError] = useState(null);
  const [owners, setOwners] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedClientUsers, setSelectedClientUsers] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [clientMembers, setClientMembers] = useState([]);
  const [initialValues, setInitialValues] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isclientModalOpen, setIsclientModalOpen] = useState(false);
  const [modalTeamMembers, setModalTeamMembers] = useState([]);
  const [modalClientMembers, setModalClientMembers] = useState([]);
  const [logs, setlogs] = useState([]);
  const [isModalOpens, setIsModalOpens] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [FinancialExecution, setFinancialExecution] = useState([]);
  const [fileName, setFileName] = useState([]);

  useEffect(() => {
    if (initialValues?.projectBanner) {
      setSelectedFiles(
        initialValues.projectBanner.map((banner) => ({
          url: banner.url,
        }))
      );
    }
  }, [initialValues]);

  const handleOPenButton = () => {
    setIsModalOpens(true);
  };

  const handleCloseButton = () => {
    setIsModalOpens(false);
  };

  useEffect(() => {
    if (isModalOpen) {
      setModalTeamMembers([...teamMembers]);
    }
  }, [isModalOpen, teamMembers]);

  useEffect(() => {
    if (isclientModalOpen) {
      setModalClientMembers([...clientMembers]);
    }
  }, [isclientModalOpen, clientMembers]);

  const openModal = () => setIsModalOpen(true);
  const openClientModal = () => setIsclientModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  const closeClientModal = () => setIsclientModalOpen(false);

  const fetchProjects = useCallback(async () => {
    if (isCreateMode) return;

    try {
      const response = await apiRequest("get", `/projects/${id}`, {}, token);
      if (response?.data?.statusCode === 200) {
        const data = response?.data?.data;

        const financeResponse = await apiRequest("get", "/finance", {}, token);
        if (financeResponse?.status === 200) {
          const filteredFinanceRecords = financeResponse?.data.filter(
            (item) => item.projName === data.projectName
          );
          setFileName(filteredFinanceRecords);
        }

        setInitialValues({
          projectName: data.projectName,
          description: data.description,
          location: data.location,
          status: data.status,
          projectBanner: data.projectBanner,
          deadline: data.deadline,
          members: data.members,
          projectOwners: data.projectOwners,
          logs: data.logs,
          financeDocuments: data.financeDocuments,
        });
        setValue("projectName", data.projectName);
        setValue("description", data.description);
        setValue("location", data.location);
        setValue("status", data.status);
        setValue("projectBanner", data.projectBanner);
        setValue("deadline", data.deadline);
        setTeamMembers(data.projectOwners);
        setClientMembers(data.members);
        setFinancialExecution(data.financeDocuments);
        setFileName(data.financeDocuments);
        setlogs(data.logs);
      } else {
        setError("Project not found.");
      }
    } catch (error) {
      setError("Error fetching project data");
    }
  }, [id, token, isCreateMode, setValue]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const fetchProjectsOwner = useCallback(async () => {
    try {
      const response = await apiRequest("get", "/clients", {}, token);
      if (response?.data?.statusCode === 200) {
        setOwners(response?.data?.data);
      } else {
        setError("Owners not found.");
      }
    } catch (error) {
      setError("Error fetching owners");
    }
  }, [token, isCreateMode]);

  useEffect(() => {
    fetchProjectsOwner();
  }, [fetchProjectsOwner]);

  const fetchProjectsUser = useCallback(async () => {
    if (isViewMode) return;
    try {
      const response = await apiRequest("get", "/rolesUser", {}, token);
      if (response?.data?.statusCode === 200) {
        setUsers(response?.data?.data);
      } else {
        setError("Users not found.");
      }
    } catch (error) {
      setError("Error fetching Users");
    }
  }, [token, isViewMode]);

  useEffect(() => {
    fetchProjectsUser();
  }, [fetchProjectsUser]);

  const onSubmit = async (formData) => {
    if (selectedFiles.length === 9)
      return toast.error("You can only have up to 10 banners.");
    const endpoint = isCreateMode ? "/projects" : `/projects/${id}`;
    const method = isCreateMode ? "post" : "put";

    let requestData;

    if (isCreateMode) {
      const data = new FormData();
      for (const key in formData) {
        if (key !== "teamMembers" && key !== "clientMembers") {
          data.append(key, formData[key]);
        }
      }
      selectedFiles.forEach((file) => {
        data.append("projectBanner", file.file);
      });
      data.append("physicalEducationRange", "100");
      data.append("daysLeft", t("Awaiting_Start"));

      requestData = data;
    } else {
      const updatedFields = {};

      if (formData.projectName !== initialValues.projectName) {
        updatedFields.projectName = formData.projectName;
      }
      if (formData.description !== initialValues.description) {
        updatedFields.description = formData.description;
      }
      if (formData.location !== initialValues.location) {
        updatedFields.location = formData.location;
      }
      if (formData.status !== initialValues.status) {
        updatedFields.status = formData.status;
      }
      if (formData.deadline !== initialValues.deadline) {
        updatedFields.deadline = formData.deadline;
      }

      const initialMemberIds =
        initialValues.members?.map((member) => member._id) || [];
      const initialClientMemberIds =
        initialValues.projectOwners?.map((owner) => owner._id) || [];
      const modalMemberIds =
        modalTeamMembers?.map((member) => member._id) || [];
      const modalClientMemberIds =
        modalClientMembers?.map((owner) => owner._id) || [];

      const areArraysEqual = (arr1, arr2) =>
        arr1.length === arr2.length && arr1.every((id) => arr2.includes(id));

      const isMembersChanged = !areArraysEqual(
        initialMemberIds,
        modalMemberIds
      );
      const isClientMembersChanged = !areArraysEqual(
        initialClientMemberIds,
        modalClientMemberIds
      );

      if (isMembersChanged && modalMemberIds.length > 0) {
        updatedFields.members = modalMemberIds;
      }
      if (isClientMembersChanged && modalClientMemberIds.length > 0) {
        updatedFields.projectOwners = modalClientMemberIds;
      }

      const existingBannerUrls =
        initialValues.projectBanner?.map((banner) => banner.url) || [];
      const newFiles = selectedFiles.filter((file) => file.file);
      const keptFiles = selectedFiles
        .filter((file) => !file.file)
        .map((file) => file.url);

      if (
        newFiles.length > 0 ||
        existingBannerUrls.length !== keptFiles.length ||
        existingBannerUrls.some((url) => !keptFiles.includes(url))
      ) {
        updatedFields.projectBanner = true;
      }
      const data = new FormData();

      Object.keys(formData).forEach((key) => {
        if (
          key !== "projectBanner" &&
          key !== "teamMembers" &&
          key !== "clientMembers"
        ) {
          data.append(key, formData[key]);
        }
      });

      if (updatedFields.projectOwners) {
        updatedFields.projectOwners.forEach((owner, index) => {
          data.append(`members[${index}]`, owner);
        });
      }

      if (updatedFields.members) {
        updatedFields.members.forEach((member, index) => {
          data.append(`projectOwners[${index}]`, member);
        });
      }

      selectedFiles.forEach((file) => {
        if (file.file) {
          data.append("projectBanner", file.file);
        }
      });

      requestData = data;
    }
    try {
      const response = await apiRequest(method, endpoint, requestData, token);
      if (
        response?.data?.statusCode === 201 ||
        response?.data?.statusCode === 200
      ) {
        const { physicalExecution, financialExecution } = selectedExecution;
        const selectedData = FinancialExecution?.find(
          (file) => file.fileName === selectedInvoice
        );

        const id = selectedData?.id;

        if (physicalExecution.length > 0 || financialExecution.length > 0) {
          try {
            const financeUpdateResponse = await apiRequest(
              "patch",
              `/finance/${id}`,
              {
                physicalExecution,
                financialExecution,
              },
              token
            );
          } catch (error) {
            toast.error("Error updating finance execution.");
          }
        }

        const responseid = response?.data?.data._id;

        if (isCreateMode && selectedUsers.length > 0) {
          try {
            const updateResponse = await apiRequest(
              "put",
              `/projects/${responseid}`,
              {
                members: selectedClientUsers,
                projectOwners: selectedUsers,
              },
              token
            );

            if (
              updateResponse?.data?.statusCode === 201 ||
              updateResponse?.data?.statusCode === 200
            ) {
              navigate("/project-management");
              toast.success(updateResponse?.data?.message);
            } else {
              toast.error("Error updating users.");
            }
          } catch (error) {
            toast.error("Error updating project members.");
          }
        } else {
          navigate("/project-management");
          toast.success(response?.data?.message);
        }
      }
    } catch (error) {
      toast.error(error?.response?.data?.message);
    }
  };

  const handleUsersChange = (selectedOptions) => {
    const existingMembers = modalTeamMembers || [];
    const newMembers = selectedOptions.map((option) => ({
      _id: option.value,
      userName: option.label,
      avatar: option.avatar,
    }));

    const mergedMembers = [...existingMembers, ...newMembers].filter(
      (member, index, self) =>
        index === self.findIndex((m) => m._id === member._id)
    );

    setModalTeamMembers(mergedMembers);
    const selectedUserIds = mergedMembers.map((member) => member._id);
    setSelectedUsers(selectedUserIds);
  };

  const handleClientUsersChange = (selectedOptions) => {
    const existingMembers = modalClientMembers || [];
    const newMembers = selectedOptions.map((option) => ({
      _id: option.value,
      userName: option.label,
      avatar: option.avatar,
    }));

    const mergedMembers = [...existingMembers, ...newMembers].filter(
      (owner, index, self) =>
        index === self.findIndex((m) => m._id === owner._id)
    );

    setModalClientMembers(mergedMembers);
    const selectedUserIds = mergedMembers.map((owner) => owner._id);
    setSelectedClientUsers(selectedUserIds);
  };

  const saveChanges = () => {
    setTeamMembers(modalTeamMembers);
    closeModal();
  };
  const saveClientChanges = () => {
    setClientMembers(modalClientMembers);
    closeClientModal();
  };

  const handleDelete = (memberId) => {
    setModalTeamMembers((prevMembers) =>
      prevMembers.filter((member) => member._id !== memberId)
    );

    setSelectedUsers((prevUsers) =>
      prevUsers.filter((userId) => userId !== memberId)
    );
  };

  const handleClientDelete = (ownerId) => {
    setModalClientMembers((prevMembers) =>
      prevMembers.filter((owner) => owner._id !== ownerId)
    );

    setSelectedClientUsers((prevUsers) =>
      prevUsers.filter((userId) => userId !== ownerId)
    );
  };

  const handleDateChange = (startDate, endDate) => {
    if (startDate && endDate) {
      setValue(
        "deadline",
        `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`
      );
    } else if (startDate) {
      setValue("deadline", `${startDate.toLocaleDateString()} - `);
    } else {
      setValue("deadline", "");
    }
  };

  const modalStyle = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 400,
    bgcolor: "background.paper",
    boxShadow: 24,
    p: 4,
  };

  const handleFileChangetwo = (e) => {
    const newFiles = Array.from(e.target.files).map((file) => ({
      file,
      name: file.name,
    }));
    setSelectedFiles((prevFiles) => [...prevFiles, ...newFiles]);
  };

  const removeFile = (index) => {
    setSelectedFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  const [selectedInvoice, setSelectedInvoice] = useState(
    FinancialExecution?.[0]?.fileName || ""
  );
  const [selectedExecution, setSelectedExecution] = useState({
    financialExecution: FinancialExecution?.[0]?.financialExecution ?? "",
    physicalExecution: FinancialExecution?.[0]?.physicalExecution ?? "",
  });

  const handleInvoiceChange = (e) => {
    const selectedFile = e.target.value;
    setSelectedInvoice(selectedFile);

    const selectedData = FinancialExecution?.find(
      (file) => file.fileName === selectedFile
    );
    if (selectedData) {
      setSelectedExecution({
        financialExecution: selectedData.financialExecution,
        physicalExecution: selectedData.physicalExecution,
      });
    }
  };

  useEffect(() => {
    if (FinancialExecution?.length > 0) {
      setSelectedInvoice(FinancialExecution[0].fileName);
      setSelectedExecution({
        financialExecution: FinancialExecution[0].financialExecution,
        physicalExecution: FinancialExecution[0].physicalExecution,
      });
    }
  }, [FinancialExecution]);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <ChangeLogModal
        data={logs}
        open={isModalOpens}
        handleClose={handleCloseButton}
      />
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-6 rounded-lg shadow-md"
      >
        <h2 className="text-2xl font-bold mb-6">{t("Basic_Information")}</h2>
        <div className="mb-4">
          <label className="block text-2xl font-semibold mb-2 text-red-800">
            <span className="text-gray-700 text-sm">{t("Project_Name")}</span>*
          </label>

          <Controller
            name="projectName"
            control={control}
            rules={{ required: "Project Name is required" }}
            render={({ field }) => (
              <input
                {...field}
                disabled={isViewMode}
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none"
              />
            )}
          />
          {errors.projectName && (
            <span className="text-red-600">{errors.projectName.message}</span>
          )}
        </div>
        <div className="mb-4">
          <label className="block text-sm font-semibold mb-2 text-gray-700">
            {t("Description")}
          </label>
          <Controller
            name="description"
            rules={{ required: "Description is required" }}
            control={control}
            render={({ field }) => (
              <textarea
                {...field}
                disabled={isViewMode}
                rows="4"
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none"
              ></textarea>
            )}
          />
          {errors.description && (
            <span className="text-red-600">{errors.description.message}</span>
          )}
        </div>

        <h2 className="text-2xl font-bold mt-6 mb-6">{t("Project_Details")}</h2>
        <div className="mb-4">
          <label className="block text-2xl font-semibold mb-2 text-red-800">
            <span className="text-gray-700 text-sm">{t("Location")}</span>*
          </label>
          <Controller
            name="location"
            disabled={isViewMode}
            rules={{ required: "Location is required" }}
            control={control}
            render={({ field }) => (
              <input
                {...field}
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none"
              />
            )}
          />
          {errors.location && (
            <span className="text-red-600">{errors.location.message}</span>
          )}
        </div>
        <div className="mb-4">
          <label className="block text-sm font-semibold mb-2 text-gray-700">
            {t("Status")}
          </label>
          <Controller
            name="status"
            control={control}
            rules={{ required: "Status is required" }}
            defaultValue="Pending"
            render={({ field }) => (
              <select
                {...field}
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none"
                disabled={isViewMode}
              >
                <option value="Pending">{t("Pending")}</option>
                <option value="Completed">{t("Completed")}</option>
                <option value="Ongoing">{t("Ongoing")}</option>
              </select>
            )}
          />
          {errors.status && (
            <span className="text-red-600">{errors.status.message}</span>
          )}
        </div>
        <div className="mb-4 w-full">
          <label className="block text-2xl font-semibold mb-2 text-red-800">
            <span className="text-gray-700 text-sm">{t("Deadline")}</span>*
          </label>

          <Controller
            name="deadline"
            rules={{ required: "Deadline is required" }}
            control={control}
            render={({ field }) => {
              const dates = field.value
                ? field.value
                    .split(" - ")
                    .map((date) => (date ? new Date(date) : null))
                : [null, null];

              return (
                <div className="w-full">
                  <DatePicker
                    {...field}
                    selectsRange
                    startDate={dates[0]}
                    endDate={dates[1]}
                    onChange={(dates) => {
                      const [startDate, endDate] = dates;
                      handleDateChange(startDate, endDate);
                    }}
                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none"
                    disabled={isViewMode}
                    dateFormat="MM/dd/yyyy"
                    placeholderText="Select start and end date"
                    wrapperClassName="w-full"
                    minDate={new Date()}
                  />
                </div>
              );
            }}
          />

          {errors.deadline && (
            <span className="text-red-600">{errors.deadline.message}</span>
          )}
        </div>
        {!isCreateMode && FinancialExecution?.length > 0 && (
          <>
            <h2 className="text-2xl font-bold mt-6 mb-6">Invoice</h2>
            <div className="mb-4">
              <label className="block text-2xl font-semibold mb-2">
                <span className="text-gray-700 text-sm">Invoice</span>
              </label>
              <select
                value={selectedInvoice}
                onChange={handleInvoiceChange}
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none"
                disabled={isViewMode}
              >
                {FinancialExecution?.map((file, index) => (
                  <option key={index} value={file.fileName}>
                    {file.fileName}
                  </option>
                ))}
              </select>
            </div>

            <h2 className="text-2xl font-bold mt-6 mb-6">Execution</h2>
            <div className="mb-4">
              <label className="block text-2xl font-semibold mb-2">
                <span className="text-gray-700 text-sm">
                  Physical Execution
                </span>
              </label>
              <input
                value={selectedExecution.physicalExecution}
                onChange={(e) =>
                  setSelectedExecution({
                    ...selectedExecution,
                    physicalExecution: e.target.value,
                  })
                }
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none"
              />
            </div>

            <div className="mb-4">
              <label className="block text-2xl font-semibold mb-2">
                <span className="text-gray-700 text-sm">
                  Financial Execution
                </span>
              </label>
              <input
                value={selectedExecution.financialExecution}
                onChange={(e) =>
                  setSelectedExecution({
                    ...selectedExecution,
                    financialExecution: e.target.value,
                  })
                }
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none"
              />
            </div>
          </>
        )}
        <div className="mb-4">
          <label className="block text-2xl font-semibold mb-2">
            <span className="text-gray-700 text-sm">{t("Project_Banner")}</span>
          </label>
          <Controller
            name="projectBanner"
            control={control}
            render={({ field }) => (
              <input
                type="file"
                accept=".png, .jpg, .jpeg, .gif, .bmp, .webp"
                onChange={(e) => {
                  const files = e.target.files;
                  const maxSize = 5 * 1024 * 1024;

                  if (files.length > 0) {
                    const isValid = Array.from(files).every(
                      (file) => file.size <= maxSize
                    );

                    if (!isValid) {
                      toast.error(
                        "Selected file should not be greater than 5MB."
                      );
                      return;
                    }
                  }

                  handleFileChangetwo(e);
                  field.onChange(files);
                }}
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none"
                multiple
              />
            )}
          />

          <div className="mt-4 space-y-2">
            {selectedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between border px-3 py-2 rounded-md"
              >
                <span className="text-gray-700">
                  {file?.name
                    ? file?.name
                    : (() => {
                        const filename = file?.url?.split("/").pop();
                        return filename?.length > 40
                          ? filename?.slice(0, 30) +
                              "..." +
                              filename?.slice(-10)
                          : filename;
                      })()}
                </span>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  ✖
                </button>
              </div>
            ))}
          </div>
        </div>

        <h2 className="text-2xl font-bold mt-6 mb-6">Soapro {t("Team")}</h2>
        <div className="mb-4">
          {!isViewMode && (
            <>
              <label className="block text-2xl font-semibold mb-2 text-red-800">
                <span className="text-gray-700 text-sm">
                  {" "}
                  {t("Add_Team_Members")}
                </span>
                *
              </label>
              <Controller
                name="teamMembers"
                control={control}
                rules={{
                  required:
                    teamMembers?.length === 0
                      ? "Team Members is required"
                      : false,
                }}
                render={({ field }) =>
                  isCreateMode ? (
                    <Select
                      {...field}
                      isMulti
                      options={users
                        .filter(
                          (user) =>
                            !teamMembers.some(
                              (member) => member._id === user._id
                            )
                        )
                        .map((user) => ({
                          value: user._id,
                          label: user.userName || user.ownerName,
                          avatar: user.avatar,
                        }))}
                      value={field.value || []}
                      onChange={(selectedOptions) => {
                        handleUsersChange(selectedOptions);
                        field.onChange(selectedOptions);
                      }}
                      className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none"
                    />
                  ) : (
                    <select
                      {...field}
                      onClick={openModal}
                      className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none"
                    >
                      <option value="" disabled selected hidden>
                        {t("Add_Team_Members")}
                      </option>
                    </select>
                  )
                }
              />
              {errors.teamMembers && (
                <span className="text-red-600">
                  {errors.teamMembers.message}
                </span>
              )}
            </>
          )}
        </div>
        <Modal
          open={isModalOpen}
          onClose={closeModal}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box
            sx={{
              ...modalStyle,
              borderRadius: "16px",
              height: "460px",
              display: "flex",
              flexDirection: "column",
              padding: "24px",
            }}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-700">
                {t("Edit_Members")}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 focus:outline-none"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div>
              {!isViewMode && (
                <>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">
                    {t("Add_Team_Members")}
                  </label>
                  <Controller
                    name="teamMembers"
                    control={control}
                    rules={{
                      required:
                        teamMembers?.length === 0
                          ? "Team Members is required"
                          : false,
                    }}
                    render={({ field }) => (
                      <Select
                        {...field}
                        isMulti
                        options={users
                          .filter(
                            (user) =>
                              !modalTeamMembers.some(
                                (member) =>
                                  (member.ownerId &&
                                    member.ownerId === user._id) ||
                                  (member.ownerName &&
                                    member.ownerName === user.ownerName)
                              )
                          )
                          .map((user) => ({
                            value: user._id,
                            label: user.userName || user.ownerName,
                            avatar: user.avatar,
                          }))}
                        value={modalTeamMembers.map((member) => ({
                          value: member._id,
                          label: member.userName || member.ownerName,
                          avatar: member.avatar,
                        }))}
                        onChange={(selectedOptions) => {
                          handleUsersChange(selectedOptions);
                          field.onChange(selectedOptions);
                        }}
                        className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none"
                      />
                    )}
                  />
                  {errors.teamMembers && (
                    <span className="text-red-600">
                      {errors.teamMembers.message}
                    </span>
                  )}
                </>
              )}
            </div>

            {!isCreateMode && (
              <div className="mt-4 flex-grow scrollbar-custom">
                <h3 className="block text-sm font-semibold mb-4 text-gray-700">
                  {t("Added_Members")}
                </h3>
                <ul className="space-y-2">
                  {modalTeamMembers.map((member) => (
                    <li
                      key={member._id}
                      className="flex items-center bg-gray-100 p-2 rounded-lg"
                    >
                      {member.avatar ? (
                        <img
                          src={member.avatar}
                          alt={member.userName}
                          className="w-10 h-10 rounded-full mr-3"
                        />
                      ) : (
                        <User
                          key={member._id}
                          className="bg-slate-400 rounded-full p-2 text-white mr-2"
                          size={32}
                        />
                      )}
                      <span>{member.userName || member.ownerName}</span>
                      {!isViewMode && (
                        <button
                          className="ml-auto text-red-500 hover:text-red-700 focus:outline-none"
                          onClick={() => handleDelete(member._id)}
                        >
                          <span className="text-lg">🗑️</span>
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex justify-between mt-4 w-full">
              <button
                onClick={saveChanges}
                className="px-4 py-3 w-1/2 mr-2 text-sm font-semibold text-white bg-black-blacknew rounded-lg focus:outline-none"
              >
                {t("Save_Changes")}
              </button>
              <button
                onClick={closeModal}
                className="px-4 py-3 w-1/2 ml-2 text-sm font-semibold text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 focus:outline-none"
              >
                {t("Cancel")}
              </button>
            </div>
          </Box>
        </Modal>

        {!isCreateMode && (
          <>
            <h2 className="block text-sm font-semibold mb-4 text-gray-700">
              {t("Added_Members")}
            </h2>
            <div>
              <ul>
                {teamMembers?.map((member) => (
                  <li key={member._id} className="flex items-center mb-2">
                    {member.avatar ? (
                      <img
                        src={member.avatar}
                        alt={member.userName}
                        className="w-10 h-10 rounded-full mr-3"
                      />
                    ) : (
                      <User
                        key={member._id}
                        className="bg-slate-400 rounded-full p-2 text-white mr-2"
                        size={32}
                      />
                    )}
                    <span>{member.userName || member.ownerName}</span>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}

        <h2 className="text-2xl font-bold mt-6 mb-6">{t("Company_Team")}</h2>
        <div className="mb-4">
          {!isViewMode && (
            <>
              <label className="block text-2xl font-semibold mb-2 text-red-800">
                <span className="text-gray-700 text-sm">
                  {" "}
                  {t("Add_Client_Members")}
                </span>
                *
              </label>
              <Controller
                name="clientMembers"
                control={control}
                rules={{
                  required:
                    clientMembers.length === 0
                      ? "Client Members is required"
                      : false,
                }}
                render={({ field }) =>
                  isCreateMode ? (
                    <Select
                      {...field}
                      isMulti
                      options={owners
                        .filter(
                          (user) =>
                            !clientMembers.some(
                              (owner) => owner._id === user._id
                            )
                        )
                        .map((user) => ({
                          value: user._id,
                          label: user?.userName || user?.ownerName,
                          avatar: user.avatar,
                        }))}
                      value={field.value || []}
                      onChange={(selectedOptions) => {
                        handleClientUsersChange(selectedOptions);
                        field.onChange(selectedOptions);
                      }}
                      className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none"
                    />
                  ) : (
                    <select
                      {...field}
                      onClick={openClientModal}
                      className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none"
                    >
                      <option value="" disabled selected hidden>
                        {t("Add_Client_Members")}
                      </option>
                    </select>
                  )
                }
              />
              {errors.clientMembers && (
                <span className="text-red-600">
                  {errors.clientMembers.message}
                </span>
              )}
            </>
          )}
        </div>

        <Modal
          open={isclientModalOpen}
          onClose={closeClientModal}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box
            sx={{
              ...modalStyle,
              borderRadius: "16px",
              height: "460px",
              display: "flex",
              flexDirection: "column",
              padding: "24px",
            }}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-700">
                {t("Edit_Members")}
              </h2>
              <button
                onClick={closeClientModal}
                className="text-gray-500 hover:text-gray-700 focus:outline-none"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div>
              {!isViewMode && (
                <>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">
                    Add Client Members
                  </label>
                  <Controller
                    name="clientMembers"
                    control={control}
                    rules={{
                      required:
                        clientMembers.length === 0
                          ? "Client Members is required"
                          : false,
                    }}
                    render={({ field }) => {
                      const filteredOptions = owners
                        .filter(
                          (user) =>
                            !modalClientMembers.some(
                              (owner) =>
                                (owner.ownerId && owner.ownerId === user._id) ||
                                (owner.ownerName &&
                                  owner.ownerName === user.ownerName)
                            )
                        )
                        .map((user) => ({
                          value: user._id,
                          label: user.ownerName || user.userName,
                          avatar: user.avatar,
                        }));
                      return (
                        <Select
                          {...field}
                          isMulti
                          options={filteredOptions}
                          value={modalClientMembers.map((owner) => ({
                            value: owner._id,
                            label: owner.ownerName || owner.userName,
                            avatar: owner.avatar,
                          }))}
                          onChange={(selectedOptions) => {
                            handleClientUsersChange(selectedOptions);
                            field.onChange(selectedOptions);
                          }}
                          className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none"
                        />
                      );
                    }}
                  />

                  {errors.clientMembers && (
                    <span className="text-red-600">
                      {errors.clientMembers.message}
                    </span>
                  )}
                </>
              )}
            </div>

            {!isCreateMode && (
              <div className="mt-4 flex-grow scrollbar-custom">
                <h3 className="block text-sm font-semibold mb-4 text-gray-700">
                  Added Clients
                </h3>
                <ul className="space-y-2">
                  {modalClientMembers.map((owner) => (
                    <li
                      key={owner._id}
                      className="flex items-center bg-gray-100 p-2 rounded-lg"
                    >
                      {owner.avatar ? (
                        <img
                          src={owner.avatar}
                          alt={owner.userName}
                          className="w-10 h-10 rounded-full mr-3"
                        />
                      ) : (
                        <User
                          key={owner._id}
                          className="bg-slate-400 rounded-full p-2 text-white mr-2"
                          size={32}
                        />
                      )}
                      <span>{owner?.userName || owner?.ownerName}</span>
                      {!isViewMode && (
                        <button
                          className="ml-auto text-red-500 hover:text-red-700 focus:outline-none"
                          onClick={() => handleClientDelete(owner._id)}
                        >
                          <span className="text-lg">🗑️</span>
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex justify-between mt-4 w-full">
              <button
                onClick={saveClientChanges}
                className="px-4 py-3 w-1/2 mr-2 text-sm font-semibold text-white bg-black-blacknew rounded-lg focus:outline-none"
              >
                {t("Save_Changes")}
              </button>
              <button
                onClick={closeClientModal}
                className="px-4 py-3 w-1/2 ml-2 text-sm font-semibold text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 focus:outline-none"
              >
                {t("Cancel")}
              </button>
            </div>
          </Box>
        </Modal>

        {!isCreateMode && (
          <>
            <h2 className="block text-sm font-semibold mb-4 text-gray-700">
              {t("Added_Members")}
            </h2>
            <div>
              <ul>
                {clientMembers?.map((owner) => (
                  <li key={owner._id} className="flex items-center mb-2">
                    {owner.avatar ? (
                      <img
                        src={owner.avatar}
                        alt={owner.userName}
                        className="w-10 h-10 rounded-full mr-3"
                      />
                    ) : (
                      <User
                        key={owner._id}
                        className="bg-slate-400 rounded-full p-2 text-white mr-2"
                        size={32}
                      />
                    )}
                    <span>{owner.ownerName || owner.userName}</span>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}

        <div className="mt-6 flex justify-between">
          <div>
            {!isViewMode && (
              <button
                type="submit"
                className="bg-black-blacknew text-white px-6 py-2 rounded-md shadow-md mr-4"
              >
                {t("Save_Changes")}
              </button>
            )}

            <button
              onClick={() => navigate("/project-management")}
              className="bg-gray-200 text-black-blacknew px-6 py-2 rounded-md shadow-md"
            >
              {t("Cancel")}
            </button>
          </div>
          {!isCreateMode && (
            <button
              type="button"
              onClick={handleOPenButton}
              className="text-black-blacknew underline"
            >
              {t("View_Change_History")}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
