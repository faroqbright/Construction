
import React, { useState } from "react";
import { Avatar, Box, Rating } from "@mui/material";
import { FiBell } from "react-icons/fi";
import img1 from "../../../assets/Image (1).svg";
import arrow from "../../../assets/arrow.svg";
import noti from "../../../assets/notif.svg";

const ClientEvaluation = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const toggleModal = () => {
    setIsModalOpen((prev) => !prev);
  };

  const reviews = [
    {
      name: "Ralph Edwards",
      rating: 5,
      date: "02 Days Ago",
      message:
        "Architecto consequatur molestias repellat qui. Quis est eos doloremque veniam est rerum. Soluta.",
      avatar: "IMG.svg", // Replace with actual avatar URL
    },
    {
      name: "Kevin Hunt",
      rating: 5,
      date: "02 Days Ago",
      message:
        "Architecto consequatur molestias repellat qui. Quis est eos doloremque veniam est rerum. Soluta.",
      avatar: "placeholder.svg",
    },
    {
      name: "Isabelle",
      rating: 5,
      date: "02 Days Ago",
      message:
        "Architecto consequatur molestias repellat qui. Quis est eos doloremque veniam est rerum. Soluta.",
      avatar: "placeholder (1).svg",
    },
    {
      name: "Ralph Edwards",
      rating: 5,
      date: "02 Days Ago",
      message:
        "Architecto consequatur molestias repellat qui. Quis est eos doloremque veniam est rerum. Soluta.",
      avatar: "IMG.svg", // Replace with actual avatar URL
    },
    {
      name: "Kevin Hunt",
      rating: 5,
      date: "02 Days Ago",
      message:
        "Architecto consequatur molestias repellat qui. Quis est eos doloremque veniam est rerum. Soluta.",
      avatar: "placeholder.svg",
    },
    {
      name: "Isabelle",
      rating: 5,
      date: "02 Days Ago",
      message:
        "Architecto consequatur molestias repellat qui. Quis est eos doloremque veniam est rerum. Soluta.",
      avatar: "placeholder (1).svg",
    },
  ];

  return (
    <>
      <div className={`relative ${isModalOpen ? "brightness-50" : ""}`}>
        <div className="p-6  min-h-screen font-raleway">
          {/* Card Container */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden p-6">
            {/* Project Image */}
            <img
              src={img1} // Replace with your image URL
              alt="Project"
              className="w-full h-64 object-cover"
            />

            {/* Project Details */}
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-800">
                Oceanview Plaza
              </h2>
              <p className="text-gray-600 mt-1">
                <span className="font-semibold">Project Owner:</span> John Doe
              </p>
            </div>

            {/* Reviews Section */}
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {reviews.map((review, index) => (
                <Box
                  key={index}
                  onClick={toggleModal}
                  className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm cursor-pointer"
                >
                  <div className="flex items-center mb-4">
                    <Avatar src={review.avatar} alt={review.name} />
                    <div className="ml-3">
                      <div className="flex justify-between text-nowrap">
                        <p className="text-gray-800 font-medium">
                          {review.name}
                        </p>
                        <p className="text-gray-600 text-[0.6rem] flex justify-end">
                          {review.date}
                        </p>
                      </div>
                      <Rating
                        name={`rating-${index}`}
                        value={review.rating}
                        readOnly
                        size="small"
                      />
                      <span className="text-lightpurple-light text-[0.7rem] pb-5">
                        (5 Stars)
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-700 mt-2 text-sm">
                      {review.message}
                    </p>
                  </div>
                </Box>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && <ClientModal toggleModal={toggleModal} />}
    </>
  );
};

const ClientModal = ({ toggleModal }) => {
  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center bg-black bg-opacity-50">
      <div className="w-[400px] bg-white rounded-lg shadow-lg p-6 relative">
        {/* Close Button */}
        <button
          onClick={toggleModal}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
        >
          &times;
        </button>

        {/* Header Section */}
        <div className="flex items-center space-x-4">
          <img
            src="placeholder.svg"
            alt="User Avatar"
            className="w-12 h-12 rounded-full"
          />
          <div>
            <h2 className="text-lg font-bold">John Doe</h2>
            <div className="flex items-center">
              {/* Stars */}
              <div className="flex text-yellow-500">
                {[...Array(4)].map((_, index) => (
                  <svg
                    key={index}
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    className="w-4 h-4"
                    viewBox="0 0 16 16"
                  >
                    <path d="M3.612 15.443c-.396.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.32-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.63.283.95l-3.523 3.356.83 4.73c.078.443-.35.79-.746.592L8 13.187l-4.389 2.256z" />
                  </svg>
                ))}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  className="w-4 h-4 text-gray-300"
                  viewBox="0 0 16 16"
                >
                  <path d="M3.612 15.443c-.396.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.32-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.63.283.95l-3.523 3.356.83 4.73c.078.443-.35.79-.746.592L8 13.187l-4.389 2.256z" />
                </svg>
              </div>
              <span className="ml-2 text-sm text-gray-500">(5 Stars)</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <p className="mt-4 text-gray-600 leading-relaxed">
          Architecto consequatur molestias repleat qui. Quia est asd doloremque
          veniam est rerum. Soluta Quia est asd doloremque.
        </p>

        {/* Close Button */}
        <button
          onClick={toggleModal}
          className="mt-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default ClientEvaluation;


