import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import FormControlLabel from "@mui/material/FormControlLabel";
import * as React from "react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Loading from "../components/Loading";
import NavBar from "../components/NavBar";
import { notifyInfo } from "../components/ToastUtils";
import { useUser } from "../services/UserContext";
import { getUserData } from "../services/Utils";
import { verifyToken } from "../services/verifyToken";
import { socket } from "../socket";
const DONT_SHOW_EMAIL_DIALOG_KEY = "dashboard_dont_show_email_dialog";

export default function DashboardPage() {
  const navigate = useNavigate();
  const { userdata,setUser } = useUser();
  const [isLoading, setIsLoading] = React.useState(false);
  // State for email notification dialog
  const [openEmailDialog, setOpenEmailDialog] = React.useState(false);
  // State for "Don't show again" checkbox
  const [dontShowAgain, setDontShowAgain] = React.useState<boolean>(() => {
    // Read from localStorage on mount
    const stored = localStorage.getItem(DONT_SHOW_EMAIL_DIALOG_KEY);
    return stored === "true";
  });
  // State to track if user has chosen "Don't show again" for this login
  const [hideEmailDialog, setHideEmailDialog] = React.useState<boolean>(() => {
    // Read from localStorage on mount
    const stored = localStorage.getItem(DONT_SHOW_EMAIL_DIALOG_KEY);
    return stored === "true";
  });

  // Effect to check for missing email and show dialog
  useEffect(() => {
    if (
      userdata &&
      (!userdata.email || userdata.email.trim() === "") &&
      !hideEmailDialog
    ) {
      setOpenEmailDialog(true);
    }
  }, [userdata, hideEmailDialog]);

  const handleCloseEmailDialog = () => {
    setOpenEmailDialog(false);
    if (dontShowAgain) {
      setHideEmailDialog(true);
      localStorage.setItem(DONT_SHOW_EMAIL_DIALOG_KEY, "true");
    }
  };

  const handleGoToProfile = () => {
    setOpenEmailDialog(false);
    if (dontShowAgain) {
      setHideEmailDialog(true);
      localStorage.setItem(DONT_SHOW_EMAIL_DIALOG_KEY, "true");
    }
    navigate("/profile");
  };

  const handleDontShowAgainChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setDontShowAgain(event.target.checked);
    if (event.target.checked) {
      localStorage.setItem(DONT_SHOW_EMAIL_DIALOG_KEY, "true");
      setHideEmailDialog(true);
    } else {
      localStorage.removeItem(DONT_SHOW_EMAIL_DIALOG_KEY);
      setHideEmailDialog(false);
    }
  };

    const checkToken = async () => {
      try{
        setIsLoading(true);
        const result = await verifyToken();

        if (result?.success) {
          const userData = await getUserData({id: result?.user?.student_id});
          setUser(userData);
        }else{
          navigate("/login", { replace: true });
        }
      }catch(err:any){
          console.error(`Error Message: ${err.message}` )
      }finally{
        setIsLoading(false);
      }
    };

  useEffect(() => {
    checkToken();
    socket.emit("registerUser", userdata?.student_details?.student_id);

    socket.on("appointmentUpdate", (appointment) => {
      notifyInfo(appointment.message);
    });
  }, []);

  return (
    <>
      {isLoading && <Loading />}
      <NavBar />
      <div
        className="w-screen h-screen bg-[#f0f2f5] flex flex-col items-center justify-start gap-5"
        style={{
          backgroundColor: "#f3f4f6",
          backgroundImage: `
          repeating-linear-gradient(135deg, #e5e7eb 0px, #e5e7eb 2px, transparent 2px, transparent 40px),
          repeating-linear-gradient(225deg, #e5e7eb 0px, #e5e7eb 2px, transparent 2px, transparent 40px)
          `,
          backgroundSize: "40px 40px",
        }}
      >
        <div
          className="mb-8 flex flex-col items-center"
          style={{ padding: 20, marginTop: "100px" }}
        >
          <h1 className="text-2xl md:text-4xl font-bold text-gray-800 mb-2">
            Welcome,{" "}
            <span className="text-amber-500">
              {userdata?.student_details?.student_name}
            </span>
            !
          </h1>
          <p className="text-md md:text-2xl text-gray-800 mb-2">{userdata?.student_details?.program}</p>
          <p className="text-lg text-gray-600">
            We're glad to see you. Select a service below to get started.
          </p>
        </div>
        <div
          className="w-full flex flex-col gap-5 h-screen bg-amber-400 md:bg-transparent md:flex-row md:gap-3 justify-center"
          style={{ padding: "10px" }}
        >
          <div
            className="w-full max-w-2xl flex-1 h-50 rounded-2xl bg-amber-400 hover:cursor-pointer hover:bg-amber-500 bg-[url('/SubsidyBg.png')] bg-cover bg-center shadow-2xl transition transform hover:scale-95 active:scale-90"
            style={{ padding: "10px" }}
            onClick={() => navigate("/subsidy-payout")}
          >
            <p>Subsidy payout</p>
          </div>
          <div
            className="w-full max-w-2xl flex-1 h-50 rounded-2xl bg-amber-400 hover:cursor-pointer hover:bg-amber-500 bg-[url('/ClearanceValidation.png')] bg-cover bg-center shadow-2xl transition transform hover:scale-95 active:scale-90"
            style={{ padding: "10px" }}
            onClick={() => navigate("/clearance-validation")}
          >
            <p className="text-white">Schedule for clearance</p>
          </div>
          <div
            className="w-full max-w-2xl flex-1 h-50 rounded-2xl bg-amber-400 hover:cursor-pointer hover:bg-amber-500 bg-[url('/ClaimingOfID.png')] bg-cover bg-center shadow-2xl transition transform hover:scale-95 active:scale-90"
            style={{ padding: "10px" }}
            onClick={() => navigate("/school-id")}
          >
            <p className="text-white">Claiming of school ID schedule</p>
          </div>
        </div>
      </div>
      {/* Email missing dialog */}
      <Dialog
        open={openEmailDialog}
        onClose={handleCloseEmailDialog}
        aria-labelledby="missing-email-dialog-title"
      >
        <DialogTitle id="missing-email-dialog-title">
          Email Required
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            You have not set an email address. Please add your email in the
            profile section to ensure you receive important notifications.
          </DialogContentText>
          <FormControlLabel
            control={
              <Checkbox
                checked={dontShowAgain}
                onChange={handleDontShowAgainChange}
                color="primary"
              />
            }
            label="Don't show again for this login"
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleGoToProfile}
            color="primary"
            variant="contained"
          >
            Go to Profile
          </Button>
          <Button onClick={handleCloseEmailDialog} color="secondary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
