import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

export default function RequireRole({ allow }) {
    const { user, loading } = useAuth()

    if (loading) return null
    if (!allow.includes(user.role)) {
        return <Navigate to="/" replace />
    }
    return <Outlet />
}