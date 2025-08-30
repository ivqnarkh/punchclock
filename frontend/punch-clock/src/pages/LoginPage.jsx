import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
    const [ formData, setFormData ] = useState({
        username: "",
        password: ""
    })
    const [ errors, setErrors ] = useState("")
    const [ submitting, setSubmitting ] = useState(false)
    const { signIn, user, loading } = useAuth()
    const navigate = useNavigate()

    if (loading) return null

    if (user?.role === 'ADMIN') {
        return <Navigate to="/admin" replace />
    }

    if (user?.role === 'USER') {
        return <Navigate to='/employee' replace />
    }

    const handleSubmit = async (e) => {
        try {
            setSubmitting(true)
            setErrors({})

            const me = await signIn(formData.username, formData.password)

            console.log(me)
            navigate(me?.role === "ADMIN" ? '/admin' : '/employee' )
        } catch {
            setErrors({ submit: 'Failed to sign in' })
        } finally {
            setSubmitting(false)
        }
    }

    const handleChange = async (e) => {
        const { name, value } = e.target 
        setFormData((prev) => ({ ...prev, [name]: value}))
    }

    return (
        <div>
            <h2>Login</h2>
            <form onSubmit={(e) => {
                e.preventDefault()
                handleSubmit(e)
            }}>
                <label htmlFor="username-input">
                    Username
                </label>
                <input 
                    type="text"
                    name="username"
                    id="username-input"
                    value={formData.username}
                    required
                    onChange={handleChange}
                />
                <label htmlFor="password-input">
                    Password
                </label>
                <input
                    type="password"
                    name="password"
                    id="password-input"
                    value={formData.password}
                    required
                    onChange={handleChange}
                /><br></br>
                {errors.submit && <p className="text-red-500">{errors.submit}</p>}
                <button type="submit">Log in</button>
            </form>
        </div>
    )
}