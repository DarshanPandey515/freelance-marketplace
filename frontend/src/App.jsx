import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import RequireRole from './components/RequireRole'
import { useAuth } from './hooks/useAuth'
import Login from './pages/Login'
import Signup from './pages/Signup'
import BrowseProjects from './pages/BrowseProjects'
import Contracts from './pages/Contracts'
import CreateProject from './pages/CreateProject'
import MyProjects from './pages/MyProjects'
import MyProposals from './pages/MyProposals'
import ProjectDetails from './pages/ProjectDetails'
import ProjectProposals from './pages/ProjectProposals'

function HomeRedirect() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  return <Navigate to={user.role === 'client' ? '/my-projects' : '/projects'} replace />
}

function App() {
  return (
    <Routes>
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<HomeRedirect />} />
          <Route path="/projects" element={<BrowseProjects />} />
          <Route path="/contracts" element={<Contracts />} />

          <Route
            path="/projects/new"
            element={
              <RequireRole role="client">
                <CreateProject />
              </RequireRole>
            }
          />
          <Route
            path="/my-projects"
            element={
              <RequireRole role="client">
                <MyProjects />
              </RequireRole>
            }
          />
          <Route
            path="/projects/:projectId/proposals"
            element={
              <RequireRole role="client">
                <ProjectProposals />
              </RequireRole>
            }
          />
          <Route
            path="/my-proposals"
            element={
              <RequireRole role="freelancer">
                <MyProposals />
              </RequireRole>
            }
          />

          <Route path="/projects/:projectId" element={<ProjectDetails />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App