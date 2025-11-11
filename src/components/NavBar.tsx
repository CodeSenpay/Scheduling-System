import MenuIcon from "@mui/icons-material/Menu";
import NotificationsIcon from "@mui/icons-material/Notifications";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import AppBar from "@mui/material/AppBar";
import Avatar from "@mui/material/Avatar";
import Badge from "@mui/material/Badge";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Toolbar from "@mui/material/Toolbar";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import * as React from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../services/apiClient";
import { useUser } from "../services/UserContext";
import Loading from "./Loading"; // Import the Loading component
import { notifyError, notifySuccess } from "./ToastUtils";

const pages = ["VMGO", "About Us", "Dashboard"];
const settings = ["Profile", "Dashboard", "Logout"];

function NavBar() {
  const { userdata, setUser } = useUser();
  const [loading, setLoading] = React.useState(false); // Add loading state
  const [hasNotifications, setHasNotifications] = React.useState(false); // Track notification state
  const [notificationCount, setNotificationCount] = React.useState(0); // Track notification count

  const LogoutStudent = async () => {
    setLoading(true);
    try {
      const student_id = userdata?.student_id;
      await apiClient.post(
        "/logout/student",
        { student_id },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
      setUser(null);
      notifySuccess("Logout successful!");
      navigate("/login");
    } catch (err) {
      console.log(err);
      const error = err as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      notifyError(
        error?.response?.data?.message ||
          error?.message ||
          "Logout failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(
    null
  );
  const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(
    null
  );

  const navigate = useNavigate();

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleSettings = (setting: string) => {
    switch (setting.toLocaleUpperCase()) {
      case "LOGOUT":
        LogoutStudent();
        break;
      case "PROFILE":
        navigate("/profile");
        break;
      case "DASHBOARD":
        navigate("/dashboard");
        break;
      default:
        break;
    }
  };

  const handlePages = (page: string) => {
    switch (page.toUpperCase()) {
      case "VMGO":
        navigate("/vmgo");
        break;
      case "ABOUT US":
        navigate("/about-us");
        break;
      case "DASHBOARD":
        navigate("/dashboard");
        break;
      default:
        break;
    }
  };

  const handleNotificationClick = () => {
    navigate("/notification");
  };

  // Example: Fetch notifications on component mount
  React.useEffect(() => {
    // TODO: Replace with actual API call to fetch notifications
    // For now, this is a placeholder to demonstrate the functionality
    const fetchNotifications = async () => {
      try {
        // const response = await apiClient.get("/notifications");
        // setHasNotifications(response.data.length > 0);
        // setNotificationCount(response.data.length);
        
        // Placeholder logic - set to true to test the notification icon
        setHasNotifications(true);
        setNotificationCount(3);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    fetchNotifications();
  }, []);

  return (
    <>
      {loading && <Loading />}
      <Box sx={{ flexGrow: 1 }} className="w-full">
        <AppBar
          position="fixed"
          sx={{
            boxShadow: 1,
            zIndex: (theme) => theme.zIndex.drawer + 1,
            backgroundColor: "primary.main",
          }}
        >
          <Container>
            <Toolbar disableGutters>
              <img src="/LogoPNG.png" className="max-w-10 md:w-30" alt="logo" />

              <Box sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}>
                <IconButton
                  size="large"
                  aria-label="account of current user"
                  aria-controls="menu-appbar"
                  aria-haspopup="true"
                  onClick={handleOpenNavMenu}
                  color="inherit"
                >
                  <MenuIcon />
                </IconButton>
                <Menu
                  id="menu-appbar"
                  anchorEl={anchorElNav}
                  anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "left",
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: "top",
                    horizontal: "left",
                  }}
                  open={Boolean(anchorElNav)}
                  onClose={handleCloseNavMenu}
                  sx={{ display: { xs: "block", md: "none" } }}
                >
                  {pages.map((page) => (
                    <MenuItem key={page} onClick={() => handlePages(page)}>
                      <Typography sx={{ textAlign: "center" }}>
                        {page}
                      </Typography>
                    </MenuItem>
                  ))}
                </Menu>
              </Box>

              <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
                {pages.map((page) => (
                  <Button
                    key={page}
                    onClick={() => handlePages(page)}
                    sx={{ my: 2, color: "white", display: "block" }}
                  >
                    {page}
                  </Button>
                ))}
              </Box>
              <Box sx={{ flexGrow: 0, display: "flex", alignItems: "center", gap: 1 }}>
                <Tooltip title="Notifications">
                  <IconButton
                    onClick={handleNotificationClick}
                    sx={{
                      color: hasNotifications ? "#FFD700" : "white",
                      transition: "color 0.3s ease",
                    }}
                  >
                    <Badge badgeContent={notificationCount} color="error">
                      {hasNotifications ? (
                        <NotificationsActiveIcon />
                      ) : (
                        <NotificationsIcon />
                      )}
                    </Badge>
                  </IconButton>
                </Tooltip>
                <Tooltip title="Open settings">
                  <IconButton 
                    onClick={handleOpenUserMenu} 
                    sx={{ 
                      p: 0,
                      display: "flex",
                      alignItems: "center",
                      gap: 1
                    }}
                  >
                    <Avatar alt="" src="#" />
                    <Typography
                      sx={{
                        color: "white",
                        fontSize: "0.875rem",
                        display: { xs: "none", md: "block" }
                      }}
                    >
                      {userdata?.student_details?.student_name}
                    </Typography>
                  </IconButton>
                </Tooltip>
                <Menu
                  sx={{ mt: "45px" }}
                  id="menu-appbar"
                  anchorEl={anchorElUser}
                  anchorOrigin={{
                    vertical: "top",
                    horizontal: "right",
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: "top",
                    horizontal: "right",
                  }}
                  open={Boolean(anchorElUser)}
                  onClose={handleCloseUserMenu}
                >
                  {settings.map((setting) => (
                    <MenuItem key={setting} onClick={handleCloseUserMenu}>
                      <Typography
                        sx={{ textAlign: "center" }}
                        onClick={() => handleSettings(setting)}
                      >
                        {setting}
                      </Typography>
                    </MenuItem>
                  ))}
                </Menu>
              </Box>
            </Toolbar>
          </Container>
        </AppBar>
      </Box>
    </>
  );
}

export default NavBar;
