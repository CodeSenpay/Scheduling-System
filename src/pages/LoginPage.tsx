import { Visibility, VisibilityOff } from "@mui/icons-material";
import { Button, IconButton, InputAdornment, TextField } from "@mui/material";
import { useEffect, useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import Loading from "../components/Loading";
import CustomModal from "../components/Modal.tsx";
import {
  notifyError,
  notifyInfo,
  notifySuccess,
} from "../components/ToastUtils";
import apiClient from "../services/apiClient.ts";
import { useUser } from "../services/UserContext.ts";
import { verifyToken } from "../services/verifyToken.ts";

function LoginPage() {
  type dataProps = {
    email: string;
    password: string;
    user_level: string;
  };

  const { register, handleSubmit } = useForm<dataProps>();

  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const sendOtpToEmail: SubmitHandler<dataProps> = async (data) => {
    try {
      await apiClient.post("/send-otp", data, {
        headers: { "Content-Type": "application/json" },
      });
    } catch (err: unknown) {
      const error = err as {
        response?: { status?: number; data?: { message?: string } };
        message?: string;
      };
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        notifyInfo(
          error?.response?.data?.message ||
            error?.message ||
            "Login failed. Please try again."
        );
        openModal();
      } else {
        notifyError(
          error?.response?.data?.message ||
            error?.message ||
            "Login failed. Please try again."
        );
        // Do not open the modal for non-401 errors
      }
      throw err;
    }
  };

  const toggleShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  const { userdata, setUser } = useUser();

  useEffect(() => {
    const checkToken = async () => {
      const result = await verifyToken();

      if (result?.success && result?.user?.user_level === "ADMIN") {
        navigate("/admin-dashboard");
      }
    };
    checkToken();
  }, [userdata, navigate]);

  const handleLogin: SubmitHandler<dataProps> = async (data) => {
    setLoading(true);
    try {
      const response = await apiClient.post("/login-admin", data, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      setUser(response.data.user);
      
      const userLevel = response.data?.user.user_level;
      
      if (userLevel === "ADMIN" || userLevel === "SUDO") {
        notifySuccess("Login successful!");
        navigate("/admin-dashboard");
      } 
    } catch (err: unknown) {
      const error = err as {
        response?: { status?: number; data?: { message?: string } };
        message?: string;
      };
      // eslint-disable-next-line no-console
      console.error(error.response?.status);
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        // Only show OTP modal for 401/403 (OTP/verification issues)
        notifyInfo(
          error?.response?.data?.message ||
            error?.message ||
            "Login failed. Please try again."
        );
        sendOtpToEmail(data);
        openModal();
      } else if (
        error?.response?.status === 409 ||
        error?.response?.status === 404
      ) {
        // Show info for already logged in or not registered, but do NOT open OTP modal
        notifyInfo(
          error?.response?.data?.message ||
            error?.message ||
            "Login failed. Please try again."
        );
        // Do not call sendOtpToEmail or openModal
      } else {
        notifyError(
          error?.response?.data?.message ||
            error?.message ||
            "Login failed. Please try again."
        );
        // Do not open the modal for non-401/403/409/404 errors
      }
    } finally {
      setLoading(false);
    }
  };
  function maskEmail(email: string) {
    const [user, domain] = email.split("@");
    if (!user || !domain) return email;
    const maskedUser =
      user.length <= 2
        ? user[0] + "*".repeat(user.length - 1)
        : user[0] + "*".repeat(user.length - 2) + user[user.length - 1];
    return `${maskedUser}@${domain}`;
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-gray-100 px-4"
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
        {loading && <Loading />}
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
          <p>ADMIN</p>
          <TextField
            label="Admin Email"
            variant="outlined"
            type="text"
            required
            className="w-full max-w-sm"
            {...register("email")}
          />
          <TextField
            autoComplete="false"
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
          <Button
            variant="contained"
            color="primary"
            type="submit"
            className="w-full max-w-sm"
            disabled={loading}
            // Remove CircularProgress, use Loading overlay instead
          >
            {loading ? "Logging in..." : "Login"}
          </Button>

          <p className="text-md text-blue-600">
            <i>Developed By:</i> Robert Mayo/Marklan
          </p>
        </form>
        <CustomModal
          isOpen={isModalOpen}
          handleClose={closeModal}
          backgroundColor="white"
        >
          <div className="p-4">
            <h2 className="text-lg font-semibold mb-2">Login Failed</h2>
            <p className="text-gray-700 mb-4">
              Please check your Email:{" "}
              <span className="font-semibold">
                {maskEmail(
                  (
                    document.querySelector(
                      'input[name="email"]'
                    ) as HTMLInputElement
                  )?.value || "your email"
                )}
              </span>
            </p>
            <form
              className="flex flex-col gap-3"
              onSubmit={async (e) => {
                e.preventDefault();
                const otp = (
                  e.currentTarget.elements.namedItem("otp") as HTMLInputElement
                )?.value;
                const email = (
                  document.querySelector(
                    'input[name="email"]'
                  ) as HTMLInputElement
                )?.value;
                try {
                  // Send both OTP and email as JSON payload
                  await apiClient.post(
                    "/verify-otp",
                    { otp, email },
                    {
                      headers: { "Content-Type": "application/json" },
                    }
                  );
                  notifySuccess("OTP verified!");
                  closeModal();
                  // Automatically log in after OTP verification
                  await handleLogin({
                    email,
                    password: (
                      document.querySelector(
                        'input[name="password"]'
                      ) as HTMLInputElement
                    )?.value,
                    user_level: (
                      document.querySelector(
                        'select[name="user_level"]'
                      ) as HTMLSelectElement
                    )?.value,
                  });
                } catch (err: unknown) {
                  const error = err as {
                    response?: { data?: { message?: string } };
                    message?: string;
                  };
                  notifyError(
                    error?.response?.data?.message ||
                      error?.message ||
                      "OTP verification failed."
                  );
                }
              }}
            >
              <TextField
                label="Enter OTP"
                name="otp"
                variant="outlined"
                required
                className="w-full"
              />
              <Button
                variant="contained"
                color="primary"
                type="submit"
                className="w-full"
              >
                Submit OTP
              </Button>
            </form>
            <Button
              variant="outlined"
              color="secondary"
              onClick={closeModal}
              className="w-full mt-2"
            >
              Close
            </Button>
          </div>
        </CustomModal>
      </div>
    </div>
  );
}

export default LoginPage;
