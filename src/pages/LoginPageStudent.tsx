import { Visibility, VisibilityOff } from "@mui/icons-material";
import { Button, CircularProgress, TextField } from "@mui/material";
import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { notifyError, notifySuccess } from "../components/ToastUtils";
import apiClient from "../services/apiClient";

import { IconButton, InputAdornment } from "@mui/material";
import { useUser } from "../services/UserContext";
// import { getUserData } from "../services/Utils";
// import { verifyToken } from "../services/verifyToken";
type dataProps = {
  studentId: string;
  password: string;
  user_level: string;
};

function LoginPageStudent() {

  const { register, handleSubmit } = useForm<dataProps>();

  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const toggleShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  const { setUser } = useUser();


  //   const checkToken = async () => {
  //     const result = await verifyToken();
  //     console.log("Token verification result:", result);
  //     if (result?.success) {
  //       const userData = await getUserData({id: result?.user?.student_id});
  //       setUser(userData);
  //       navigate("/dashboard");
  //     }
  //   };

  // useEffect(() => {
  //   checkToken();
  // }, []);

  const handleLogin: SubmitHandler<dataProps> = async (data) => {
    setLoading(true);
    try {
      const response = await apiClient.post("/login-student", data, {
        headers: { "Content-Type": "application/json" },
      });

      notifySuccess("Login successful!");

      setUser(response.data.user);
      const userLevel = response.data?.user.user_level;
      if (userLevel === "STUDENT") {
        navigate("/dashboard");
      }
    } catch (err: unknown) {
      const error = err as {
        response?: { status?: number; data?: { message?: string } };
        message?: string;
      };
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        notifyError(
          error?.response?.data?.message ||
            error?.message ||
            "Login failed. Please try again."
        );
      } else {
        notifyError(
          error?.response?.data?.message ||
            error?.message ||
            "Login failed. Please try again."
        );
        // Do not open the modal for non-401 errors
      }
    } finally {
      setLoading(false);
    }
  };

  // Function to filter input for Student ID (format: 21-A-01720)
  const filterStudentIdInput = (value: string) => {
    // Allow only format: 2 digits, dash, 1 uppercase letter, dash, 5 digits
    // Remove invalid characters and enforce uppercase for the letter
    let filtered = value
      .replace(/[^0-9A-Za-z-]/g, "") // Remove non-alphanumeric and non-dash
      .toUpperCase();

    // Enforce the format step by step
    // 1. Only allow up to 2 digits at the start
    filtered = filtered.replace(/^(\d{0,2}).*$/, "$1" + filtered.slice(2));

    // 2. Add dash after 2 digits if not present
    if (filtered.length > 2 && filtered[2] !== "-") {
      filtered =
        filtered.slice(0, 2) + "-" + filtered.slice(2).replace(/^-*/, "");
    }

    // 3. Only allow 1 uppercase letter after dash
    filtered = filtered.replace(/^(\d{2}-)([A-Z]?)[A-Z]*/, "$1$2");

    // 4. Add dash after the letter if not present
    if (filtered.length > 4 && filtered[4] !== "-") {
      filtered =
        filtered.slice(0, 4) + "-" + filtered.slice(4).replace(/^-*/, "");
    }

    // 5. Only allow up to 5 digits after the second dash
    filtered = filtered.replace(/^(\d{2}-[A-Z]-)(\d{0,5}).*$/, "$1$2");

    return filtered;
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        backgroundColor: "#f3f4f6",
        backgroundImage: `
        repeating-linear-gradient(135deg, #e5e7eb 0px, #e5e7eb 2px, transparent 2px, transparent 40px),
        repeating-linear-gradient(225deg, #e5e7eb 0px, #e5e7eb 2px, transparent 2px, transparent 40px)
      `,
        backgroundSize: "40px 40px",
      }}
    >
      <div className="w-full max-w-sm bg-white rounded-lg shadow-md p-6">
        <form
          className="flex flex-col justify-center items-center gap-4"
          style={{ padding: "30px" }}
          onSubmit={handleSubmit(handleLogin)}
        >
          <img src="/LogoPNG.png" alt="logo" className="w-20 h-20" />
          <h1 className="text-2xl font-bold mb-4 text-center">
            <span className="font-bold">
              DSAS
              <br />
              Scheduling System
            </span>
          </h1>
          <TextField
            label="Student ID"
            variant="outlined"
            type="text"
            required
            className="w-full max-w-sm"
            {...register("studentId")}
            inputProps={{ style: { textTransform: "uppercase" } }}
            onInput={(e) => {
              const input = e.target as HTMLInputElement;
              input.value = filterStudentIdInput(input.value);
            }}
          />
          <TextField
            label="Password"
            variant="outlined"
            type={showPassword ? "text" : "password"}
            required
            className="w-full max-w-sm"
            {...register("password")}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton edge="end" onClick={toggleShowPassword}>
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />
          {/* <Typography
            variant="body2"
            color="textSecondary"
            className="w-full text-center mb-2"
            sx={{
              backgroundColor: "#f5f5f5",
              borderRadius: "4px",
              padding: "8px",
              fontStyle: "italic",
            }}
          >
            Hint: Your password is the same as your ARMS Portal password.
          </Typography> */}
          <Button
            variant="contained"
            color="primary"
            type="submit"
            className="w-full max-w-sm"
            disabled={loading}
            startIcon={
              loading ? <CircularProgress size={20} color="inherit" /> : null
            }
          >
            {loading ? "Logging in..." : "Login"}
          </Button>

          <p className="text-md text-blue-600">
            <i>Developed By:</i> Robert Mayo L. Elumba
          </p>
        </form>
      </div>
    </div>
  );
}

export default LoginPageStudent;
