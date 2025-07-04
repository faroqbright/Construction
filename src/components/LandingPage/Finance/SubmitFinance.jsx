import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import apiRequest from "../../../utils/apiRequest";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function SubmitFinance() {
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedProject, setSelectedProject] = useState("");
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const token = useSelector((state) => state?.auth?.userToken);
  const user = useSelector((state) => state?.auth?.userInfo?.userName);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [fileName, setFileName] = useState("");
  const [reference, setreference] = useState("");

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      try {
        const response = await apiRequest("get", "/projects", {}, token);
        if (response?.data?.statusCode === 200) {
          const projectsData = response?.data?.data?.projects || [];
          setProjects(projectsData);
          setFilteredProjects(projectsData.slice(0, 6)); 
        }
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [token]);

  useEffect(() => {
    const filtered = projects.filter((project) =>
      project.projectName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (searchTerm === "") {
      setFilteredProjects(filtered.slice(0, 6));
    } else {
      setFilteredProjects(filtered);
    }
  }, [searchTerm, projects]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    const maxSize = 5 * 1024 * 1024;

    if (file) {
      if (file.type !== "application/pdf") {
        toast.error(t("Only PDF files are allowed!"));
        return;
      }

      if (file.size > maxSize) {
        toast.error(t("Selected file should not be greater than 5MB."));
        return;
      }

      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !selectedProject) {
      toast.info(t("Please select a project and upload a PDF file."));
      return;
    }

    // if (!fileName) {
    //   toast.info(t("Please enter a filename."));
    //   return;
    // }
    if (!reference) {
      toast.info(t("Please enter a Reference No."));
      return;
    }

    setUploading(true);

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("projName", selectedProject);
    // formData.append("fileName", fileName);
    formData.append("user", user);
    formData.append("reference", reference);

    try {
      const response = await apiRequest("post", "/finance", formData, token, {
        "Content-Type": "multipart/form-data",
      });
      console.log(response);

      if (response?.status === 200 || response?.status === 201) {
        toast.success(t("File uploaded successfully!"));
        setSelectedFile(null);
        setSelectedProject("");
        // setFileName("");
        setreference("");
        navigate("/finance");
      }
    } catch (error) {
      toast.error(t(error.response.data.error));
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <h1 className="font-semibold text-2xl mx-4 mb-3">
        {t("Project_Billing_Details")}
      </h1>

      <div className="mx-4 mb-3">
        <h3>
          {t("Project_Name")}{" "}
          <span className="text-red-600 text-xl pr-1">*</span>
        </h3>
        <div className="relative">
          <div
            className="mt-2 border border-gray-300 rounded-md p-2 w-full cursor-pointer"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            {selectedProject || t("Select_a_Project")}
          </div>
          {isDropdownOpen && (
            <div className="absolute z-10 mt-2 w-full bg-white border border-gray-300 rounded-md shadow-lg">
              <input
                type="text"
                placeholder={t("Search_projects...")}
                className="p-2 border-b border-gray-300 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="max-h-60 overflow-y-auto">
                {loading ? (
                  <div className="p-2">{t("Loading")}...</div>
                ) : filteredProjects.length > 0 ? (
                  filteredProjects.map((project) => (
                    <div
                      key={project._id}
                      className="p-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => {
                        setSelectedProject(project.projectName);
                        setIsDropdownOpen(false);
                      }}
                    >
                      {project.projectName}
                    </div>
                  ))
                ) : (
                  <div className="p-2">{t("No_projects_found")}.</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* <div className="mx-4 mb-3">
        <h3>
          {t("Filename")}{" "}
          <span className="text-red-600 text-xl pr-1">*</span>
        </h3>
        <input
          type="text"
          className="mt-2 border border-gray-300 rounded-md p-2 w-full"
          placeholder={t("Enter_Filename")}
          value={fileName}
          onChange={(e) => setFileName(e.target.value)}
        />
      </div> */}

      <div className="mx-4 mb-3">
        <h3>
          {t("Reference")}{" "}
          <span className="text-red-600 text-xl pr-1">*</span>
        </h3>
        <input
          type="text"
          className="mt-2 border border-gray-300 rounded-md p-2 w-full"
          placeholder={t("Enter_Reference")}
          value={reference}
          onChange={(e) => setreference(e.target.value)}
        />
      </div>

      <div className="mx-4 mb-3">
        <h1 className="font-semibold mb-3 text-2xl">{t("Upload_Invoice")}</h1>
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
      </div>

      <div className="items-center flex flex-col justify-center mt-5">
        <button
          className="bg-black-blacknew text-white font-bold py-3 rounded-lg w-72 lg:w-1/2"
          onClick={handleUpload}
          disabled={uploading}
        >
          {uploading ? `${t("Uploading...")}` : `${t("Upload_Invoice")}`}
        </button>
      </div>
    </>
  );
}