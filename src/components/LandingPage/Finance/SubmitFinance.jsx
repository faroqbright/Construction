import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import apiRequest from "../../../utils/apiRequest";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { RadialBarChart, RadialBar, PolarAngleAxis } from "recharts";

const ProgressGauge = ({
  percentage,
  color,
  label,
  onIncrease,
  onDecrease,
}) => {
  return (
    <div className="flex flex-col items-center m-4 relative">
      <RadialBarChart
        width={300}
        height={300}
        cx={150}
        cy={150}
        innerRadius="80%"
        outerRadius="100%"
        barSize={20}
        data={[{ value: percentage }]}
        startAngle={180}
        endAngle={0}
      >
        <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
        <RadialBar
          background={{ fill: "#f0f0f0" }}
          dataKey="value"
          fill={color}
          cornerRadius={5}
          isAnimationActive={false}
        />
      </RadialBarChart>

      {/* Ensure the percentage display doesn't block button clicks */}
      <div
        className="absolute top-[110px] left-[110px] flex items-center justify-center w-16 h-16 rounded-full text-white font-semibold text-lg z-10"
        style={{ backgroundColor: color }}
      >
        {percentage}%
      </div>

      {/* Buttons */}
      <div className="flex items-center -mt-10 z-20">
        <button
          onClick={() => {
            console.log(`Increasing ${label}`);
            onIncrease();
          }}
          className="px-3 py-1 bg-green-600 text-white rounded-lg"
        >
          +
        </button>
        <p className="mx-4 text-black font-semibold">{label}</p>
        <button
          onClick={() => {
            console.log(`Decreasing ${label}`);
            onDecrease();
          }}
          className="px-3 py-1 bg-red-600 text-white rounded-lg"
        >
          -
        </button>
      </div>
    </div>
  );
};
export default function SubmitFinance() {
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
  const [financial, setFinancial] = useState(90);
  const [physical, setPhysical] = useState(75);

  const handleChange = (type, change) => {
    if (type === "financial") {
      setFinancial((prev) => Math.min(100, Math.max(0, prev + change)));
    } else {
      setPhysical((prev) => Math.min(100, Math.max(0, prev + change)));
    }
  };

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
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes

    if (file) {
      if (file.type !== "application/pdf") {
        toast.error("Only PDF files are allowed!");
        return;
      }

      if (file.size > maxSize) {
        toast.error("File size cannot be greater than 5MB!");
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
    formData.append("financialExecution", financial);
    formData.append("physicalExecution", physical);

    try {
      const response = await apiRequest("post", "/finance", formData, token, {
        "Content-Type": "multipart/form-data",
      });
      console.log(response);

      if (response?.status === 200 || response?.status === 201) {
        toast.success("File uploaded successfully!");
        setSelectedFile(null);
        setSelectedProject("");

        navigate("/finance");
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
        {t("Project_Finance_Details")}
      </h1>

      <div className="mx-4 mb-3">
        <h3>
          {t("Project_Name")}{" "}
          <span className="text-red-600 text-xl pr-1">*</span>
        </h3>
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

      <h1 className="font-semibold text-2xl mx-4 mt-10">
        {t("Finance_Execution")}
      </h1>
      <div className="flex flex-col items-center">
        <div className="flex justify-center p-5 flex-col lg:flex-row mt-3">
          <ProgressGauge
            percentage={financial}
            color="#222"
            label={t("Financial_Execution")}
            onIncrease={() => handleChange("financial", 5)}
            onDecrease={() => handleChange("financial", -5)}
          />
          <ProgressGauge
            percentage={physical}
            color="#d32f2f"
            label={t("Physical_Execution")}
            onIncrease={() => handleChange("physical", 5)}
            onDecrease={() => handleChange("physical", -5)}
          />
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
    </>
  );
}
