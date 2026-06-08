import { Routes, Route } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import Layout from './components/Layout'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import ConversationsPage from './pages/ConversationsPage'
import TutorsPage from './pages/TutorsPage'
import PetsPage from './pages/PetsPage'
import AppointmentsPage from './pages/AppointmentsPage'
import KnowledgeBasePage from './pages/KnowledgeBasePage'
import ServicesPage from './pages/ServicesPage'
import ReportsPage from './pages/ReportsPage'
import LeadsPage from './pages/LeadsPage'
import EmergenciesPage from './pages/EmergenciesPage'
import SettingsPage from './pages/SettingsPage'
import UsersPage from './pages/UsersPage'

function App() {
  const { isAuthenticated } = useAuthStore()

  if (!isAuthenticated) {
    return <LoginPage />
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/conversations" element={<ConversationsPage />} />
        <Route path="/tutors" element={<TutorsPage />} />
        <Route path="/pets" element={<PetsPage />} />
        <Route path="/appointments" element={<AppointmentsPage />} />
        <Route path="/knowledge" element={<KnowledgeBasePage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/leads" element={<LeadsPage />} />
        <Route path="/emergencies" element={<EmergenciesPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/users" element={<UsersPage />} />
      </Routes>
    </Layout>
  )
}

export default App