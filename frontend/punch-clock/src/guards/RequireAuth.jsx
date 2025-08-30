import { useAuth } from '../context/AuthContext'
import { Navigate, Outlet, useLocation } from 'react-router-dom'

export default function RequireAuth() {
    const { user, loading } = useAuth()
    const location = useLocation()

    if (loading) return null
    if (!user) {
        return <Navigate to="/" replace state={{ from: location }} />
    }
    return <Outlet />
}