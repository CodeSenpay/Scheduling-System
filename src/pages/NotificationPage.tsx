import {
  Box,
  Card,
  CardContent,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useEffect, useState } from "react";
import Loading from "../components/Loading";
import NavBar from "../components/NavBar";
import { notifyError } from "../components/ToastUtils";
import apiClient from "../services/apiClient";
import { useUser } from "../services/UserContext";

type NotificationProps = {
  notification_id: string;
  date: string;
  message: string;
  school_year: string;
  transaction_type: string;
  status?: string;
};

export default function NotificationPage() {
  const [notifications, setNotifications] = useState<NotificationProps[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { userdata } = useUser();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      // TODO: Replace with your actual API endpoint
      const response = await apiClient.post(
        "/scheduling-system/user",
        {
          model: "notificationsModel",
          function_name: "getNotifications",
          payload: {
            user_id: userdata?.student_id,
          },
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      console.log(response.data);
      if (response.data.success) {
        setNotifications(response.data.data);
      } else {
        notifyError("Failed to fetch notifications");
      }
    } catch (error: any) {
      console.error("Error fetching notifications:", error.message);
      // For demo purposes, set mock data if API fails
      setNotifications([
        {
          notification_id: "1",
          date: "2024-11-10",
          message: "Your subsidy payout appointment has been approved",
          school_year: "2024-2025",
          transaction_type: "Subsidy Payout",
          status: "approved",
        },
        {
          notification_id: "2",
          date: "2024-11-09",
          message: "Your clearance validation is pending review",
          school_year: "2024-2025",
          transaction_type: "Clearance Validation",
          status: "pending",
        },
        {
          notification_id: "3",
          date: "2024-11-08",
          message: "Your school ID claiming appointment has been scheduled",
          school_year: "2024-2025",
          transaction_type: "School ID Claiming",
          status: "scheduled",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return "success";
      case "pending":
        return "warning";
      case "declined":
        return "error";
      default:
        return "info";
    }
  };

  return (
    <Box>
      {isLoading && <Loading />}
      <NavBar />
      <Box
        style={{
          backgroundColor: "#f3f4f6",
          backgroundImage: `
            repeating-linear-gradient(135deg, #e5e7eb 0px, #e5e7eb 2px, transparent 2px, transparent 40px),
            repeating-linear-gradient(225deg, #e5e7eb 0px, #e5e7eb 2px, transparent 2px, transparent 40px)
          `,
          backgroundSize: "40px 40px",
        }}
        sx={{
          minHeight: "100vh",
          paddingTop: { xs: "80px", md: "100px" },
          paddingBottom: "40px",
          paddingX: { xs: 2, sm: 3, md: 4 },
        }}
      >
        <Box sx={{ maxWidth: "1200px", margin: "0 auto" }}>
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontWeight: "bold",
              color: "#1f2937",
              marginBottom: 3,
              fontSize: { xs: "1.5rem", md: "2rem" },
              textAlign: "center",
            }}
          >
            Notifications
          </Typography>

          {notifications.length === 0 && !isLoading ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: "300px",
              }}
            >
              <Typography variant="h6" color="text.secondary">
                No notifications yet
              </Typography>
            </Box>
          ) : isMobile ? (
            // Mobile Card View
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {notifications.map((notification) => (
                <Card
                  key={notification.notification_id}
                  sx={{
                    boxShadow: 3,
                    transition: "transform 0.2s",
                    "&:hover": {
                      transform: "scale(1.02)",
                    },
                  }}
                >
                  <CardContent>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: 1,
                      }}
                    >
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ fontWeight: "bold" }}
                      >
                        {notification.date}
                      </Typography>
                      {notification.status && (
                        <Chip
                          label={notification.status}
                          color={getStatusColor(notification.status)}
                          size="small"
                        />
                      )}
                    </Box>
                    <Typography
                      variant="body1"
                      sx={{ marginBottom: 1, fontWeight: "500" }}
                    >
                      {notification.message}
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 0.5,
                        marginTop: 2,
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        <strong>Transaction:</strong>{" "}
                        {notification.transaction_type}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        <strong>School Year:</strong> {notification.school_year}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          ) : (
            // Desktop Table View
            <TableContainer
              component={Paper}
              sx={{
                boxShadow: 3,
                borderRadius: 2,
                overflow: "hidden",
              }}
            >
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#f59e0b" }}>
                    <TableCell
                      sx={{
                        fontWeight: "bold",
                        color: "white",
                        fontSize: "1rem",
                      }}
                    >
                      Date
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: "bold",
                        color: "white",
                        fontSize: "1rem",
                      }}
                    >
                      Message
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: "bold",
                        color: "white",
                        fontSize: "1rem",
                      }}
                    >
                      School Year
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: "bold",
                        color: "white",
                        fontSize: "1rem",
                      }}
                    >
                      Transaction Type
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: "bold",
                        color: "white",
                        fontSize: "1rem",
                      }}
                    >
                      Status
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {notifications.map((notification, index) => (
                    <TableRow
                      key={notification.notification_id}
                      sx={{
                        "&:nth-of-type(odd)": {
                          backgroundColor: "#f9fafb",
                        },
                        "&:hover": {
                          backgroundColor: "#fef3c7",
                        },
                      }}
                    >
                      <TableCell>{notification.date}</TableCell>
                      <TableCell sx={{ maxWidth: "300px" }}>
                        {notification.message}
                      </TableCell>
                      <TableCell>{notification.school_year}</TableCell>
                      <TableCell>{notification.transaction_type}</TableCell>
                      <TableCell>
                        {notification.status && (
                          <Chip
                            label={notification.status}
                            color={getStatusColor(notification.status)}
                            size="small"
                          />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      </Box>
    </Box>
  );
}
