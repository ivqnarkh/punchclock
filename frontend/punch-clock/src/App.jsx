import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom"
import Home from './pages/Home'
import LoginPage from './pages/LoginPage.jsx'
import EmployeePage from './pages/EmployeePage.jsx'
import AdminPage from './pages/AdminPage.jsx'
import AuthProvider from './context/AuthContext.jsx'
import RequireAuth from "./guards/RequireAuth.jsx"
import RequireRole from "./guards/RequireRole.jsx"

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<LoginPage />} />

              <Route element={<RequireAuth />}>

                <Route element={<RequireRole allow={'ADMIN'} />}>
                  <Route path="/admin" element={<AdminPage />} />
                </Route>

                <Route element={<RequireRole allow={'USER'} />}>
                  <Route path="/employee" element={<EmployeePage />} />
                </Route>

              </Route>
        </Routes>
      </AuthProvider>
    </Router>
  )
}

export default App;