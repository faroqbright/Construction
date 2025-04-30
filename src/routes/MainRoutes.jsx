import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import Login from "../pages/LoginPages/Login/Login";
import ForgotPass from "../pages/LoginPages/ForgotPassword/ForgotPass";
import OtpPage from "../pages/LoginPages/Otp/OtpPage";
import ConfirmReset from "../pages/LoginPages/ForgotPassword/ConfirmReset";
import RouteMiddleware from "./RouteMIddleware";
import AuthLayout from "./AuthLayout";
import Layout from "./Layout";
import Dashboard from "../pages/MainPages/Dashboard/Dashboard";
import AllProjects from "../pages/MainPages/AllProjects/AllProjects";
import History from "../pages/MainPages/History/History";
import Notifications from "../pages/MainPages/Notifications/Notifications";
import Client from "../pages/MainPages/Client/Client";
import AllClients from "../pages/MainPages/AllClient/AllClients";
import RolesUsers from "../pages/MainPages/RolesUser/RolesUsers";
import ProjectDetails from "../pages/MainPages/ProjectDetails/Details";
import EditProject from "../pages/MainPages/EditProject/EditProject";
import ReportsName from "../pages/MainPages/ReportsName/ReportsName";
import ReportsPage from "../pages/MainPages/Report/Report";
import UserReportsPage from "../pages/MainPages/Report/userReport";
import SubmitReportPage from "../pages/MainPages/Report/submitReport";
import SubmitLandlordReportPage from "../pages/MainPages/Report/SubmitLandlordReport";
import Documentpage from "../pages/MainPages/documents/documents";
import SubmitDocumentPage from "../pages/MainPages/documents/submitDocument";
import AllComapnies from "../pages/MainPages/AllCompanies/AllCompanies";
import Finance from "../components/LandingPage/Finance/Finance";
import SubmitFinance from "../components/LandingPage/Finance/SubmitFinance";
import Settings from "../pages/MainPages/Settings/settings";
import { Bus, Milestone } from "lucide-react";
import Milestones from "../pages/MainPages/AdditionalMilestone/MileStones";
import BusinessAreas from "../pages/BusinessArea/BusinessArea";
import ClientEvaluationId from "../components/LandingPage/Client/ClientEvaluationId";
import NotificationDetails from "../components/Notifications/NotificationDetails";

const App = () => {
  return (
    <>
      <Router>
        <Routes>
          <Route element={<AuthLayout />}>
            <Route
              path="/login"
              element={
                <RouteMiddleware isAuthRequired={false}>
                  <Login />
                </RouteMiddleware>
              }
            />
            <Route
              path="/forgot-password"
              element={
                <RouteMiddleware isAuthRequired={false}>
                  <ForgotPass />
                </RouteMiddleware>
              }
            />
            <Route
              path="/recovery"
              element={
                <RouteMiddleware isAuthRequired={false}>
                  <OtpPage />
                </RouteMiddleware>
              }
            />
            <Route
              path="/reset-password"
              element={
                <RouteMiddleware isAuthRequired={false}>
                  <ConfirmReset />
                </RouteMiddleware>
              }
            />
          </Route>
          <Route element={<Layout />}>
            <Route
              path="/"
              element={
                <RouteMiddleware isAuthRequired={true}>
                  <Dashboard />
                </RouteMiddleware>
              }
            />
            <Route
              path="/settings"
              element={
                <RouteMiddleware isAuthRequired={true}>
                  <Settings />
                </RouteMiddleware>
              }
            />
            <Route
              path="/finance"
              element={
                <RouteMiddleware
                  requiredModules={["FinanceManagement"]}
                  isAuthRequired={true}
                >
                  <Finance />
                </RouteMiddleware>
              }
            />
            <Route
              path="/SubmitFinance"
              element={
                <RouteMiddleware isAuthRequired={true}>
                  <SubmitFinance />
                </RouteMiddleware>
              }
            />

            <Route
              path="/project-management"
              element={
                <RouteMiddleware
                  isAuthRequired={true}
                  requiredModules={["ProjectsManagement"]}
                >
                  <AllProjects />
                </RouteMiddleware>
              }
            />
            <Route
              path="/history"
              element={
                <RouteMiddleware
                  isAuthRequired={true}
                  requiredModules={["HistoryManagement"]}
                >
                  <History />
                </RouteMiddleware>
              }
            />

            <Route
              path="/report"
              element={
                <RouteMiddleware
                  isAuthRequired={true}
                  requiredModules={["ReportsManagement"]}
                >
                  <ReportsPage />
                </RouteMiddleware>
              }
            />
            <Route
              path="/userReports"
              element={
                <RouteMiddleware
                  isAuthRequired={true}
                  requiredModules={["ReportsManagement"]}
                >
                  <UserReportsPage />
                </RouteMiddleware>
              }
            />
            <Route
              path="/submitReport"
              element={
                <RouteMiddleware
                  isAuthRequired={true}
                  requiredModules={["ReportsManagement"]}
                >
                  <SubmitReportPage />
                </RouteMiddleware>
              }
            />
            <Route
              path="/submitLandlordReport"
              element={
                <RouteMiddleware
                  isAuthRequired={true}
                  requiredModules={["ReportsManagement"]}
                >
                  <SubmitLandlordReportPage />
                </RouteMiddleware>
              }
            />

            <Route
              path="/submitDocument"
              element={
                <RouteMiddleware
                  isAuthRequired={true}
                  requiredModules={["ReportsManagement"]}
                >
                  <SubmitDocumentPage />
                </RouteMiddleware>
              }
            />

            <Route
              path="/documents"
              element={
                <RouteMiddleware
                  isAuthRequired={true}
                  requiredModules={["DocumentManagement"]}
                >
                  <Documentpage />
                </RouteMiddleware>
              }
            />
            <Route
              path="/notifications"
              element={
                <RouteMiddleware isAuthRequired={true}>
                  <Notifications />
                </RouteMiddleware>
              }
            />
            <Route
              path="/notificationDetails/:id"
              element={
                <RouteMiddleware isAuthRequired={true}>
                  <NotificationDetails/>
                </RouteMiddleware>
              }
            />
            <Route
              path="/client-evaluation"
              element={
                <RouteMiddleware
                  isAuthRequired={true}
                  requiredModules={["EvaluationManagement"]}
                >
                  <Client />
                </RouteMiddleware>
              }
            />
            <Route
              path="/client-evaluations/:id"
              element={
                <RouteMiddleware
                  isAuthRequired={true}
                  requiredModules={["EvaluationManagement"]}
                >
                  <ClientEvaluationId />
                </RouteMiddleware>
              }
            />
            <Route
              path="/all-clients"
              element={
                <RouteMiddleware
                  isAuthRequired={true}
                  requiredModules={["CompanyManagement"]}
                >
                  <AllClients />
                </RouteMiddleware>
              }
            />
            <Route
              path="/additional-milestones"
              element={
                <RouteMiddleware
                  isAuthRequired={true}
                  requiredModules={["MilestoneManagement"]}
                >
                  <Milestones />
                </RouteMiddleware>
              }
            />
            {/* <Route
              path="/business-areas"
              element={
                <RouteMiddleware
                  isAuthRequired={true}
                  requiredModules={["BusinessAreaManagement"]}
                >
                </RouteMiddleware>
              }
            /> */}
            <Route
              path="/all-companies"
              element={
                <RouteMiddleware
                  isAuthRequired={true}
                  requiredModules={["ClientsManagement"]}
                >
                  <AllComapnies />
                </RouteMiddleware>
              }
            />
            <Route
              path="/roles-users"
              element={
                <RouteMiddleware
                  isAuthRequired={true}
                  requiredModules={["UsersManagement", "RolesManagement"]}
                >
                  <RolesUsers />
                </RouteMiddleware>
              }
            />
            <Route
              path="/details/:id"
              element={
                <RouteMiddleware
                  isAuthRequired={true}
                  requiredModules={["ProjectsManagement"]}
                >
                  <ProjectDetails />
                </RouteMiddleware>
              }
            />
            <Route
              path="/details/view/:id"
              element={
                <RouteMiddleware
                  isAuthRequired={true}
                  requiredModules={["ProjectsManagement"]}
                >
                  <EditProject />
                </RouteMiddleware>
              }
            />
            <Route
              path="/details/create/"
              element={
                <RouteMiddleware
                  isAuthRequired={true}
                  requiredModules={["ProjectsManagement"]}
                >
                  <EditProject />
                </RouteMiddleware>
              }
            />
            <Route
              path="/details/edit/:id"
              element={
                <RouteMiddleware
                  isAuthRequired={true}
                  requiredModules={["ProjectsManagement"]}
                >
                  <EditProject />
                </RouteMiddleware>
              }
            />
            <Route
              path="/report-name"
              element={
                <RouteMiddleware isAuthRequired={true}>
                  <ReportsName />
                </RouteMiddleware>
              }
            />
          </Route>
        </Routes>
      </Router>
    </>
  );
};

export default App;
