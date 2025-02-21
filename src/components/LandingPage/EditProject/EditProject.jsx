import React, { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useForm, Controller, Form } from "react-hook-form";
import apiRequest from "../../../utils/apiRequest";
import { toast } from "react-toastify";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import ChangeLogModal from "../../ChangeLog/ChangeLog";
import { Modal, Box } from "@mui/material";
import { t } from "i18next";
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
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedFil, setSelectedFil] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [initialValues, setInitialValues] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTeamMembers, setModalTeamMembers] = useState([]);
  const [logs, setlogs] = useState([]);
  const [isModalOpens, setIsModalOpens] = useState(false);

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

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (
      file &&
      (file.type === "image/png" ||
        file.type === "image/jpeg" ||
        file.type === "image/gif" ||
        file.type === "image/bmp" ||
        file.type === "image/webp")
    ) {
      setSelectedFile(file);
    } else {
      toast.error("Please select a valid image file.");
      e.target.value = null;
    }
  };

  const handleFileChang = (e) => {
    const file = e.target.files[0];

    if (file) {
      // Validate file type (for example, allow only image files)
      if (
        file.type === "image/png" ||
        file.type === "image/jpeg" ||
        file.type === "image/gif" ||
        file.type === "image/bmp" ||
        file.type === "image/webp"
      ) {
        // File is valid
        setSelectedFil(file);
      } else {
        // Invalid file type, show an error
        toast.error("Please select a valid image file.");
        e.target.value = null; // Clear the input field
      }
    }
  };

  const fetchProjects = useCallback(async () => {
    if (isCreateMode) return;

    try {
      const response = await apiRequest("get", `/projects/${id}`, {}, token);
      if (response?.data?.statusCode === 200) {
        const data = response?.data?.data;
        setInitialValues({
          projectName: data.projectName,
          description: data.description,
          location: data.location,
          status: data.status,
          projectBanner: data.projectBanner,
          deadline: data.deadline,
          members: data.members,
          logs: data.logs,
        });
        setValue("projectName", data.projectName);
        setValue("description", data.description);
        setValue("location", data.location);
        setValue("status", data.status);
        setValue("projectBanner", data.projectBanner);
        setValue("deadline", data.deadline);
        setTeamMembers(data.members);
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
    if (!isCreateMode) return;
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
    const endpoint = isCreateMode ? "/projects" : `/projects/${id}`;
    const method = isCreateMode ? "post" : "put";

    let requestData;

    if (isCreateMode) {
      const data = new FormData();
      for (const key in formData) {
        if (key !== "teamMembers") {
          data.append(key, formData[key]);
        }
      }
      data.append("physicalEducationRange", "100");
      data.append("daysLeft", (t("Awaiting_Start")));

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
      const initialMemberIds = initialValues.members
        ? initialValues.members.map((member) => member._id)
        : [];
      const modalMemberIds = modalTeamMembers
        ? modalTeamMembers.map((member) => member._id)
        : [];

      const areArraysEqual = (arr1, arr2) =>
        arr1.length === arr2.length && arr1.every((id) => arr2.includes(id));

      const isMembersChanged = !areArraysEqual(
        initialMemberIds,
        modalMemberIds
      );

      if (isMembersChanged && modalMemberIds.length > 0) {
        updatedFields.members = modalMemberIds;
      }

      if (Object.keys(updatedFields).length === 0) {
        toast.info("No changes were made.");
        return;
      }

      requestData = updatedFields;
    }
    try {
      const response = await apiRequest(method, endpoint, requestData, token);
      if (
        response?.data?.statusCode === 201 ||
        response?.data?.statusCode === 200
      ) {
        const responseid = response?.data?.data._id;

        if (isCreateMode && selectedUsers.length > 0) {
          try {
            const updateResponse = await apiRequest(
              "put",
              `/projects/${responseid}`,
              { members: selectedUsers },
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
      toast.error("Error saving project.");
    }
  };

  const handleOwnerChange = (selectedOwner) => {
    const owner = owners.find((owner) => owner.userName === selectedOwner);
    if (owner) {
      setValue("projectOwnerId", owner._id);
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

  const saveChanges = () => {
    setTeamMembers(modalTeamMembers);
    closeModal();
  };

  const handleDelete = (memberId) => {
    setModalTeamMembers((prevMembers) =>
      prevMembers.filter((member) => member._id !== memberId)
    );

    setSelectedUsers((prevUsers) =>
      prevUsers.filter((userId) => userId !== memberId)
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

        {isCreateMode && (
          <>
            <div className="mb-4">
              <label className="block text-2xl font-semibold mb-2 text-red-800">
                <span className="text-gray-700 text-sm">
                  {" "}
                  {t("Project_Banner")}
                </span>
                *
              </label>
              <Controller
                name="projectBanner"
                rules={{ required: "Project Banner is required" }}
                control={control}
                render={({ field }) => (
                  <input
                    type="file"
                    accept=".png, .jpg, .jpeg, .gif, .bmp, .webp"
                    onChange={(e) => {
                      handleFileChange(e);
                      field.onChange(e.target.files[0]);
                    }}
                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none"
                  />
                )}
              />
              {errors.projectBanner && (
                <span className="text-red-600">
                  {errors.projectBanner.message}
                </span>
              )}
            </div>
            <div className="mb-4">
              <label className="block text-2xl font-semibold mb-2 text-red-800">
                <span className="text-gray-700 text-sm">
                  {" "}
                  {t("Project_Owner")}
                </span>
                *
              </label>
              <Controller
                name="projectOwner"
                control={control}
                rules={{ required: "Project Owner is required" }}
                render={({ field }) => (
                  <select
                    {...field}
                    onChange={(e) => {
                      field.onChange(e);
                      handleOwnerChange(e.target.value);
                    }}
                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none"
                  >
                    <option value="">Select Project Owner</option>
                    {owners.map((owner) => (
                      <option key={owner._id} value={owner.userName}>
                        {owner.userName}
                      </option>
                    ))}
                  </select>
                )}
              />
              {errors.projectOwner && (
                <span className="text-red-600">
                  {errors.projectOwner.message}
                </span>
              )}
            </div>

            <Controller
              name="projectOwnerId"
              control={control}
              render={({ field }) => (
                <input {...field} type="hidden" value={field.value || ""} />
              )}
            />
          </>
        )}

        <h2 className="text-2xl font-bold mt-6 mb-6">{t("Team_Members")}</h2>
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
                    teamMembers.length === 0
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
                          label: user.userName,
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
                        teamMembers.length === 0
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
                                (member) => member._id === user._id
                              )
                          )
                          .map((user) => ({
                            value: user._id,
                            label: user.userName,
                            avatar: user.avatar,
                          }))}
                        value={modalTeamMembers.map((member) => ({
                          value: member._id,
                          label: member.userName,
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
                      <span>{member.userName}</span>
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
                {teamMembers.map((member) => (
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
                    <span>{member.userName}</span>
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
