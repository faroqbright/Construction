import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import apiRequest from "../../../utils/apiRequest";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const SubmitDocument = () => {
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedProject, setSelectedProject] = useState("");
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const token = useSelector((state) => state?.auth?.userToken);  
  const user = useSelector((state) => state?.auth?.userInfo?.userName);
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      try {
        const response = await apiRequest("get", "/projects", {}, token);
        if (response?.data?.statusCode === 200) {
          setProjects(response?.data?.data?.projects || []);
        }
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [token]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];

    if (file) {
      if (file.type !== "application/pdf") {
        toast.error("Only PDF files are allowed!");
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !selectedProject) {
        toast.info("Please select a project and upload a PDF file.");
      return;
    }

    setUploading(true);

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("projName", selectedProject);
    formData.append("user", user);

    try {
      const response = await apiRequest("post", "/userdocuments", formData, token, {
        "Content-Type": "multipart/form-data",
      });
      console.log(response);
      

      if (response?.status === 200 || response?.status === 201) {
        toast.success("File uploaded successfully!");
        setSelectedFile(null);
        setSelectedProject("");

        navigate("/documents");
      } else {
        toast.error("Upload failed. Please try again.");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("An error occurred while uploading.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <h1 className="font-semibold text-2xl mx-4 mb-3">
        {t("Project_Details")} <span className="text-red-600 pr-1">*</span>
      </h1>

      <div className="mx-4 mb-3">
        <h3>{t("Project_Name")}</h3>
        <select
          className="mt-2 border border-gray-300 rounded-md p-2 w-full"
          value={selectedProject}
          onChange={(e) => setSelectedProject(e.target.value)}
        >
          <option value="">{t("Select_a_Project")}</option>
          {loading ? (
            <option>Loading...</option>
          ) : (
            projects.map((project) => (
              <option key={project._id} value={project.projectName}>
                {project.projectName}
              </option>
            ))
          )}
        </select>
      </div>

      <div className="mx-4 mb-3">
        <h1 className="font-semibold mb-3 text-2xl">{t("Upload_Document")}</h1>
        <div className="border border-gray-200 p-4 items-center rounded-xl border-dashed">
          <div className="flex flex-col items-center justify-center">
            <img
              src="src/assets/cloud-download.png"
              alt="Document"
              className="w-16 h-16 object-cover rounded-full"
            />
            <p className="text-[#1A1A18] text-[24px] font-[600] mt-5">
              {t("Choose_a_file_and_Drop_it_here")}
            </p>
            <p className="text-[#626262] text-[14px] font-[500] mt-2">
              {t("Only_PDF_files_are_allowed")}, {t("up_to")} 50MB
            </p>
            <input
              type="file"
              accept=".pdf"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileChange}
            />
            <button
              className="bg-[#F9F9F9] text-[#1A1A18] text-[14px] font-[500] border mt-5 px-4 py-2 rounded-md"
              onClick={() => fileInputRef.current.click()}
            >
              {t("Browse_Files")}
            </button>
            {selectedFile && <p className="mt-2">{selectedFile.name}</p>}
          </div>
        </div>

        <div className="items-center flex flex-col justify-center mt-5">
          <button
            className="bg-black-blacknew text-white font-bold py-3 rounded-lg w-full"
            onClick={handleUpload}
            disabled={uploading}
          >
            {uploading ? "Uploading..." : `${t("Upload_Changes")}`}
          </button>
        </div>
      </div>
    </>
  );
};

export default SubmitDocument;
