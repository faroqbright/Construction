import React from "react";
import { FiDownload, FiEye } from "react-icons/fi"; // Import icons from react-icons
import jsPDF from "jspdf";
import arrow from "../../../assets/arrow.svg";
import noti from "../../../assets/notif.svg";

import { TextField, InputAdornment, Avatar, Stack, Chip } from "@mui/material";
import { NavLink } from "react-router-dom";
const DocumentList = () => {
  // Function to download a PDF
  const handleDownload = () => {
    const doc = new jsPDF();
    doc.text("This is a sample PDF document.", 10, 10);
    doc.save("documentreport.pdf");
  };

  const documents = Array(8).fill({
    name: "documentreport.pdf",
    date: "12/09/2024",
    message: "document-text.svg",
  });

  return (
    <>
      <div className="flex justify-between items-center w-full h-auto md:h-14 px-4 my-4">
        {/* Left Section */}
        <div className="flex items-center w-auto">
          <div className="bg-white px-2 py-2 text-center rounded-full">
            <img src={arrow} alt="Back" className="w-3 h-3" />
          </div>
          <span className="text-black font-semibold text-sm mx-3">
            All Projects
          </span>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-6">
          <img
            src={noti}
            alt="Notification Icon"
            className="cursor-pointer w-5 h-5"
          />
          <Avatar
            alt="User"
            src="https://i.pravatar.cc/40"
            className="border border-gray-300"
            sx={{ width: 36, height: 36 }}
          />
        </div>
      </div>

      <div className="p-4">
        <div className=" rounded-md p-4 space-y-4">
          {documents.map((doc, index) => (
            <div
              key={index}
              className="flex items-center justify-between bg-white shadow-md rounded-md py-3 px-4"
            >
              {/* Left Section: Image and Document Info */}
              <div className="flex items-center space-x-4">
                <img
                  src={doc.message}
                  alt="Document"
                  className="w-10 h-10 object-cover rounded-full"
                />
                <div>
                  <p className="text-gray-700 font-medium">{doc.name}</p>
                  <p className="text-gray-500 text-sm">{doc.date}</p>
                </div>
              </div>

              {/* Right Section: Action Buttons */}
              <div className="flex items-center space-x-2">
                <NavLink to="/report-name">
                  {" "}
                  <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full">
                    <FiEye size={20} />
                  </button>
                </NavLink>

                <button
                  onClick={handleDownload}
                  className="p-2  hover:bg-blue-100 rounded-full"
                >
                  <FiDownload size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default DocumentList;

// import React from "react";
// import arrow from "../../assets/arrow.svg";
// import noti from "../../assets/notif.svg";
// import { TextField, InputAdornment, Avatar, Stack, Chip } from "@mui/material";
// const DocumentList = () => {
//   return (
//     <>
//         <div className="flex justify-between items-center w-full h-auto md:h-14 px-4 my-4">
//         {/* Left Section */}
//         <div className="flex items-center w-auto">
//           <div className="bg-white px-2 py-2 text-center rounded-full">
//             <img src={arrow} alt="Back" className="w-3 h-3" />
//           </div>
//           <span className="text-black font-semibold text-sm mx-3">
//          Report Name
//           </span>
//         </div>

//         {/* Right Section */}
//         <div className="flex items-center space-x-6">
//           <img
//             src={noti}
//             alt="Notification Icon"
//             className="cursor-pointer w-5 h-5"
//           />
//           <Avatar
//             alt="User"
//             src="https://i.pravatar.cc/40"
//             className="border border-gray-300"
//             sx={{ width: 36, height: 36 }}
//           />
//         </div>
//       </div>
//     <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
//       <div className="bg-white border border-gray-300 shadow-md rounded-lg p-6 w-full max-w-4xl">
//         {/* Title */}
//         <h1 className="text-lg font-semibold mb-4">Lorem Ipsum</h1>

//         {/* Content */}
//         <div className="space-y-4 text-gray-700">
//           {Array.from({ length: 10 }).map((_, index) => (
//             <p key={index}>
//               Lorem ipsum dolor sit amet consectetur. Libero non morbi pellentesque vestibulum.
//               Scelerisque lectus nec integer interdum. Risus massa eleifend a amet sem ac nulla
//               vulputate. Luctus aliquam lacus pulvinar dictum id sit venenatis dictum. Risus
//               suspendisse egestas velit non fermentum feugiat ac. Tristique tellus et vulputate
//               ultricies faucibus eget potenti. In aliquet vulputate viverra mattis neque. Nula
//               dictum vitae eleifend.
//             </p>
//           ))}
//         </div>
//       </div>
//     </div>
//     </>
//   );
// };

// export default DocumentList;
