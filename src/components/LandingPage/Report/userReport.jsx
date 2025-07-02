import { useEffect, useState } from "react";
import arrow from "../../../assets/arrow.svg";
import { useNavigate } from "react-router-dom";
import { Button } from "@mui/material";
import "../../../utils/i18n";
import { useTranslation } from "react-i18next";
import { MdDeleteOutline } from "react-icons/md";
import apiRequest from "../../../utils/apiRequest";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

const DocumentList = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const token = useSelector((state) => state.auth.userToken);

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      try {
        const response = await apiRequest("get", "/documents", {}, token);

        if (response?.status === 200) {
          setDocuments(response?.data || []);
        }
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [token]);

  const handleDeleteDocument = (id) => {
    apiRequest("delete", `/documents/${id}`, {}, token)
      .then((response) => {
        if (response?.status === 200) {
          setDocuments(documents.filter((doc) => doc._id !== id));
          toast.success(t("Document deleted successfully!"));
        }
      })
      .catch((error) => {
      });
  };

  return (
    <>
      <div className="flex justify-between items-center w-full h-auto md:h-14 px-4 my-4">
        <div className="flex items-center w-auto">
          <div className="bg-white px-2 py-2 text-center rounded-full">
            <img src={arrow} alt="Back" className="w-3 h-3" />
          </div>
          <span className="text-black font-semibold text-sm mx-3">
            {t("All_Reports")}
          </span>
        </div>

        <div className="w-full flex justify-end p-4">
          <Button
            variant="contained"
            sx={{
              backgroundColor: "black",
              color: "white",
              textTransform: "none",
              "&:hover": {
                backgroundColor: "#333333",
              },
            }}

            onClick={() => navigate("/submitReport")}
          >
            + {t("Create_New_Report")}
          </Button>
        </div>
      </div>

      <div className="p-4">
        <div className="rounded-md p-4 space-y-4">
          {documents.map((doc, index) => {
            let statusColor = "bg-gray-500"; // Default color for unknown status
            if (doc.status === "pending") statusColor = "bg-black-blacknew";
            if (doc.status === "rejected") statusColor = "bg-red-500";
            if (doc.status === "approved") statusColor = "bg-green-500";

            return (
              <div
                key={index}
                className="flex items-center justify-between bg-white shadow-md rounded-md py-3 px-4"
              >
                <div className="flex items-center space-x-4">
                  <img
                    src="document-text.svg"
                    alt="Document"
                    className="w-10 h-10 -mt-8 object-cover rounded-full"
                  />
                  <div>
                    <p className="text-gray-700 font-medium">{doc.fileName}</p>
                    <p className="text-gray-500 my-1 text-sm">
                      Size: {(doc.fileSize / 1024).toFixed(2)} KB
                    </p>
                    <p className="text-gray-500 text-sm">
                      Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <MdDeleteOutline
                    size={20}
                    className="text-[#353535] cursor-pointer"
                    onClick={() => handleDeleteDocument(doc._id)}
                  />

                  <div
                    className={`mt-2.5 px-3 py-[1px] text-white rounded-full ${statusColor}`}
                  >
                    <button>
                      {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                    </button>
                  </div>

                  <div>
                    <button
                      className="text-blue-600 text-sm underline"
                      onClick={() => window.open(doc.fileUrl, "_blank")}
                    >
                      View Report
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default DocumentList;
