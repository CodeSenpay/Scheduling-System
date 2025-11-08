import AddIcon from "@mui/icons-material/Add";
import ArticleIcon from "@mui/icons-material/Article";
import AutoDeleteIcon from "@mui/icons-material/AutoDelete";
import DashboardIcon from "@mui/icons-material/Dashboard";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import HowToRegIcon from "@mui/icons-material/HowToReg";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import ManageSearchIcon from "@mui/icons-material/ManageSearch";
import PeopleIcon from "@mui/icons-material/People";
import PreviewIcon from "@mui/icons-material/Preview";
import { createTheme } from "@mui/material/styles";
import type { Navigation, Router } from "@toolpad/core/AppProvider";
import { AppProvider } from "@toolpad/core/AppProvider";
import { DashboardLayout } from "@toolpad/core/DashboardLayout";
import { PageContainer } from "@toolpad/core/PageContainer";
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AccountCustomSlotProps from "../components/AccountCustomSlotProps";
import Loading from "../components/Loading";
import Modal from "../components/Modal";
import { useUser } from "../services/UserContext";
import { getUserData } from "../services/Utils";
import { verifyToken } from "../services/verifyToken";
import AddAvailability from "./AddAvailability";
import AdminDashboard from "./AdminDashboard";
import ApproveTransactionPage from "./ApproveTransactionPage";
import DeleteAvailability from "./DeleteAvailability";
import ManageAccountLoginPage from "./ManageAccountLoginPage";
import ManageAdminPasswords from "./ManageAdminPasswords";
import RegisterAdminPage from "./RegisterAdminPage";
import ReportPage from "./ReportPage";
import ViewAvailability from "./ViewAvailability";


function useCurrentUser() {
  const { userdata, } = useUser();
  
  return {
    email: userdata?.email || "",
    role: userdata?.user_level  ||"",
  };
}

function getNavigationForRole(role: string): Navigation {
  const baseNavigation: Navigation = [
    { kind: "header", title: "Main items" },
    {
      segment: "admin-dashboard",
      title: "Dashboard",
      icon: <DashboardIcon />,
    },
    {
      segment: "manage-availability",
      title: "Manage Availability",
      icon: <ManageSearchIcon />,
      children: [
        {
          segment: "add-availability",
          title: "Add Availability",
          icon: <AddIcon />,
        },
        {
          segment: "view-availability",
          title: "View Availability",
          icon: <PreviewIcon />,
        },
        {
          segment: "delete-availability",
          title: "Delete Availability",
          icon: <AutoDeleteIcon />,
        },
      ],
    },
    { kind: "divider" },
    { kind: "header", title: "Analytics" },
    {
      segment: "approve-transactions",
      title: "Approve Transactions",
      icon: <EventAvailableIcon />,
    },
    {
      segment: "report-page",
      title: "Report",
      icon: <ArticleIcon />,
    },
    { kind: "divider" },
    { kind: "header", title: "Account" },
    {
      segment: "register-admin",
      title: "Register Admin",
      icon: <HowToRegIcon />,
    },
    {
      segment: "manage-account-login",
      title: "Manage Account Access",
      icon: <PeopleIcon />,
    },
  ];

  // Only add "Manage Admin" if user is sudo
  if (role === "SUDO") {
    baseNavigation.push({
      segment: "manage-admin",
      title: "Manage Admin",
      icon: <ManageAccountsIcon />,
    });
  }

  return baseNavigation;
}

const demoTheme = createTheme({
  colorSchemes: { light: true, dark: true },
  cssVariables: { colorSchemeSelector: "class" },
  breakpoints: {
    values: { xs: 0, sm: 600, md: 600, lg: 1200, xl: 1536 },
  },
});

function useDemoRouter(initialPath: string): Router {
  const [pathname, setPathname] = useState(initialPath);
  return useMemo(
    () => ({
      pathname,
      searchParams: new URLSearchParams(),
      navigate: (path: string | URL) => setPathname(String(path)),
    }),
    [pathname]
  );
}

function renderCurrentPage(pathname: string, role: string) {
  switch (pathname) {
    case "/admin-dashboard":
      return <AdminDashboard />;
    case "/manage-availability/add-availability":
      return <AddAvailability />;
    case "/manage-availability/view-availability":
      return <ViewAvailability />;
    case "/manage-availability/delete-availability":
      return <DeleteAvailability />;
    case "/approve-transactions":
      return <ApproveTransactionPage />;
    case "/report-page":
      return <ReportPage />;
    case "/register-admin":
      return <RegisterAdminPage />;
    case "/manage-account-login":
      return <ManageAccountLoginPage />;
    case "/manage-admin":
      // Only render ManageAdminPasswords if user is sudo
      if (role === "SUDO") {
        return <ManageAdminPasswords />;
      } else {
        return <h2>403 - Forbidden</h2>;
      }
    default:
      return <h2>404 - Page not found</h2>;
  }
}




export default function AdminDashboardPage() {
  const router = useDemoRouter("/admin-dashboard");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading,setIsLoading] = useState(false);
  const { setUser } = useUser();

  const navigate = useNavigate();

  const currentUser = useCurrentUser();
  
  const navigation = useMemo(
    () => getNavigationForRole(currentUser.role),
    [currentUser.role]
  );

  const CustomToolbarActions = React.useCallback(
    () => (
      <>
        <AccountCustomSlotProps />
      </>
    ),
    []
  );

      const checkToken = async () => {
      try{

        setIsLoading(true);
        const result = await verifyToken();
        
        if (result?.success) {
          const userData = await getUserData({id: result?.user.userId});

          setUser(userData);
        }else{
          navigate("/login/admin", { replace: true });
        }

      }catch(err:any){
          console.error(`Error Message: ${err.message}` )
      }finally{
        setIsLoading(false);
      }
    };

useEffect(() => {
  checkToken();
},[])


  return (
    <>
      {isLoading && <Loading />}
      {isModalOpen && (
        <Modal isOpen={isModalOpen} handleClose={() => setIsModalOpen(false)}>
          <RegisterAdminPage />
        </Modal>
      )}
      <AppProvider
        navigation={navigation}
        router={router}
        theme={demoTheme}
        branding={{
          logo: <img src="/LogoPNG.png" />,
          title: "JRMSU DSAS ADMIN",
          homeUrl: "/admin-dashboard", // disables title link if AppProvider supports this prop
        }}
      >
        <div
          style={{
            backgroundColor: "#f3f4f6",
            backgroundImage: `
              repeating-linear-gradient(135deg, #e5e7eb 0px, #e5e7eb 2px, transparent 2px, transparent 40px),
              repeating-linear-gradient(225deg, #e5e7eb 0px, #e5e7eb 2px, transparent 2px, transparent 40px)
            `,
            backgroundSize: "40px 40px",
            minHeight: "100vh",
          }}
        >
          <DashboardLayout slots={{ toolbarActions: CustomToolbarActions }}>
            <PageContainer title="" breadcrumbs={[]}>
              {renderCurrentPage(router.pathname, currentUser.role)}
            </PageContainer>
          </DashboardLayout>
        </div>
      </AppProvider>
    </>
  );
}
