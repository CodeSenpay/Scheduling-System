import { Check, Close, Search } from "@mui/icons-material";
import {
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { Dayjs } from "dayjs";
import { useEffect, useState } from "react";
import { notifyError, notifySuccess } from "../components/ToastUtils";
import { useUser } from "../services/UserContext";
import apiClient from "../services/apiClient";
type transactionTypeProps = {
  transaction_type_id: number;
  transaction_title: string;
  transaction_details: string;
};

type appointmentProps = {
  student_email: string;
  appointment_id: string;
  transaction_title: string;
  appointment_date: string;
  appointment_status: string;
  start_time: string;
  end_time: string;
  student_id: string;
  semester: string;
  school_year: string;
};

function ApproveTransactionPage() {
  // Change initial value to '' (string) to avoid out-of-range value for Select
  const [selectedType, setSelectedType] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
  // Remove single isLoading, use per-row loading state
  const [loadingApproveId, setLoadingApproveId] = useState<string | null>(null);
  const [loadingDeclineId, setLoadingDeclineId] = useState<string | null>(null);

  // For select all
  const [selectedAppointments, setSelectedAppointments] = useState<string[]>(
    []
  );
  const [selectAll, setSelectAll] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);

  const { userdata, semester, schoolYear } = useUser();
  const [transactionTypes, setTransactionTypes] = useState<
    transactionTypeProps[]
  >([]);



  const handleApprove = (data: appointmentProps) => {

    const dataPayload = {
      model: "schedulesModel",
      function_name: "approveAppointment",
      payload: {
        approved_by: userdata?.user_id,
        appointment_id: data.appointment_id,
        appointment_status: "Approved",
        student_email: data.student_email,
        student_id: data.student_id,
      },
    };
    
    setLoadingApproveId(data.appointment_id);

    apiClient
      .post("/scheduling-system/admin", dataPayload, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      })
      .then((response) => {
        
        if (response.data.success) {
          notifySuccess("Appointment approved successfully.");
          handleSearch();
        } else {
          notifyError("Failed to approve appointment.");
        }
      })
      .catch((err: unknown) => {
        if (err instanceof Error) {
          console.error(err.message);
        } else {
          console.error(err);
        }
        notifyError("An error occurred while approving the appointment.");
      })
      .finally(() => {
        setLoadingApproveId(null);
      });
  };

  const handleDecline = async (data: appointmentProps) => {
    setLoadingDeclineId(data.appointment_id);
    const payload = {
      model: "schedulesModel",
      function_name: "approveAppointment",
      payload: {
        approved_by: userdata?.user_id,
        appointment_id: data.appointment_id,
        appointment_status: "Declined",
        student_email: data.student_email,
        student_id: data.student_id,
      },
    };
    try {
      const response = await apiClient.post(
        "/scheduling-system/admin",
        payload,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      if (response.data.success) {
        notifySuccess("Appointment declined successfully.");
        handleSearch();
      } else {
        notifyError("Failed to decline appointment.");
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error(err.message);
      } else {
        console.error(err);
      }
    } finally {
      setLoadingDeclineId(null);
    }
  };

  // Only filter when Search is clicked
  const [filteredAppointments, setFilteredAppointments] = useState<
    appointmentProps[]
  >([]);

  const handleSearch = async () => {
    const data = {
      model: "schedulesModel",
      function_name: "getAppointment",
      payload: {
        appointment_id: "",
        appointment_status: "Pending",
        appointment_date: selectedDate ? selectedDate.format("YYYY-MM-DD") : "",
        transaction_type_id: selectedType === "" ? "" : Number(selectedType),
        user_id: "",
        semester: semester?.semester || "",
        school_year: schoolYear?.schoolYear || "",
      },
    };

    try {
      const response = await apiClient.post("/scheduling-system/admin", data, {
        headers: { "Content-Type": "application/json" },
      });
      console.log(response.data);
      setFilteredAppointments(response.data.data);
      // Reset selection on new search
      setSelectedAppointments([]);
      setSelectAll(false);
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error(err.message);
      } else {
        console.error(err);
      }
    }
  };

  // Keep search fields in sync with filter fields
  const handleTypeChange = (value: string) => {
    setSelectedType(value);
  };
  const handleDateChange = (value: Dayjs | null) => {
    setSelectedDate(value);
  };

  const getTransactionTypes = async () => {
    const data = {
      model: "schedulesModel",
      function_name: "getTransactionType",
      payload: {},
    };

    try {
      const response = await apiClient.post("/scheduling-system/admin", data, {
        headers: { "Content-Type": "application/json" },
      });

      setTransactionTypes(response.data.data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error(err.message);
      } else {
        console.error(err);
      }
    }
  };

  // Select all logic
  const handleSelectAllChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const checked = event.target.checked;
    setSelectAll(checked);
    if (checked) {
      setSelectedAppointments(
        filteredAppointments.map((appt) => appt.appointment_id)
      );
    } else {
      setSelectedAppointments([]);
    }
  };

  const handleSelectOne = (appointmentId: string) => {
    setSelectedAppointments((prev) => {
      if (prev.includes(appointmentId)) {
        return prev.filter((id) => id !== appointmentId);
      } else {
        return [...prev, appointmentId];
      }
    });
  };

  useEffect(() => {
    // Keep selectAll in sync with selectedAppointments
    if (
      filteredAppointments.length > 0 &&
      selectedAppointments.length === filteredAppointments.length
    ) {
      setSelectAll(true);
    } else {
      setSelectAll(false);
    }
  }, [selectedAppointments, filteredAppointments]);

  // Bulk Approve
  const handleBulkApprove = async () => {
    if (selectedAppointments.length === 0) {
      notifyError("No appointments selected.");
      return;
    }
    setBulkLoading(true);
    try {
      
      await Promise.all(
        filteredAppointments
          .filter((appt) => selectedAppointments.includes(appt.appointment_id))
          .map((appt) =>
          {

            apiClient.post(
              "/scheduling-system/admin",
              {
                model: "schedulesModel",
                function_name: "approveAppointment",
                payload: {
                  approved_by: userdata?.user_id,
                  appointment_id: appt.appointment_id,
                  appointment_status: "Approved",
                  student_email: appt.student_email,
                  student_id: appt.student_id,
                },
              },
              {
                headers: { "Content-Type": "application/json" },
                withCredentials: true,
              }
            )

            console.log(appt);
          }
        
          )
      );
      notifySuccess("Selected appointments approved successfully.");
      handleSearch();
    } catch {
      notifyError("Failed to approve selected appointments.");
    } finally {
      setBulkLoading(false);
    }
  };

  useEffect(() => {
    handleSearch();
    getTransactionTypes();
    // eslint-disable-next-line
  }, []);

  return (
    <div className="w-full mx-auto py-10 px-4" style={{ maxWidth: "100%" }}>
      <Paper
        elevation={3}
        className="p-8 rounded-xl bg-white shadow-lg"
        style={{ padding: "20px" }}
      >
        <h1
          className="text-3xl font-bold text-gray-800"
          style={{ marginBottom: "20px" }}
        >
          Approve Appointments
        </h1>
        <div className="flex flex-col md:flex-row gap-4 mb-8 items-end">
          <FormControl fullWidth variant="outlined" size="small">
            <InputLabel id="type-label">Transaction Type</InputLabel>
            <Select
              labelId="type-label"
              value={selectedType}
              label="Transaction Type"
              onChange={(e) => handleTypeChange(e.target.value)}
            >
              <MenuItem value={""}>ALL</MenuItem>
              {transactionTypes.map((type) => (
                <MenuItem
                  key={type.transaction_type_id}
                  value={String(type.transaction_type_id)}
                >
                  {type.transaction_title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="Select Date"
              value={selectedDate}
              onChange={handleDateChange}
              slotProps={{
                textField: {
                  size: "small",
                  fullWidth: true,
                },
              }}
              format="YYYY-MM-DD"
            />
          </LocalizationProvider>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Search />}
            onClick={handleSearch}
            sx={{ minWidth: 120 }}
          >
            Search
          </Button>
        </div>
        <div className="flex items-center mb-4 gap-4">
          <FormControlLabel
            control={
              <Checkbox
                checked={selectAll}
                onChange={handleSelectAllChange}
                indeterminate={
                  selectedAppointments.length > 0 &&
                  selectedAppointments.length < filteredAppointments.length
                }
                disabled={filteredAppointments.length === 0}
              />
            }
            label="Select All"
          />
          <Button
            variant="contained"
            color="success"
            onClick={handleBulkApprove}
            disabled={
              selectedAppointments.length === 0 ||
              loadingApproveId !== null ||
              loadingDeclineId !== null ||
              bulkLoading
            }
            sx={{ minWidth: 160 }}
            loading={bulkLoading}
          >
            Approve Selected
          </Button>
        </div>
        <Paper className="overflow-x-auto">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selectAll}
                    onChange={handleSelectAllChange}
                    indeterminate={
                      selectedAppointments.length > 0 &&
                      selectedAppointments.length < filteredAppointments.length
                    }
                    disabled={filteredAppointments.length === 0}
                  />
                </TableCell>
                <TableCell className="font-semibold">Type</TableCell>
                <TableCell className="font-semibold">Date</TableCell>
                <TableCell className="font-semibold">User ID</TableCell>
                <TableCell className="font-semibold">Details</TableCell>
                <TableCell className="font-semibold">Semester</TableCell>
                <TableCell className="font-semibold">School-Year</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredAppointments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    No appointments found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredAppointments.map((appt) => (
                  <TableRow key={appt.appointment_id}>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedAppointments.includes(
                          appt.appointment_id
                        )}
                        onChange={() => handleSelectOne(appt.appointment_id)}
                        disabled={
                          loadingApproveId !== null ||
                          loadingDeclineId !== null ||
                          bulkLoading
                        }
                      />
                    </TableCell>
                    <TableCell className="capitalize">
                      {appt.transaction_title}
                    </TableCell>
                    <TableCell>{appt.appointment_date}</TableCell>
                    <TableCell>{appt.student_id}</TableCell>
                    <TableCell>{appt.transaction_title}</TableCell>
                    <TableCell>{appt.semester}</TableCell>
                    <TableCell>{appt.school_year}</TableCell>
                    {/* Hidden cell for student_email */}
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          appt.appointment_status.toLowerCase() === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : appt.appointment_status === "approved"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                        }`}
                      >
                        {appt.appointment_status}
                      </span>
                    </TableCell>
                    <TableCell>
                      {appt ? (
                        <div className="flex gap-2">
                          <Button
                            color="success"
                            onClick={() => handleApprove(appt)}
                            loading={loadingApproveId === appt.appointment_id}
                            loadingPosition="start"
                            startIcon={<Check />}
                            variant="contained"
                            disabled={
                              loadingApproveId !== null ||
                              loadingDeclineId !== null ||
                              bulkLoading
                            }
                          >
                            Approve
                          </Button>
                          <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            loading={loadingDeclineId === appt.appointment_id}
                            loadingPosition="start"
                            startIcon={<Close />}
                            onClick={() => handleDecline(appt)}
                            disabled={
                              loadingApproveId !== null ||
                              loadingDeclineId !== null ||
                              bulkLoading
                            }
                          >
                            Decline
                          </Button>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Paper>
      </Paper>
    </div>
  );
}

export default ApproveTransactionPage;
