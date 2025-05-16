import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Rating,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CircularProgress,
  Alert,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import img1 from "../../../assets/Image (1).svg";
import "../../../utils/i18n";
import { useTranslation } from "react-i18next";
import apiRequest from "../../../utils/apiRequest";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const ProjectCardStyled = styled(Card)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  height: "100%",
  transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: theme.shadows[6],
  },
  cursor: "pointer",
}));

const CardMediaStyled = styled(CardMedia)({
  height: 180,
  objectFit: "cover",
});

const SwiperContainer = styled(Box)({
  height: 180,
  width: "100%",
  "& .swiper-pagination-bullet": {
    backgroundColor: "#fff !important",
  },
  "& .swiper-button-next, .swiper-button-prev": {
    color: "#fff !important",
    "&::after": {
      fontSize: "1.5rem",
    },
  },
});

const calculateAverageRating = (reviews) => {
  if (!reviews || reviews.length === 0) return { average: 0, count: 0 };
  const total = reviews.reduce((sum, review) => sum + (review.rating || 0), 0);
  const count = reviews.length;
  return { average: total / count, count };
};

const ClientEvaluation = () => {
  const { t } = useTranslation();
  const token = useSelector((state) => state.auth.userToken);
  const navigate = useNavigate();
  const currentUserId = useSelector((state) => state.auth.userInfo?._id);
  const [projectsData, setProjectsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  console.log("currentUserId", currentUserId);
  
  const fetchReviewsAndProcessProjects = useCallback(async () => {
  try {
    setLoading(true);
    setError(null);
    const response = await apiRequest("get", `/reviews`, {}, token);

    const reviewsData = Array.isArray(response?.data?.data) 
      ? response.data.data 
      : [];

    if (reviewsData.length === 0) {
      console.log("No reviews found.");
      setProjectsData([]);
      return;
    }

    const projectsMap = new Map();

    reviewsData.forEach((review) => {
      const project = review.project || {};
      const projectId = project._id || review.projectId || "fallback-id";
      const projectName = project?.projectName || t("Unnamed_Project");

      const formattedReview = {
        _id: review._id,
        userId: review.userId?._id || null,
        userName: review.userId?.name || t("Anonymous"),
        userAvatar: review.userId?.avatar || null,
        message: review.message,
        rating: review.rating,
        createdAt: review.createdAt,
      };

      if (projectsMap.has(projectId)) {
        projectsMap.get(projectId).reviews.push(formattedReview);
      } else {
        projectsMap.set(projectId, {
          id: projectId,
          name: projectName,
          banners: project?.projectBanner?.map((b) => b.url) || [img1],
          owners: project?.projectOwners?.map((b) => b.ownerName) || [t("Unknown_Owner")],
          reviews: [formattedReview],
        });
      }
    });

    const processedProjects = Array.from(projectsMap.values());
    console.log("Processed Projects:", processedProjects); // Debug

    setProjectsData(processedProjects);
  } catch (err) {
    console.error("API Error:", err); // Debug
    setError(t("Failed To Load Data"));
    setProjectsData([]);
  } finally {
    setLoading(false);
  }
}, [token, t, currentUserId]);

  useEffect(() => {
    fetchReviewsAndProcessProjects();
  }, [fetchReviewsAndProcessProjects]);

  const handleProjectClick = (projectId) => {
    navigate(`/client-evaluations/${projectId}`);
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box p={3} sx={{ backgroundColor: "#f8f9fa" }}>
      <Typography
        variant="h4"
        gutterBottom
        sx={{ mb: 3, fontWeight: "bold", color: "#333" }}
      >
        {t("Client_Evaluation")}
      </Typography>
      {projectsData.length === 0 ? (
        <Typography
          variant="body1"
          align="center"
          sx={{ mt: 4, color: "grey.700" }}
        >
          {t("No_Projects_Found")}
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {projectsData.map((project) => (
            <Grid item xs={12} sm={6} md={4} key={project.id}>
              <ProjectCard
                project={project}
                onClick={() => handleProjectClick(project.id)}
              />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

const ProjectCard = ({ project, onClick }) => {
  const { t } = useTranslation();
  const estimatedRating = (Math.random() * 2 + 3).toFixed(1);

  return (
    <ProjectCardStyled onClick={onClick}>
      {project.banners.length > 1 ? (
        <SwiperContainer>
          <Swiper
            modules={[Pagination]}
            spaceBetween={0}
            slidesPerView={1}
            pagination={{ clickable: true }}
            loop
          >
            {project.banners.map((banner, index) => (
              <SwiperSlide key={index}>
                <CardMediaStyled
                  image={banner}
                  title={`${project.name}-${index}`}
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </SwiperContainer>
      ) : (
        <CardMediaStyled
          image={project.banners[0] || img1}
          title={project.name}
        />
      )}
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography gutterBottom variant="h6" component="div" noWrap>
          {project.name}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          <span style={{ fontWeight: "bold" }}>{t("Project_Owner")}:</span>{" "}
          {project.owners || t("Unknown_Owner")}
        </Typography>
        <Box display="flex" alignItems="center" mt={1}>
          <Rating
            name={`rating-summary-${project.id}`}
            value={parseFloat(estimatedRating)}
            precision={0.5}
            readOnly
            size="small"
          />
          <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
            ({project.reviewCount} {t("Reviews")})
          </Typography>
        </Box>
      </CardContent>
    </ProjectCardStyled>
  );
};

export default ClientEvaluation;
