import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
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
import SingelReport from './pages/singelreport';
import AdminPanel from './pages/AdminPanel';
import AdminSidebar from './components/AdminSidebar';
import CreateAccount from './pages/CreateAccount';
import LoginPage from './pages/LoginPage';
import AdminDocAppointments from './pages/AdminDocAppointments';
import DocAllAppointment from './pages/DocAllAppointment';
import AdminAllAppointments from './pages/AdminAllAppointments';
import PatientNew from './pages/PatientNew';
import AppointmentView from './pages/AppointmentView';
import UserRegister from './pages/UserRegister';
import './App.css';
import { useLocation } from 'react-router-dom';

// Layout component for main app pages
function MainLayout({ children }) {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="app-container">
      {isAdminRoute ? <AdminSidebar /> : <Sidebar />}
      <div className="main-content">
        <Header />
        <div className="content-container">
          {children}
        </div>
      </div>
    </div>
  );
}

function AppRoutes() {
  const location = useLocation();

  // Routes that do not use the main layout
  const noLayoutRoutes = ['/', '/login', '/create-account'];

  const isNoLayout = noLayoutRoutes.includes(location.pathname);

  return (
    <Routes>
      {isNoLayout ? (
        <>
          <Route path="/" element={<LoginPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/create-account" element={<CreateAccount />} />
        </>
      ) : (
        <Route
          path="*"
          element={
            <MainLayout>
              <Routes>
                <Route path="/doctor" element={<Home />} />
                <Route path="/doctor/patients" element={<Patients />} />
                <Route path="/doctor/patients/new" element={<PatientNew />} />
                <Route path="/doctor/reports" element={<Reports />} />
                <Route path="/doctor/appointments" element={<Appointments />} />
                <Route path="/doctor/appointments/:id" element={<AppointmentView />} />
                <Route path="/doctor/settings" element={<Settings />} />
                <Route path="/doctor/patient/:id" element={<PatientDetails />} />
                <Route path="/doctor/patient/:id/visit" element={<Visit />} />
                <Route path="/doctor/visitpatient/:id" element={<Visitpatient />} />
                <Route path="/doctor/patient/:id/reportinfo" element={<ReportInfo />} />
                <Route path="/doctor/patient/:id/allergiesinfo" element={<Allergiesinfo />} />
                <Route path="/doctor/patient/:id/medicationsinfo" element={<MedicationsInfo />} />
                <Route path="/doctor/patient/:id/medicationsinfo/newprescription" element={<NewPrescription />} />
                <Route path="/doctor/patient/:id/historyinfo" element={<HistoryInfo />} />
                <Route path="/doctor/reports/:id" element={<SingelReport />} />
                <Route path="/admin" element={<AdminPanel />} />
                <Route path="/admin/docappointments" element={<AdminDocAppointments />} />
                <Route path="/admin/docappointments/:id" element={<DocAllAppointment />} />
                <Route path="/admin/allappointments" element={<AdminAllAppointments />} />
                <Route path="/admin/userregister" element={<UserRegister />} />
              </Routes>
            </MainLayout>
          }
        />
      )}
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

export default App;
