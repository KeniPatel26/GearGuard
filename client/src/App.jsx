import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Button } from './components/ui/button'
import Login from './pages/Login'
import Home from './pages/Home'
import ProtectedRoute from './routes/ProtectedRoute'
import Dashboard from './pages/Dashboard'
import { AppProvider } from './contexts/AppContext'
import { Toaster } from 'sonner'
import ForgotPassword from './pages/ForgotPassword'
import AdminDashboardLayout from './layouts/AdminDashboardLayout'

function App() {
  return (
    <BrowserRouter>
      <Toaster richColors position="top-right" />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/admin" element={<AdminDashboardLayout />} />
        {/* Protected routes */}

        <Route element={
          <AppProvider>
            <ProtectedRoute />
          </AppProvider>
        }>
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
