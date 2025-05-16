import { useState, useEffect, useCallback } from "react";
import { Avatar, Box, Rating, Typography } from "@mui/material";
import img1 from "../../../assets/Image (1).svg";
import "../../../utils/i18n";
import { useTranslation } from "react-i18next";
import apiRequest from "../../../utils/apiRequest";
import { useSelector } from "react-redux";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import { Navigation } from "swiper/modules";
import { useParams } from "react-router-dom";

const ClientEvaluationId = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [allProjects, setAllProjects] = useState([]);
  const { t } = useTranslation();
  const token = useSelector((state) => state.auth.userToken);
  const userName = useSelector((state) => state.auth.userInfo?.userName);
  const { projectId } = useParams();
  const { id } = useParams();
  console.log("REVIEWS", reviews);
  

  const fetchReviews = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const response = await apiRequest("get", `/reviews/${id}`, {}, token);
      const reviewsData = Array.isArray(response?.data?.data)
        ? response.data.data
        : [];

      const projectsMap = new Map();
      const formattedReviews = reviewsData.map((review) => {
        const project = review.project || {};
        const projectKey = project._id || "default";

        if (!projectsMap.has(projectKey)) {
          projectsMap.set(projectKey, {
            projectId: project._id,
            projectName: project?.projectName || t("Unnamed_Project"),
            projectBanner: project?.projectBanner || [],
            projectOwners:
              project?.projectOwners?.map((owner) => ({
                ownerName: owner.ownerName || t("Unknown_Owner"),
              })) || [],
          });
        }

        return {
          _id: review._id,
          userId: {
            _id: review.userId,
            name: userName,
            avatar: null,
          },
          projectId: project._id,
          projectName: project?.projectName || t("Unnamed_Project"),
          message: review.message,
          rating: review.rating,
          createdAt: review.createdAt,
        };
      });

      const projectsArray = Array.from(projectsMap.values());
      setAllProjects(projectsArray);

      let initialProject = null;
      if (projectId) {
        initialProject = projectsArray.find((p) => p.projectId === projectId);
      }
      if (!initialProject && projectsArray.length > 0) {
        initialProject = projectsArray[0];
      }
      setSelectedProject(initialProject);

      setReviews(formattedReviews);
    } catch (error) {
      setReviews([]);
      setAllProjects([]);
    } finally {
      setLoading(false);
    }
  }, [token, t, userName, projectId, id]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  if (loading) {
    return <div className="p-6 min-h-screen font-raleway">Loading...</div>;
  }

  if (error) {
    return <div className="p-6 min-h-screen font-raleway">{error}</div>;
  }

  return (
    <>
      <div className={`relative brightness-50" : ""}`}>
        <div className="p-6 min-h-screen font-raleway">
          <div className="bg-white rounded-lg shadow-md overflow-hidden p-6">
            {selectedProject && (
              <div className="mb-8">
                <Swiper
                  modules={[Navigation]}
                  slidesPerView={1}
                  navigation={{
                    nextEl: ".custom-next",
                    prevEl: ".custom-prev",
                  }}
                  className="w-full h-64 relative"
                >
                  <div className="absolute top-1/2 left-4 z-10 -translate-y-1/2">
                    <button className="custom-prev bg-white rounded-full h-10 w-10 flex items-center justify-center shadow-md hover:bg-gray-100 transition-colors">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-black"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 19l-7-7 7-7"
                        />
                      </svg>
                    </button>
                  </div>

                  <div className="absolute top-1/2 right-4 z-10 -translate-y-1/2">
                    <button className="custom-next bg-white rounded-full h-10 w-10 flex items-center justify-center shadow-md hover:bg-gray-100 transition-colors">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-black"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                  </div>

                  {selectedProject.projectBanner.length > 0 ? (
                    selectedProject.projectBanner.map((banner, index) => (
                      <SwiperSlide key={index}>
                        <img
                          src={banner.url || img1}
                          alt={`Project Banner ${index + 1}`}
                          className="w-full h-64 object-cover"
                        />
                      </SwiperSlide>
                    ))
                  ) : (
                    <SwiperSlide>
                      <img
                        src={img1}
                        alt="Default Project Banner"
                        className="w-full h-64 object-cover"
                      />
                    </SwiperSlide>
                  )}
                </Swiper>
                <div className="p-6">
                  <h2 className="text-2xl font-bold text-gray-800">
                    {selectedProject.projectName}
                  </h2>
                  <p className="text-gray-600 mt-1">
                    <span className="font-semibold">{t("Project_Owner")}:</span>{" "}
                    {selectedProject.projectOwners?.[0]?.ownerName ||
                      t("Unknown_Owner")}
                  </p>
                </div>
              </div>
            )}

            {reviews.length === 0 ? (
              <Typography variant="body1" className="p-6 text-center">
                {t("No_Reviews_Available")}
              </Typography>
            ) : (
              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {reviews.map((review, index) => (
                  <Box
                    key={index}
                    className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center mb-4">
                      <Avatar
                        src={review.userId?.avatar || "placeholder.svg"}
                        alt={review.userId?.name || "Anonymous"}
                      />
                      <div className="ml-3 w-full">
                        <div className="flex justify-between items-center">
                          <p className="text-gray-800 font-medium">
                            {review?.userId?._id?.userName || t("Anonymous")}
                          </p>
                          <p className="text-gray-600 text-[0.7rem]">
                            {review.createdAt
                              ? new Date(review.createdAt).toLocaleDateString(
                                  "en-US",
                                  {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                  }
                                )
                              : ""}
                          </p>
                        </div>
                        <Rating
                          name={`rating-${index}`}
                          value={review.rating || 0}
                          readOnly
                          size="small"
                        />
                        <span className="text-lightpurple-light text-[0.7rem]">
                          ({review.rating || 0} {t("Stars")})
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-700 mt-2 text-sm line-clamp-3">
                        {review.message || t("No_Review_Message")}
                      </p>
                    </div>
                  </Box>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ClientEvaluationId;