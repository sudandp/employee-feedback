import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import AdminDashboard from "./pages/AdminDashboard";
import HRDashboard from "./pages/HRDashboard";
import ManagerDashboard from "./pages/ManagerDashboard";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import OKRDashboard from "./pages/OKRDashboard";
import { SurveyProvider } from "./context/SurveyContext";

export default function App() {
  return (
    <SurveyProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/admin" replace />} />
            <Route path="admin" element={<AdminDashboard />} />
            <Route path="hr" element={<HRDashboard />} />
            <Route path="manager" element={<ManagerDashboard />} />
            <Route path="employee" element={<EmployeeDashboard />} />
            <Route path="okrs" element={<OKRDashboard />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </SurveyProvider>
  );
}

