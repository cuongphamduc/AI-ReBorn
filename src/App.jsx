import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider, useApp } from './context/AppContext'
import Navigation from './components/shared/Navigation'

import Login from './components/admin/Login'
import ModelManager from './components/admin/ModelManager'
import Statistics from './components/admin/Statistics'

import WasteRecognition from './components/student/WasteRecognition'
import RecycleSuggestion from './components/student/RecycleSuggestion'
import ProductCreation from './components/student/ProductCreation'
import GreenDashboard from './components/student/GreenDashboard'

function ProtectedAdmin({ children }) {
  const { adminUser } = useApp()
  if (!adminUser) return <Navigate to="/admin/login" replace />
  return children
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/admin/login" element={<Login />} />
      <Route
        path="/admin/model"
        element={
          <ProtectedAdmin>
            <ModelManager />
          </ProtectedAdmin>
        }
      />
      <Route
        path="/admin/stats"
        element={
          <ProtectedAdmin>
            <Statistics />
          </ProtectedAdmin>
        }
      />
      <Route path="/" element={<WasteRecognition />} />
      <Route path="/suggestion" element={<RecycleSuggestion />} />
      <Route path="/product" element={<ProductCreation />} />
      <Route path="/dashboard" element={<GreenDashboard />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter basename="/aireborn">
        <div className="min-h-screen bg-green-50">
          <Navigation />
          <main className="max-w-6xl mx-auto py-8">
            <AppRoutes />
          </main>
        </div>
      </BrowserRouter>
    </AppProvider>
  )
}
