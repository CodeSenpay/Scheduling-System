import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { verifyToken } from "../services/verifyToken";
import { notifyError } from "./ToastUtils";
function ProtectedPages() {
  const navigate = useNavigate();

  async function verifyUser() {
    const response = await verifyToken();

    if (!response.success) {
      notifyError(response.message);
      return
    }
    if (response.user.userLevel === "ADMIN") {
      navigate("/admin-dashboard");
    }

    if (response.user.userLevel === "STUDENT") {
      navigate("/dashboard");
    }
  }

  useEffect(() => {
    verifyUser();
  }, []);

  return <Outlet />;
}

export default ProtectedPages;
