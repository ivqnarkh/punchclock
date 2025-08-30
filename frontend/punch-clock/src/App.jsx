import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom"
import Home from './pages/Home'
import LoginPage from './pages/LoginPage.jsx'
import EmployeePage from './pages/EmployeePage.jsx'
import AdminPage from './pages/AdminPage.jsx'
import AuthProvider from './context/AuthContext.jsx'

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/employee" element={<EmployeePage />} />
            <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </AuthProvider>
    </Router>
  )
}

export default App;