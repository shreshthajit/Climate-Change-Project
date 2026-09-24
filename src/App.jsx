import { useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import CompareBar from './components/CompareBar'
import ErrorBoundary from './components/ErrorBoundary'
import Home from './pages/Home'
import Explore from './pages/Explore'
import Inventory from './pages/Inventory'
import RecordDetail from './pages/RecordDetail'
import Dashboard from './pages/Dashboard'
import Submit from './pages/Submit'
import BulkUpload from './pages/BulkUpload'
import Review from './pages/Review'
import Admin from './pages/Admin'
import Compare from './pages/Compare'
import About from './pages/About'
import { useApp } from './lib/store'

// Role is kept per browser, so a fresh visitor starts as "public". Offer the switch
// instead of silently redirecting, otherwise shared #/review or #/admin links look broken.
function RoleGate({ allow, children }) {
  const { role, setRole, t, lang } = useApp()
  if (allow.includes(role)) return children
  const need = allow[0]
  return (
    <div className="container page-body narrow">
      <div className="empty">
        <p>
          {lang === 'bn'
            ? `এই পাতাটি দেখতে "${t.roles[need]}" ভূমিকা প্রয়োজন।`
            : `This page needs the "${t.roles[need]}" role.`}
        </p>
        <button className="btn btn-green" onClick={() => setRole(need)}>
          {t.viewAs}: {t.roles[need]}
        </button>
      </div>
    </div>
  )
}

export default function App() {
  const { pathname } = useLocation()
  const { lang } = useApp()
  // Braces matter: newer Chrome returns a Promise from scrollTo, and React would call
  // an implicitly returned value as the effect cleanup ("l is not a function").
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <div className={`app lang-${lang}`}>
      <Header />
      <main>
        <ErrorBoundary key={pathname}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/record/:id" element={<RecordDetail />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/submit" element={<Submit />} />
          <Route path="/bulk" element={<BulkUpload />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/review" element={<RoleGate allow={['reviewer', 'admin']}><Review /></RoleGate>} />
          <Route path="/admin" element={<RoleGate allow={['admin']}><Admin /></RoleGate>} />
          <Route path="/about" element={<About />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </ErrorBoundary>
      </main>
      <CompareBar />
      <Footer />
    </div>
  )
}
