import { lazy, Suspense, useEffect } from "react";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Navigate,
  Route,
  RouterProvider,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import Loading from "./components/Loading";
import NotFoundPage from "./components/NotFoundPage";
import ProtectedPages from "./components/ProtectedPages";
import AdminDashboard from "./pages/AdminSection";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import LoginPageStudent from "./pages/LoginPageStudent";
import { useUser } from "./services/UserContext";
import { fetchSemester, fetchShoolYear } from "./services/Utils";
const CalendarPage = lazy(() => import("./pages/Calendar"));
const VMGOPage = lazy(() => import("./pages/VMGOPage"));
const AboutUsPage = lazy(() => import("./pages/AboutUsPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const SubsidyPayoutPage = lazy(() => import("./pages/SubsidyPayoutPage"));

const ClearanceValidationPage = lazy(
  () => import("./pages/ClearanceValidationPage")
);
const ClaimingOfIDPage = lazy(() => import("./pages/ClaimingOfIDPage"));

// type UserProps = {
//   student_id?: string;
//   user_id?: string;
// }

function App() {
  const { setSemester, setSchoolYear } = useUser();



  const setSchoolYearAndSemester = async () => {
    const semester = await fetchSemester();
    const school_year = await fetchShoolYear();

    setSchoolYear(school_year);
    setSemester(semester);
  };

  // const verifyAndFetchUser = async () => {
  //   try {
  //     const res = await apiClient.get("/auth/verify-jwt");
      
  //     if (res.data.success) {
  //       const user = res.data.user;
  //       // Try to get student_id, if not present, try userId
  //       const params: UserProps = {};


  //       if (user?.student_id) {

  //         params.student_id = user.student_id;

  //       } else if (user?.userId) {

  //         params.user_id = user.userId;

  //       }
  //       const userData = await getUserData(params);
  //       setUser(userData);
  //     } else {
  //       setUser(null);
  //     }
  //   } catch {
  //     setUser(null);
  //   }
  // };

  useEffect(() => {
    setSchoolYearAndSemester();
  }, []);

  // useEffect(() => {
  //   verifyAndFetchUser();
  // }, []);

  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route>
        <Route path="/" element={<Navigate to="login" replace />} />
        <Route path="/login" element={<LoginPageStudent />} />
        <Route path="/login/admin" element={<LoginPage />} />

        <Route element={<ProtectedPages />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route
            path="/calendar"
            element={<CalendarPage setIsOpenCalendar={() => {}} />}
          />
          <Route path="/vmgo" element={<VMGOPage />} />
          <Route path="/about-us" element={<AboutUsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/subsidy-payout" element={<SubsidyPayoutPage />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />

          <Route
            path="/clearance-validation"
            element={<ClearanceValidationPage />}
          />
          <Route path="/school-id" element={<ClaimingOfIDPage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    )
  );
  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        closeButton={false}
        rtl={false}
        pauseOnHover
        draggable
      />
      <Suspense fallback={<Loading />}>
        <RouterProvider router={router} />
      </Suspense>
    </>
  );
}

export default App;
