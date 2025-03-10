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
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

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
          const fetchedProjects = response?.data?.data?.projects || [];
          setProjects(fetchedProjects);
          setFilteredProjects(fetchedProjects.slice(0, 6)); // Show first 6 projects initially
        }
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [token]);

  // Handle search input change
  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchTerm(query);

    if (!query.trim()) {
      setFilteredProjects(projects.slice(0, 6)); // Show first 6 if empty
    } else {
      const filtered = projects
        .filter((project) =>
          project.projectName.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, 6); // Limit to 6 results

      setFilteredProjects(filtered);
    }

    setShowDropdown(true);
  };

  // Handle selecting a project
  const handleSelectProject = (projectName) => {
    setSelectedProject(projectName);
    setSearchTerm(projectName);
    setShowDropdown(false);
  };

  return (
    <>
      <h1 className="font-semibold text-2xl mx-4 mb-3">
        {t("Project_Details")} <span className="text-red-600 pr-1">*</span>
      </h1>

      <div className="mx-4 mb-3 relative">
        <h3>{t("Project_Name")}</h3>
        <input
          type="text"
          className="mt-2 border border-gray-300 rounded-md p-2 w-full"
          placeholder={t("Search_Project")}
          value={searchTerm}
          onChange={handleSearch}
          onFocus={() => {
            setFilteredProjects(projects.slice(0, 6)); // Show first 6 projects on focus
            setShowDropdown(true);
          }}
        />

        {loading && <p className="mt-2 text-gray-500">{t("Loading...")}</p>}

        {showDropdown && filteredProjects.length > 0 && (
          <ul className="absolute z-10 bg-white border border-gray-300 w-full mt-1 rounded-md shadow-md max-h-60 overflow-auto">
            {filteredProjects.map((project) => (
              <li
                key={project._id}
                className="p-2 cursor-pointer hover:bg-gray-100"
                onClick={() => handleSelectProject(project.projectName)}
              >
                {project.projectName}
              </li>
            ))}
          </ul>
        )}
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
              {t("Only_PDF_files_are_allowed")}, {t("up_to")} 5MB
            </p>
            <input
              type="file"
              accept=".pdf"
              ref={fileInputRef}
              className="hidden"
              onChange={(e) => setSelectedFile(e.target.files[0])}
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
            onClick={() => {}}
          >
            {t("Upload_Changes")}
          </button>
        </div>
      </div>
    </>
  );
};

export default SubmitDocument;
