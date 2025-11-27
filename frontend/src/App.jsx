import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';

// Doctor Pages
import Home from './pages/Home';
import Patients from './pages/Patients';
import Reports from './pages/Reports';
import Appointments from './pages/Appointments';
import Settings from './pages/Settings';
import PatientDetails from "./pages/PatientDetails";
import Visit from './pages/Visit';
import ReportInfo from './pages/ReportInfo';
import Visitpatient from './pages/Visitpatient';
import Allergiesinfo from './pages/allergiesinfo';
import MedicationsInfo from './pages/medicationsinfo';
import HistoryInfo from './pages/historyinfo';
import NewPrescription from './pages/NewPrescription';
import SingleReport from './pages/SingleReport';
import PatientNew from './pages/PatientNew';
import AppointmentView from './pages/AppointmentView';
import OrderNewReport from './pages/OrderNewReport';

// Admin Pages
import AdminPanel from './pages/AdminPanel';
import AdminSidebar from './components/AdminSidebar';
import StaffSidebar from './components/StaffSidebar';
import CreateAccount from './pages/CreateAccount';
import LoginPage from './pages/LoginPage';
import AdminDocAppointments from './pages/AdminDocAppointments';
import DocAllAppointment from './pages/DocAllAppointment';
import AdminAllAppointments from './pages/AdminAllAppointments';
import AdminUsers from './pages/AdminUsers';
import UserRegister from './pages/UserRegister';
import StaffHome from './pages/StaffHome';
import StaffPatients from './pages/StaffPatients';
import StaffAppointments from './pages/StaffAppointments';
import StaffAppointmentNew from './pages/StaffAppointmentNew';

// Lab Assistant Pages
import LabAssistantDashboard from './pages/LabAssistantDashboard';
import AddLabReport from './pages/AddLabReport';
import AddLabReportForm from './pages/AddLabReportForm';

// System Pages
import ProtectedRoute from './components/ProtectedRoute';

import './App.css';
import { useLocation } from 'react-router-dom';


// -------------------------
// MAIN LAYOUT
// -------------------------
function MainLayout() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isStaffRoute = location.pathname.startsWith('/staff');
  const isNurseRoute = location.pathname.startsWith('/nurse');

  return (
    <div className="app-container">
      {isAdminRoute ? <AdminSidebar /> : (isStaffRoute || isNurseRoute) ? <StaffSidebar /> : <Sidebar />}
      <div className="main-content">
        <Header />
        <div className="content-container">
          <Outlet />
        </div>
      </div>
    </div>
  );
}


// -------------------------
// APP ROUTES
// -------------------------
function App() {
  return (
    <Router>
      <Routes>

        {/* PUBLIC ROUTES */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/create-account" element={<CreateAccount />} />

        {/* PROTECTED ROUTES */}
        <Route path="*" element={<MainLayout />}>

          {/* ======================= */}
          {/*       DOCTOR ROUTES     */}
          {/* ======================= */}
          <Route path="doctor" element={<ProtectedRoute allowedRoles={['doctor']}><Home /></ProtectedRoute>} />
          <Route path="doctor/patients" element={<ProtectedRoute allowedRoles={['doctor']}><Patients /></ProtectedRoute>} />
          <Route path="doctor/patients/new" element={<ProtectedRoute allowedRoles={['doctor']}><PatientNew /></ProtectedRoute>} />
          <Route path="doctor/reports" element={<ProtectedRoute allowedRoles={['doctor']}><Reports /></ProtectedRoute>} />

          <Route path="doctor/appointments" element={<ProtectedRoute allowedRoles={['doctor']}><Appointments /></ProtectedRoute>} />
          <Route path="doctor/appointments/:id" element={<ProtectedRoute allowedRoles={['doctor']}><AppointmentView /></ProtectedRoute>} />

          <Route path="doctor/settings" element={<ProtectedRoute allowedRoles={['doctor']}><Settings /></ProtectedRoute>} />

          <Route path="doctor/patient/:id" element={<ProtectedRoute allowedRoles={['doctor']}><PatientDetails /></ProtectedRoute>} />
          <Route path="doctor/patient/:id/visit" element={<ProtectedRoute allowedRoles={['doctor']}><Visit /></ProtectedRoute>} />
          <Route path="doctor/visitpatient/:id" element={<ProtectedRoute allowedRoles={['doctor']}><Visitpatient /></ProtectedRoute>} />
          <Route path="doctor/visitpatient/:id/order-report" element={<ProtectedRoute allowedRoles={['doctor']}><OrderNewReport /></ProtectedRoute>} />

          <Route path="doctor/patient/:id/reportinfo" element={<ProtectedRoute allowedRoles={['doctor']}><ReportInfo /></ProtectedRoute>} />
          <Route path="doctor/patient/:id/allergiesinfo" element={<ProtectedRoute allowedRoles={['doctor']}><Allergiesinfo /></ProtectedRoute>} />
          <Route path="doctor/patient/:id/medicationsinfo" element={<ProtectedRoute allowedRoles={['doctor']}><MedicationsInfo /></ProtectedRoute>} />
          <Route path="doctor/patient/:id/medicationsinfo/newprescription" element={<ProtectedRoute allowedRoles={['doctor']}><NewPrescription /></ProtectedRoute>} />
          <Route path="doctor/patient/:id/historyinfo" element={<ProtectedRoute allowedRoles={['doctor']}><HistoryInfo /></ProtectedRoute>} />

          <Route path="doctor/reports/:id" element={<ProtectedRoute allowedRoles={['doctor']}><SingleReport /></ProtectedRoute>} />
          <Route path="doctor/report/:labId" element={<ProtectedRoute allowedRoles={['doctor']}><SingleReport /></ProtectedRoute>} />


          {/* ======================= */}
          {/*   LAB ASSISTANT ROUTES  */}
          {/* ======================= */}
          <Route
            path="lab-assistant"
            element={
              <ProtectedRoute allowedRoles={['lab_assistant']}>
                <LabAssistantDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="lab-assistant/add-report"
            element={
              <ProtectedRoute allowedRoles={['lab_assistant']}>
                <AddLabReport />
              </ProtectedRoute>
            }
          />

          <Route
            path="lab-assistant/add-report/:id"
            element={
              <ProtectedRoute allowedRoles={['lab_assistant']}>
                <AddLabReportForm />
              </ProtectedRoute>
            }
          />

          <Route
            path="lab-assistant/update-report"
            element={
              <ProtectedRoute allowedRoles={['lab_assistant']}>
                <div>Update Report Coming Soon</div>
              </ProtectedRoute>
            }
          />


          {/* ======================= */}
          {/*       ADMIN ROUTES      */}
          {/* ======================= */}
          <Route path="admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminPanel /></ProtectedRoute>} />
          <Route path="admin/users" element={<ProtectedRoute allowedRoles={['admin']}><AdminUsers /></ProtectedRoute>} />
          <Route path="admin/docappointments" element={<ProtectedRoute allowedRoles={['admin']}><AdminDocAppointments /></ProtectedRoute>} />
          <Route path="admin/docappointments/:id" element={<ProtectedRoute allowedRoles={['admin']}><DocAllAppointment /></ProtectedRoute>} />
          <Route path="admin/allappointments" element={<ProtectedRoute allowedRoles={['admin']}><AdminAllAppointments /></ProtectedRoute>} />
          <Route path="admin/userregister" element={<ProtectedRoute allowedRoles={['admin']}><UserRegister /></ProtectedRoute>} />
          <Route path="admin/settings" element={<ProtectedRoute allowedRoles={['admin']}><Settings /></ProtectedRoute>} />

          {/* STAFF PAGES */}
          <Route path="staff" element={<ProtectedRoute allowedRoles={['nurse', 'lab_assistant']}><StaffHome /></ProtectedRoute>} />
          <Route path="staff/patients" element={<ProtectedRoute allowedRoles={['nurse', 'lab_assistant']}><StaffPatients /></ProtectedRoute>} />
          <Route path="staff/patients/new" element={<ProtectedRoute allowedRoles={['nurse', 'lab_assistant']}><PatientNew /></ProtectedRoute>} />
          <Route path="staff/appointments" element={<ProtectedRoute allowedRoles={['nurse', 'lab_assistant']}><StaffAppointments /></ProtectedRoute>} />
          <Route path="staff/appointments/new" element={<ProtectedRoute allowedRoles={['nurse', 'lab_assistant']}><StaffAppointmentNew /></ProtectedRoute>} />
          <Route path="staff/settings" element={<ProtectedRoute allowedRoles={['nurse', 'lab_assistant']}><Settings /></ProtectedRoute>} />

          {/* NURSE ROUTES */}
          <Route path="nurse" element={<ProtectedRoute allowedRoles={['nurse']}><StaffAppointmentNew /></ProtectedRoute>} />

        </Route>
      </Routes>
    </Router>
  );
}

export default App;
