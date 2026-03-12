import { Suspense, lazy } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

const Dashboard = lazy(() => import('./pages/Dashboard'))
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const ExperiencePage = lazy(() => import('./pages/ExperiencePage'))
const AISymptomCheckPage = lazy(() => import('./pages/AISymptomCheckPage'))
const ComparePage = lazy(() => import('./pages/ComparePage'))
const HealthProfilePage = lazy(() => import('./pages/HealthProfilePage'))
const SearchPage = lazy(() => import('./pages/SearchPage'))
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'))
const AdminPage = lazy(() => import('./pages/AdminPage'))
const HospitalsPage = lazy(() => import('./pages/HospitalsPage'))
const CommunityPage = lazy(() => import('./pages/CommunityPage'))
const MyJourneyPage = lazy(() => import('./pages/MyJourneyPage'))
const SavedInsightsPage = lazy(() => import('./pages/SavedInsightsPage'))
const SettingsPage = lazy(() => import('./pages/SettingsPage'))
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'))
const ProfilePage = lazy(() => import('./pages/ProfilePage'))
const MessagesPage = lazy(() => import('./pages/MessagesPage'))
const EmergencyViewPage = lazy(() => import('./pages/EmergencyViewPage'))
const LandingPage = lazy(() => import('./pages/LandingPage'))

function App() {
  return (
    <>
      <Router>
        <div className="min-h-screen bg-gray-50 text-gray-900">
          <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          }>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/welcome" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/share-experience" element={<ExperiencePage />} />
              <Route path="/ai-symptom-check" element={<AISymptomCheckPage />} />
              <Route path="/compare" element={<ComparePage />} />
              <Route path="/health-profile" element={<HealthProfilePage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/hospitals" element={<HospitalsPage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/community" element={<CommunityPage />} />
              <Route path="/my-journey" element={<MyJourneyPage />} />
              <Route path="/saved" element={<SavedInsightsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/profile/:username" element={<ProfilePage />} />
              <Route path="/messages" element={<MessagesPage />} />
              <Route path="/emergency/:id" element={<EmergencyViewPage />} />
            </Routes>
          </Suspense>
        </div>
      </Router>
    </>
  )
}

export default App
