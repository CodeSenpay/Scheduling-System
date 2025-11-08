import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { BarChart } from "@mui/x-charts";
import { useEffect, useState } from "react";
import { notifyError } from "../components/ToastUtils";
import { useUser } from "../services/UserContext";

// Import Material-UI Icons for better visual representation
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import DashboardIcon from "@mui/icons-material/Dashboard"; // For overall dashboard title
import PermIdentityIcon from "@mui/icons-material/PermIdentity";
import apiClient from "../services/apiClient";

// TypeScript interfaces for API responses
interface TransactionType {
  transaction_title: string;
  transaction_type_id: number;
}

function AdminDashboard() {
  const { userdata } = useUser();

  const [transactionTypes, setTransactionTypes] = useState<TransactionType[]>(
    []
  );
  const [totalSlots, setTotalSlots] = useState<{ [key: number]: number }>({});
  const [totalPendings, setTotalPendings] = useState<number>(0);
  const [pendingPerType, setPendingPerType] = useState<{
    [key: number]: number;
  }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all transaction types
  const fetchTransactionsByType = async () => {
    const data = {
      model: "schedulesModel",
      function_name: "getTransactionType",
      payload: {},
    };
    try {
      const response = await apiClient.post("/scheduling-system/admin", data, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });
      if (response.data.success && Array.isArray(response.data.data)) {
        setTransactionTypes(response.data.data);
      } else {
        notifyError("Can't Fetch Transaction Types");
        setError("Can't Fetch Transaction Types");
      }
    } catch (err) {
      notifyError("Error fetching transaction types");
      setError("Error fetching transaction types");
      console.log(err);
    }
  };

  // Fetch total slots for a transaction_type_id
  const fetchTotalSlots = async (transaction_type_id: number) => {
    const data = {
      model: "schedulesModel",
      function_name: "fetchTotalSlots",
      payload: {
        transaction_type_id,
      },
    };
    try {
      const response = await apiClient.post("/scheduling-system/admin", data, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });

      let slots = 0;
      if (
        response.data.success &&
        Array.isArray(response.data.data) &&
        response.data.data.length > 0 &&
        typeof response.data.data[0].total_available_slots !== "undefined" &&
        response.data.data[0].total_available_slots !== null &&
        response.data.data[0].total_available_slots !== ""
      ) {
        slots = Number(response.data.data[0].total_available_slots);
        if (isNaN(slots)) {
          slots = 0;
          console.warn(
            `total_available_slots is not a number for transaction_type_id ${transaction_type_id}:`,
            response.data.data[0].total_available_slots
          );
        }
        setTotalSlots((prev) => ({
          ...prev,
          [transaction_type_id]: slots,
        }));
        setError(null); // <-- Clear error on success
      } else {
        setTotalSlots((prev) => ({
          ...prev,
          [transaction_type_id]: 0,
        }));
      }
    } catch (err) {
      notifyError("Error fetching total slots");
      setError("Error fetching total slots");
      console.log(err);
    }
  };

  // Fetch total pendings for each transaction type and store in pendingPerType
  const fetchTotalPendings = async () => {
    if (!transactionTypes.length) return;
    let total = 0;
    const pendingMap: { [key: number]: number } = {};
    let allFailed = true; // Track if all pending fetches fail
    for (const type of transactionTypes) {
      const data = {
        model: "schedulesModel",
        function_name: "fetchTotalPendings",
        payload: { transaction_type_id: type.transaction_type_id },
      };
      try {
        const response = await apiClient.post(
          "/scheduling-system/admin",
          data,
          {
            headers: { "Content-Type": "application/json" },
            withCredentials: true,
          }
        );
        const arr = Array.isArray(response.data.data)
          ? response.data.data
          : response.data;
        if (
          Array.isArray(arr) &&
          arr.length > 0 &&
          typeof arr[0].total_pending !== "undefined" &&
          arr[0].total_pending !== null &&
          arr[0].total_pending !== ""
        ) {
          const pending = Number(arr[0].total_pending) || 0;
          total += pending;
          pendingMap[type.transaction_type_id] = pending;
          allFailed = false; // At least one fetch succeeded
        } else {
          pendingMap[type.transaction_type_id] = 0;
        }
      } catch (err) {
        pendingMap[type.transaction_type_id] = 0;
        console.log(err);
      }
    }
    setTotalPendings(total);
    setPendingPerType(pendingMap);
    if (allFailed && transactionTypes.length > 0) {
      // Only show error if there are transaction types but all pending fetches failed
      notifyError("Can't Fetch Pending Appointments");
      setError("Can't Fetch Pending Appointments");
    } else {
      setError(null); // Clear error if at least one pending fetch succeeded
    }
  };

  useEffect(() => {
    setLoading(true);
    setError(null);
    const fetchAll = async () => {
      await fetchTransactionsByType();
    };
    fetchAll();
  }, []);

  useEffect(() => {
    if (transactionTypes.length > 0) {
      transactionTypes.forEach((type) => {
        fetchTotalSlots(type.transaction_type_id);
      });
      fetchTotalPendings();
      setLoading(false);
    } else if (transactionTypes.length === 0 && !loading) {
      // If transaction types are empty after loading, set loading to false
      setLoading(false);
    }
  }, [transactionTypes]);

  const getSlotByTitle = (title: string) => {
    const type = transactionTypes.find((t) => t.transaction_title === title);
    return type ? totalSlots[type.transaction_type_id] || 0 : 0;
  };

  // Loading, error, and empty states
  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: (theme) => theme.palette.background.default,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }
  if (error) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: (theme) => theme.palette.background.default,
          p: 3,
        }}
      >
        <Typography color="error" variant="h6" align="center" gutterBottom>
          Error: {error}
        </Typography>
        <Typography variant="body1" color="text.secondary" align="center">
          Please try refreshing the page or contact support if the issue
          persists.
        </Typography>
      </Box>
    );
  }
  if (transactionTypes.length === 0) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: (theme) => theme.palette.background.default,
        }}
      >
        <Typography variant="h6" color="text.secondary">
          No transaction types found.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Container maxWidth="lg">
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mb: 6,
          }}
        >
          <DashboardIcon color="primary" sx={{ fontSize: 48, mr: 2 }} />
          <Typography
            variant="h3" // Larger, more prominent
            fontWeight="bold"
            color="primary"
            align="center"
            sx={{ textShadow: "0 2px 8px rgba(25, 118, 210, 0.2)" }} // Subtle shadow for depth
          >
            Welcome, {userdata?.first_name}!
          </Typography>
        </Box>

        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 3, // Consistent spacing between cards
            mb: 6,
            justifyContent: { xs: "center", md: "space-between" },
          }}
        >
          {/* Card for Total Slots - Subsidy */}
          <Paper
            elevation={6} // Increased elevation for more prominence
            sx={{
              p: 3,
              borderTop: "6px solid #1976d2", // Thicker border for emphasis
              borderRadius: 3,
              minWidth: 250, // Slightly wider min-width
              flex: "1 1 250px", // Allows flexibility while maintaining min-width
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              transition:
                "transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out", // Smooth transition
              "&:hover": {
                transform: "translateY(-5px)", // Lift effect on hover
                boxShadow: (theme) => theme.shadows[10], // More pronounced shadow on hover
              },
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <AccountBalanceWalletIcon color="primary" fontSize="large" />
              <Typography color="text.secondary" variant="subtitle1">
                Total Slots - Subsidy
              </Typography>
            </Box>
            <Typography variant="h3" color="primary" fontWeight="bold" mt={1}>
              {getSlotByTitle("Subsidy")}
            </Typography>
          </Paper>

          {/* Card for Total Slots - Clearance */}
          <Paper
            elevation={6}
            sx={{
              p: 3,
              borderTop: "6px solid #43a047",
              borderRadius: 3,
              minWidth: 250,
              flex: "1 1 250px",
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              transition:
                "transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
              "&:hover": {
                transform: "translateY(-5px)",
                boxShadow: (theme) => theme.shadows[10],
              },
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CheckCircleOutlineIcon
                sx={{ color: "#43a047" }}
                fontSize="large"
              />
              <Typography color="text.secondary" variant="subtitle1">
                Total Slots - Clearance
              </Typography>
            </Box>
            <Typography
              variant="h3"
              sx={{ color: "#43a047" }}
              fontWeight="bold"
              mt={1}
            >
              {getSlotByTitle("Clearance")}
            </Typography>
          </Paper>

          {/* Card for Total Slots - Claiming ID */}
          <Paper
            elevation={6}
            sx={{
              p: 3,
              borderTop: "6px solid #ffb300",
              borderRadius: 3,
              minWidth: 250,
              flex: "1 1 250px",
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              transition:
                "transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
              "&:hover": {
                transform: "translateY(-5px)",
                boxShadow: (theme) => theme.shadows[10],
              },
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <PermIdentityIcon sx={{ color: "#ffb300" }} fontSize="large" />
              <Typography color="text.secondary" variant="subtitle1">
                Total Slots - Claiming ID
              </Typography>
            </Box>
            <Typography
              variant="h3"
              sx={{ color: "#ffb300" }}
              fontWeight="bold"
              mt={1}
            >
              {getSlotByTitle("Claiming of ID")}
            </Typography>
          </Paper>

          {/* Card for Pending Appointments */}
          <Paper
            elevation={6}
            sx={{
              p: 3,
              borderTop: "6px solid #8e24aa",
              borderRadius: 3,
              minWidth: 250,
              flex: "1 1 250px",
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              transition:
                "transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
              "&:hover": {
                transform: "translateY(-5px)",
                boxShadow: (theme) => theme.shadows[10],
              },
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <AccessTimeIcon sx={{ color: "#8e24aa" }} fontSize="large" />
              <Typography color="text.secondary" variant="subtitle1">
                Pending Appointments
              </Typography>
            </Box>
            <Typography
              variant="h3"
              sx={{ color: "#8e24aa" }}
              fontWeight="bold"
              mt={1}
            >
              {totalPendings}
            </Typography>
          </Paper>
        </Box>

        {/* --- */}
        <Paper elevation={6} sx={{ borderRadius: 3, p: 4 }}>
          <Typography
            variant="h4" // Larger title for the chart section
            fontWeight="bold"
            color="primary"
            sx={{ mb: 4, textAlign: "center" }} // Center align the chart title
          >
            Detailed Transaction Overview
          </Typography>
          {(() => {
            const chartLabels = transactionTypes.map(
              (t) => t.transaction_title
            );
            const slotData = transactionTypes.map(
              (t) => totalSlots[t.transaction_type_id] || 0
            );
            const pendingData = transactionTypes.map(
              (t) => pendingPerType[t.transaction_type_id] || 0
            );
            return (
              <BarChart
                height={350} // Slightly taller chart
                xAxis={[{ data: chartLabels, scaleType: "band" }]}
                series={[
                  {
                    data: slotData,
                    label: "Total Slots",
                    color: "#1976d2", // Blue for slots
                  },
                  {
                    data: pendingData,
                    label: "Pending Appointments",
                    color: "#f44336", // Red for pending
                  },
                ]}
                margin={{ top: 20, right: 30, bottom: 60, left: 50 }} // Adjust margins
                grid={{ vertical: true, horizontal: true }} // Add grid lines for readability
              />
            );
          })()}
        </Paper>
      </Container>
    </Box>
  );
}

export default AdminDashboard;
