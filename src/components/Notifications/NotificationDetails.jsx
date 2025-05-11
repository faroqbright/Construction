import {
  Box,
  Typography,
  Card,
  CardContent,
  Paper,
  Grid,
  Divider,
  CircularProgress,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import apiRequest from "../../utils/apiRequest";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";

const BannerContainer = styled(Box)(({ theme }) => ({
  position: "relative",
  width: "100%",
  height: 300,
  marginBottom: theme.spacing(3),
  borderRadius: theme.shape.borderRadius,
  overflow: "hidden",
}));

const BannerImage = styled("img")({
  width: "100%",
  height: "100%",
  objectFit: "cover",
});

const BannerOverlay = styled(Box)({
  position: "absolute",
  bottom: 0,
  left: 0,
  right: 0,
  background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)",
  padding: 24,
});

const NotificationDetails = () => {
  const { id } = useParams();
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = useSelector((state) => state?.auth?.userToken);

  useEffect(() => {
    if (id) {
      fetchNotification(id);
      markAsRead(id);
    }
  }, [id]);

  const fetchNotification = async (id) => {
    try {
      const response = await apiRequest(
        "get",
        `/shownotifications/${id}`,
        {},
        token
      );
      if (response.data?.success) {
        setNotification(response.data.data);
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };  

  const markAsRead = async (id) => {
    try {
      await apiRequest(
        "patch",
        `/shownotifications/${id}`,
        { isRead: true },
        token
      );
      setNotification((prev) => (prev ? { ...prev, isRead: true } : null));
    } catch (error) {
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" mt={10}>
        <CircularProgress />
      </Box>
    );
  }

  if (!notification) {
    return (
      <Box textAlign="center" mt={10}>
        <Typography variant="h6" color="error">
          Notification not found.
        </Typography>
      </Box>
    );
  }

  const { title, createdAt, lengthyDesc, projectDetails, isRead } =
    notification;

  const bannerUrl = projectDetails?.banner?.[0]?.url ?? "/defaultBanner.jpg";

  return (
    <Paper
      elevation={0}
      sx={{
        maxWidth: 5000,
        mx: "auto",
        borderRadius: 2,
        overflow: "hidden",
        boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
      }}
    >
      <Box sx={{ p: 3, display: "flex", alignItems: "center" }}>
        <Typography variant="h5" fontWeight="bold">
          Notification Details
        </Typography>
      </Box>

      <BannerContainer>
        <BannerImage src={bannerUrl} alt={projectDetails?.name || "Project"} />
        <BannerOverlay>
          <Typography variant="h4" color="white" fontWeight="bold">
            {projectDetails?.name}
          </Typography>
        </BannerOverlay>
      </BannerContainer>

      <Box sx={{ p: 3 }}>
        <Card
          elevation={0}
          sx={{
            mb: 3,
            border: "1px solid rgba(0,0,0,0.08)",
            backgroundColor: isRead ? "white" : "background.paper",
            position: "relative",
            "&::before": !isRead
              ? {
                  content: '""',
                  position: "absolute",
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: 4,
                  backgroundColor: "primary.main",
                  borderTopLeftRadius: 4,
                  borderBottomLeftRadius: 4,
                }
              : {},
          }}
        >
          <CardContent>
            <Grid
              container
              justifyContent="space-between"
              alignItems="flex-start"
            >
              <Grid item>
                <Typography
                  variant="h6"
                  fontWeight="medium"
                  color="text.primary"
                >
                  {title}
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    mt: 1,
                    color: "text.secondary",
                  }}
                >
                  <CalendarTodayIcon sx={{ fontSize: 16, mr: 0.5 }} />
                  <Typography variant="body2" sx={{ mr: 2 }}>
                    {new Date(createdAt).toLocaleDateString()}
                  </Typography>
                  <AccessTimeIcon sx={{ fontSize: 16, mr: 0.5 }} />
                  <Typography variant="body2">
                    {new Date(createdAt).toLocaleTimeString()}
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            <Divider sx={{ my: 2 }} />

            <Box>
              <Typography
                variant="subtitle1"
                fontWeight="medium"
                color="text.primary"
                gutterBottom
              >
                Description
              </Typography>
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{ lineHeight: 1.6, whiteSpace: "pre-line" }}
              >
                {lengthyDesc?.replace(/\/\//g, '\n')}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Paper>
  );
};

export default NotificationDetails;