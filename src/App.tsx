import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './layouts/AdminLayout';
import ControlLayout from './layouts/ControlLayout';
import GuardLayout from './layouts/GuardLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AccessControl from './pages/guard/AccessControl';
import Rounds from './pages/guard/Rounds';
import Incidents from './pages/guard/Incidents';
import Monitor from './pages/control/Monitor';
import Dashboard from './pages/guard/Dashboard';
import Communications from './pages/admin/Communications';
import ControlCommunications from './pages/control/Communications';
import UserManagement from './pages/admin/UserManagement';
import Docs from './pages/control/Docs';
import Inbox from './pages/guard/Inbox';
import Login from './pages/auth/Login';
import AccessLogsReport from './components/AccessLogsReport';


// Placeholders for dashboards
const GuardDashboard = () => <Dashboard />; // Using the real component

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="map" element={<div className="text-white p-8">Mapa Global (WIP)</div>} />
          <Route path="users" element={<UserManagement />} />
          <Route path="communications" element={<Communications />} />
          <Route path="access-logs" element={<AccessLogsReport />} />
          <Route path="reports" element={<div className="text-white p-8">Reportes (WIP)</div>} />
        </Route>

        {/* Control Routes */}
        <Route path="/control" element={<ControlLayout />}>
          <Route index element={<Navigate to="/control/monitor" replace />} />
          <Route path="monitor" element={<Monitor />} />
          <Route path="communications" element={<ControlCommunications />} />
          <Route path="docs" element={<Docs />} />
          <Route path="access-logs" element={<AccessLogsReport />} />
        </Route>

        {/* Guard Routes */}
        <Route path="/guard" element={<GuardLayout />}>
          <Route index element={<Navigate to="/guard/home" replace />} />
          <Route path="home" element={<GuardDashboard />} />
          <Route path="access" element={<AccessControl />} />
          <Route path="rounds" element={<Rounds />} />
          <Route path="incidents" element={<Incidents />} />
          <Route path="communications" element={<Inbox />} />
        </Route>

        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
