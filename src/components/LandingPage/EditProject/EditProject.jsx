import React, { useCallback, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  useParams,
  useNavigate,
  useLocation,
  Navigate,
} from "react-router-dom";
import { useForm, Controller, set } from "react-hook-form";
import apiRequest from "../../../utils/apiRequest";
import { toast } from "react-toastify";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import ChangeLogModal from "../../ChangeLog/ChangeLog";
import { Modal, Box, FormControl, InputLabel, MenuItem } from "@mui/material";
import "../../../utils/i18n";
import { useTranslation } from "react-i18next";
import { Trash2, User } from "lucide-react";

export default function EditProject() {
  const {
    control,
    handleSubmit,
    setValue,
    getValues,
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
  const [milestones, setMilestones] = useState([]);
  const [businessAreas, setBusinessAreas] = useState([]);
  const [projecto, setProjecto] = useState([]);
  const [loading, setLoading] = useState(false);
  const userId = useSelector((state) => state?.auth?.userInfo?._id);
  const [selectedCompany, setSelectedCompany] = useState("");
  const dispatch = useDispatch();
  const values = getValues(); // from useForm()

  useEffect(() => {
    const fetchBusinessAreas = async () => {
      try {
        const response = await apiRequest("get", `/businessArea`, {}, token);
        console.log(response.data.data);

        if (response.data && Array.isArray(response.data.data)) {
          setBusinessAreas(response.data.data);
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
    };

    fetchBusinessAreas();
  }, [token, dispatch, navigate]);

  useEffect(() => {
    const fetchProjecto = async () => {
      setLoading(true);
      try {
        const response = await apiRequest("get", "/companies", {}, token);
        console.log(response);

        if (response?.data?.statusCode === 200 && response?.data?.data) {
          // Map over the array of company objects and extract the name
          const comapanyName = response.data.data.map(
            (company) => company.name
          );
          setProjecto(comapanyName);
        } else {
          // Handle cases where data or statusCode is not as expected
          setProjecto([]); // Set to empty array if no data or incorrect status
        }
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjecto();
  }, [token]);

  console.log("The companies are:", projecto);

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
  const [projectsData, setProjectData] = useState([]);
  const [SelectedbusinessArea, setSelectedbusinessArea] = useState([]);

  const fetchProjects = useCallback(async () => {
    if (isCreateMode) return;

    try {
      const response = await apiRequest("get", `/projects/${id}`, {}, token);
      if (response?.data?.statusCode === 200) {
        const data = response?.data?.data;

        setProjectData(data);
        console.log("Project data is:", data);

        const financeResponse = await apiRequest("get", "/finance", {}, token);
        if (financeResponse?.status === 200) {
          const filteredFinanceRecords = financeResponse?.data.filter(
            (item) => item.projName === data.projectName
          );
          setFileName(filteredFinanceRecords);
        }

        setInitialValues({
          projectName: data.projectName,
          title: data.title,
          description: data.description,
          location: data.location,
          status: data.status,
          projectBanner: data.projectBanner,
          deadline: data.deadline,
          members: data.members,
          projectOwners: data.projectOwners,
          logs: data.logs,
          financeDocuments: data.financeDocuments,
          additionalMilestones: data.additionalMilestones,
          businessArea: data.businessAreas, // Add this line
          company: data.comapanyName, // Add this line (note the typo in the API response)
        });

        // Set form values
        setValue("projectName", data.projectName);
        setValue("title", data.title);
        setValue("description", data.description);
        setValue("location", data.location);
        setValue("status", data.status);
        setValue("projectBanner", data.projectBanner);
        setValue("deadline", data.deadline);
        setValue("businessArea", data.businessAreas); // Add this line
        setValue("company", data.comapanyName); // Add this line

        // Set state variables
        setSelectedbusinessArea(data.businessAreas);
        setSelectedCompany(data.comapanyName);

        if (data.additionalMilestones) {
          setMilestones(
            data.additionalMilestones.map((milestone) => ({
              id: milestone._id,
              apiId: milestone._id,
              name: milestone.title,
              description: milestone.description,
            }))
          );
        }
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

  console.log("Projects data is:", projectsData);

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
  const [deletedMilestones, setDeletedMilestones] = useState([]);

  const onSubmit = async (formData) => {
    if (
      !formData.deadline ||
      !formData.deadline.includes(" - ") ||
      formData.deadline.endsWith(" - ") ||
      formData.deadline.startsWith(" - ")
    )
      if (selectedFiles.length > 10) {
        {
          toast.error("Please select both the Start Date and End Date.");
          return; // Prevent form submission
        }
        toast.error("You can only have up to 10 banners.");
        return;
      }

    if (selectedFiles.length > 10)
      return toast.error("You can only have up to 10 banners.");
    try {
      for (const milestoneId of deletedMilestones) {
        await apiRequest(
          "delete",
          `/additional/milestone/delete/${milestoneId}`,
          {},
          token
        );
      }
      setDeletedMilestones([]);
    } catch (error) {
      toast.error("Failed to delete some milestones");
      console.error("Error deleting milestones:", error);
    }
    const endpoint = isCreateMode ? "/projects" : `/projects/${id}`;
    const method = isCreateMode ? "post" : "put";

    let requestData;

    if (isCreateMode) {
      const data = new FormData();
      for (const key in formData) {
        if (
          key !== "teamMembers" &&
          key !== "clientMembers" &&
          key !== "projectBanner" &&
          key !== "milestonetitle" &&
          key !== "milestonedesc" &&
          key !== "additionalMilestones"
        ) {
          data.append(key, formData[key]);
        }
      }
      selectedFiles.forEach((file) => {
        data.append("projectBanner", file.file);
      });
      data.append("physicalEducationRange", "100");
      data.append("daysLeft", t("Awaiting_Start"));
      data.append("businessAreas", SelectedbusinessArea);
      data.append("comapanyName", selectedCompany);

      requestData = data;
    } else {
      const updatedFields = {};

      if (formData.projectName !== initialValues.projectName) {
        updatedFields.projectName = formData.projectName;
      }
      if (formData.title !== initialValues.title) {
        updatedFields.title = formData.title;
      }
      if (formData.description !== initialValues.description) {
        updatedFields.description = formData.description;
      }
      if (formData.location !== initialValues.location) {
        updatedFields.location = formData.location;
      }
      if (SelectedbusinessArea !== initialValues.businessArea) {
        updatedFields.businessAreas = SelectedbusinessArea;
      }
      if (selectedCompany !== initialValues.company) {
        updatedFields.comapanyName = selectedCompany;
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

      // Ensure required fields are present in FormData
      const requiredFields = [
        "projectName",
        "title",
        "description",
        "location",
        "deadline",
      ];

      requiredFields.forEach((field) => {
        data.append(field, formData[field]);
      });

      // Then add other fields conditionally
      Object.keys(updatedFields).forEach((key) => {
        if (
          key !== "projectBanner" &&
          key !== "members" &&
          key !== "projectOwners"
        ) {
          data.append(key, updatedFields[key]);
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

        try {
          for (const milestone of milestones) {
            const payload = {
              title: milestone.name,
              description: milestone.description,
              status: "pending",
              completedAt: null,
              userId: userId,
              projectId: response.data.data._id,
            };

            await apiRequest(
              "post",
              `/additional/milestone/${response.data.data._id}`,
              payload,
              token
            );
          }

          setMilestones([]);
          // toast.success("Milestones saved successfully!");
        } catch (error) {
          toast.error("Failed to save milestones.");
          console.error(error);
        }

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

        const projectName = formData.projectName || initialValues.projectName;

        if (!projectName) {
          toast.error("Project name is required");
          return;
        }

        if (!userId) {
          toast.error("User information not found");
          return;
        }

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

        if (
          !formData.title.trim() ||
          !formData.description.trim() ||
          !formData.status.trim() ||
          !formData.projectId.trim()
        ) {
          toast.error("All fields are required.");
          return;
        }
        try {
          if (!token) {
            throw new Error("No token found");
          }

          if (response.status === 200 || response.status === 201) {
            toast.success(response.data.message);
          } else {
            toast.error("Failed to add milestone.");
          }
        } catch (error) {
          toast.error(
            error.response?.data?.message ||
              error.message ||
              "Something went wrong. Please try again."
          );
          console.error("Error:", error);
        }
      }
    } catch (error) {
      toast.error(error?.response?.data?.message);
    }
    navigate("/");
  };

  const handleMilestoneDelete = async (id) => {
    const milestoneToDelete = milestones.find((m) => m.id === id);
  
    if (!milestoneToDelete) return;
  
    if (milestoneToDelete.apiId) {
      setDeletedMilestones((prev) => [...prev, milestoneToDelete.apiId]);
    }
  
    setMilestones((prevMilestones) =>
      prevMilestones.filter((m) => m.id !== id)
    );
  
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
    const existingMember = modalClientMembers || [];

    // Map new selections to the expected structure
    const newMember = selectedOptions.map((option) => ({
      _id: option.value,
      userName: option.label,
      avatar: option.avatar,
    }));

    // Merge new and existing members, ensuring uniqueness
    const mergedMember = [
      ...existingMember.filter((member) =>
        newMember.every((newM) => newM._id !== member._id)
      ),
      ...newMember,
    ];

    setModalClientMembers(mergedMember);
    const selectedUserId = mergedMember.map((owner) => owner._id);
    setSelectedClientUsers(selectedUserId);
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
      url: URL.createObjectURL(file),
    }));

    setSelectedFiles((prevFiles) => {
      // Check for duplicates by name or file reference
      const existingFileNames = new Set(prevFiles.map((f) => f.name));

      const uniqueNewFiles = newFiles.filter((file) => {
        if (existingFileNames.has(file.name)) {
          toast.error("This file is already selected.");
          return false; // Exclude duplicate
        }
        return true;
      });

      return [...prevFiles, ...uniqueNewFiles];
    });
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
        <h2 className="text-2xl font-bold mb-6">{t("Project_Gallery")}</h2>

        <div className="mb-4">
          <label className="block text-2xl font-semibold mb-2">
            <span className="text-gray-700 text-sm">{t("Project_Banner")}</span>
          </label>

          <div
            onClick={() =>
              document.getElementById("projectBannerInput").click()
            }
            className="border-2 border-dashed border-gray-300 rounded-lg py-10 px-4 text-center cursor-pointer hover:bg-gray-50 transition duration-150"
          >
            <p className="text-gray-600 mb-4">
              {t("Drop_your_images_here_or")}{" "}
              <span className="text-blue-600 font-semibold underline hover:text-blue-800">
                {t("Upload")}
              </span>
            </p>

            <Controller
              name="projectBanner"
              control={control}
              render={({ field }) => (
                <input
                  id="projectBannerInput"
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
                        e.target.value = "";
                        return;
                      }
                    }

                    handleFileChangetwo(e);
                    field.onChange(files);
                  }}
                  className="hidden"
                  multiple
                />
              )}
            />
          </div>

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

        <div className="mb-6">
  <h2 className="text-2xl font-bold mb-6">{t("Business_Area")}</h2>
  <label className="block text-2xl font-semibold mb-2">
    <span className="text-gray-700 text-sm">
      {t("Select_the_Business_Area")}
    </span>
  </label>
  <Controller
    name="businessArea"
    control={control}
    render={({ field }) => {
      const options = businessAreas.map((area) => ({
        value: area._id,
        label: area.businessArea,
      }));
      
      // Find the initial value based on the name from API
      const initialValue = options.find(
        option => option.label === initialValues.businessArea
      ) || null;
      
      return (
        <Select
          {...field}
          options={options}
          isSearchable
          placeholder={t("Search_Business_Area")}
          className="mt-1"
          onChange={(selectedOption) => {
            field.onChange(selectedOption?.value); // Update form value
            setSelectedbusinessArea(selectedOption?.label); // Update state
          }}
          value={options.find(option => 
            option.value === field.value || 
            option.label === field.value
          ) || initialValue}
        />
      );
    }}
  />
</div>

<div className="mb-6">
  <h2 className="text-2xl font-bold mb-6">{t("Client")}</h2>
  <label className="block text-2xl font-semibold mb-2">
    <span className="text-gray-700 text-sm">
      {t("Select_the_Client_Company")}
    </span>
  </label>
  <Controller
    name="company"
    control={control}
    render={({ field }) => {
      const options = projecto.map((company) => ({
        value: company,
        label: company,
      }));

      return (
        <Select
          {...field}
          options={options}
          isSearchable
          placeholder={t("Search_Client_Company")}
          className="mt-1"
          onChange={(selectedOption) => {
            field.onChange(selectedOption?.value); // Update form value
            setSelectedCompany(selectedOption?.value); // Update state
          }}
          value={options.find(option => option.value === field.value) || null}
        />
      );
    }}
  />
</div>

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
        {!isCreateMode && (
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
        )}
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
                    // minDate={new Date()}
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

        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">{t("Project_Milestones")}</h2>

          {/* 💡 Input Form Section */}
          <div className="bg-white p-6 border border-gray-200 rounded-md shadow-sm mb-10">
            <label className="block text-2xl font-semibold mb-2">
              <span className="text-gray-700 text-sm">
                {t("Milestone_Name")}
              </span>
            </label>
            <Controller
              name="milestonetitle"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded-md"
                  placeholder={t("Enter_milestone_name")}
                />
              )}
            />

            <label className="block text-2xl font-semibold mt-4 mb-2">
              <span className="text-gray-700 text-sm">
                {t("Milestone_Description")}
              </span>
            </label>
            <Controller
              name="milestonedesc"
              control={control}
              render={({ field }) => (
                <textarea
                  {...field}
                  className="w-full p-3 border border-gray-300 rounded-md"
                  rows={4}
                  placeholder={t("Enter_milestone_description")}
                ></textarea>
              )}
            />

            <div className="flex justify-end mt-6">
              <button
                type="button"
                className="bg-black-blacknew text-white px-6 py-2 rounded-md shadow-md mr-4"
                onClick={() => {
                  const formValues = getValues();
                  if (!formValues.milestonetitle || !formValues.milestonedesc)
                    return;

                  const newMilestone = {
                    id: Date.now(),
                    name: formValues.milestonetitle,
                    description: formValues.milestonedesc,
                  };

                  setMilestones((prev) => [...prev, newMilestone]);
                  setValue("additionalMilestones", [
                    ...milestones,
                    newMilestone,
                  ]);
                  setValue("milestonetitle", "");
                  setValue("milestonedesc", "");
                }}
              >
                {t("Save_Milestones")}
              </button>

              <button
                type="button"
                className="bg-gray-200 text-black-blacknew px-6 py-2 rounded-md shadow-md"
                onClick={() => {
                  setValue("milestonetitle", "");
                  setValue("milestonedesc", "");
                }}
              >
                {t("Cancel")}
              </button>
            </div>
          </div>

          {/* ✅ Milestones List Section */}
          <div className="mt-4">
            <h3 className="text-xl font-semibold mb-4">{t("Milestones")}</h3>
            {milestones.length === 0 ? (
              <p className="text-gray-500">{t("No_milestones_added_yet")}</p>
            ) : (
              <div className="space-y-4">
                {milestones.map((milestone, index) => (
                  <div
                    key={milestone.id}
                    className="p-4 bg-white border border-gray-200 rounded-md shadow-sm flex justify-between items-start"
                  >
                    <div>
                      <h4 className="text-lg font-medium text-gray-800">
                        {index + 1}. {milestone.name}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">
                        {milestone.description}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="text-red-500 hover:text-red-700"
                      onClick={() => handleMilestoneDelete(milestone.id)}
                      title="Delete"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <h2 className="text-2xl font-bold mt-6 mb-6"> {t("Team")} Soapro </h2>
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
                            ) && user.companyName === selectedCompany
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
                    {t("Add_Client_Members")}
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
                                  owner.ownerName === user.ownerName) ||
                                (owner.userName &&
                                  owner.userName === user.userName)
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
                          options={owners
                            .filter(
                              (user) =>
                                !modalClientMembers.some(
                                  (owner) =>
                                    (owner.ownerId &&
                                      owner.ownerId === user._id) ||
                                    (owner.ownerName &&
                                      owner.ownerName === user.ownerName) ||
                                    (owner.userName &&
                                      owner.userName === user.userName)
                                ) && user.companyName === selectedCompany
                            )
                            .map((user) => ({
                              value: user._id,
                              label: user.ownerName || user.userName,
                              avatar: user.avatar,
                            }))}
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
                  {t("Added_Clients")}
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

        <div className="mt-6">
          <div className="flex justify-end ">
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
