import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

export default function SignOutButton() {
    const { signOut, loading } = useAuth()
    const navigate = useNavigate()

    async function handleClick() {
        try {
            await signOut()
            navigate('/')
        } catch (error) {
            console.error('Sign out failed', error)
        }
    }

    return (
        <button onClick={handleClick} disabled={loading}>
            {loading ? "Signing out" : "Sign out"}
        </button>
    )
}