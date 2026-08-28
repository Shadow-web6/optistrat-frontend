import { Routes, Route, Navigate } from 'react-router-dom'
import { AppLayout } from '@/shared/components/AppLayout'
import { ClientPortalLayout } from '@/shared/components/ClientPortalLayout'
import { ProtectedRoute } from '@/shared/components/ProtectedRoute'
import { useAuthStore } from '@/modules/auth/api/useAuthStore'
import { useEffect } from 'react'

import LoginPage from '@/modules/auth/pages/LoginPage'
import DashboardPage from '@/modules/dashboard/pages/DashboardPage'
import CRMPage from '@/modules/crm/pages/CRMPage'
import OSDPage from '@/modules/osd/pages/OSDPage'
import DiagnosticDetailPage from '@/modules/osd/pages/DiagnosticDetailPage'
import HRPage from '@/modules/hr/pages/HRPage'
import ProjectsPage from '@/modules/projects/pages/ProjectsPage'
import ProjectKanbanPage from '@/modules/projects/pages/ProjectKanbanPage'
import GEDPage from '@/modules/ged/pages/GEDPage'
import PortalPage from '@/modules/portal/pages/PortalPage'
import FinancePage from '@/modules/finance/pages/FinancePage'
import AcademyPage from '@/modules/academy/pages/AcademyPage'
import EventsPage from '@/modules/events/pages/EventsPage'
import ProspectDetailPage from '@/modules/crm/pages/ProspectDetailPage'
import MyDiagnosticsPage from '@/modules/portal/pages/MyDiagnosticsPage'
import MyDocumentsPage from '@/modules/portal/pages/MyDocumentsPage'
import MyProjectsPage from '@/modules/portal/pages/MyProjectsPage'
import MyRequestsPage from '@/modules/portal/pages/MyRequestsPage'
import ChangePasswordPage from '@/modules/auth/pages/ChangePasswordPage'
import UsersPage from '@/modules/users/pages/UsersPage'
import PipelinePage from '@/modules/crm/pages/PipelinePage'
import PortalDiagnosticRunPage from '@/modules/portal/pages/PortalDiagnosticRunPage'

export default function App() {
  const user = useAuthStore((s) => s.user)
  const isClient = user?.role === 'client'
  const isInitializing = useAuthStore((s) => s.isInitializing)
  const bootstrap = useAuthStore((s) => s.bootstrap)

  useEffect(() => {
    bootstrap()
  }, [bootstrap])

  if (isInitializing) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-slate-500">
        Chargement…
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/change-password"
        element={
          <ProtectedRoute>
            <ChangePasswordPage />
          </ProtectedRoute>
        }
      />

      {/* --- Espace client --- */}
      <Route
        element={
          <ProtectedRoute>
            <ClientPortalLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/mon-espace" element={<MyDiagnosticsPage />} />
        <Route path="/mon-espace/diagnostics/:id" element={<PortalDiagnosticRunPage />} />
        <Route path="/mon-espace/documents" element={<MyDocumentsPage />} />
        <Route path="/mon-espace/projets" element={<MyProjectsPage />} />
        <Route path="/mon-espace/demandes" element={<MyRequestsPage />} />
      </Route>

      {/* --- Appli staff --- */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/crm" element={<CRMPage />} />
        <Route path="/osd" element={<OSDPage />} />
        <Route path="/osd/diagnostics/:id" element={<DiagnosticDetailPage />} />
        <Route path="/hr" element={<HRPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/projects/:id" element={<ProjectKanbanPage />} />
        <Route path="/ged" element={<GEDPage />} />
        <Route path="/portal" element={<PortalPage />} />
        <Route path="/finance" element={<FinancePage />} />
        <Route path="/academy" element={<AcademyPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/crm/:id" element={<ProspectDetailPage />} />
        <Route path="/crm/pipeline" element={<PipelinePage />} />
      </Route>

      <Route path="/" element={<Navigate to={isClient ? '/mon-espace' : '/dashboard'} replace />} />
      <Route path="*" element={<Navigate to={isClient ? '/mon-espace' : '/dashboard'} replace />} />
    </Routes>
  )
}