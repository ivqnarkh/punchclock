import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'

export default function LoginPage() {
    const navigate = useNavigate()
    const [ formData, setFormData ] = useState({
        username: "",
        password: ""
    })

    const handleSubmit = async (e) => {
        console.log("fetching login")
        const response = await fetch('/api/login', {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        })
        console.log("fetched login")
        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.error || 'Failed to login')
        }

        const userRes = await fetch('/api/me')

        const user = await userRes.json()

        console.log("role" + user.data.role)
        if (!userRes.ok) {
            navigate('/login')
        } else {
            if (user.data.role === "ADMIN") {
                navigate('/admin')
            } else {
                navigate('/employee')
            }
        }
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
                    onChange={(e) => setFormData(prev => ({...prev, username: e.target.value}))}
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
                    onChange={(e) => setFormData(prev => ({...prev, password: e.target.value}))}
                />
                <button type="submit">Log in</button>
            </form>
        </div>
    )
}