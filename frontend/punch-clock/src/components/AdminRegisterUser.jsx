import { useState } from 'react'

export default function AdminRegisterUser({ onUserRegistered }) {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [role, setRole] = useState('USER')
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e) {
        e.preventDefault()
        setError('')
        setSuccess('')
        setLoading(true)

        try {
        const res = await fetch('/api/admin/registerUser', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password, role })
        })

        const data = await res.json()
        if (!res.ok) {
            setError(data.error || 'Registration failed')
        } else {
            setSuccess(`User '${data.user.username}' registered successfully!`)
            setUsername('')
            setPassword('')
            setRole('USER')
            if (onUserRegistered) onUserRegistered(data.user)
        }
        } catch (err) {
        setError('Network or server error')
        } finally {
        setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit}>
        <h2>Register New User</h2>

        <label>
            Username:
            <input type="text" value={username} onChange={e => setUsername(e.target.value)} required />
        </label>

        <label>
            Password:
            <input type="text" value={password} onChange={e => setPassword(e.target.value)} required />
        </label>

        <label>
            Role:
            <select value={role} onChange={e => setRole(e.target.value)}>
            <option value="USER">User</option>
            <option value="ADMIN">Admin</option>
            </select>
        </label>

        {error && <p style={{color: 'red'}}>{error}</p>}
        {success && <p style={{color: 'green'}}>{success}</p>}

        <button type="submit" disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
        </button>
        </form>
    )
}