import { useState, useEffect } from 'react'
import SignOutButton from '../components/SignOutButton'
import PunchesList from '../components/PunchesList'
import DateRangeFilter from '../components/DateRangeFilter'
import { fetchHoursWorked } from '../api/hours'
import AdminRegisterUser from '../components/AdminRegisterUser'

export default function AdminPage() {
    const [userId, setUserId] = useState('')
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [users, setUsers] = useState([])
    const [refreshTrigger, setRefreshTrigger] = useState(0)
    const [hoursWorked, setHoursWorked] = useState(null)
    const [error, setError] = useState("")

    async function updateHoursWorked() {
        try {
            const hours = await fetchHoursWorked({ startDate, endDate, userId })
            setHoursWorked(hours)
        } catch (err) {
            console.error(err)
            setError('Failed to fetch hours worked')
        }
    }

    async function getUsers() {
        const response = await fetch('/api/employees', { credentials: 'include' })

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}))
            throw new Error(errData.error || `Failed to fetch employees (status: ${response.status})`)
        }

        const data = await response.json()
        setUsers(data.users)
    }

    function handleUserRegistered(newUser) {
        setUsers(prev => [...prev, newUser])
    }

    useEffect(() => {
        getUsers()
        updateHoursWorked()
    }, [startDate, endDate, refreshTrigger])

    return (
        <div>
        <h1>Admin Page</h1>

        <label>
            Select User:
            <select value={userId} onChange={e => {setUserId(e.target.value); setRefreshTrigger(prev => prev + 1)}}>
            <option value="">-- Select a user --</option>
            {users.map(u => (
                <option key={u.id} value={u.id}>{u.username}</option>
            ))}
            </select>
        </label>

        {error && <p className="text-red-500" role="alert">{error}</p>}

        <DateRangeFilter
            startDate={startDate}
            endDate={endDate}
            onStartChange={setStartDate}
            onEndChange={setEndDate}
        />

        {hoursWorked !== null && (
            <p>Total hours worked: {hoursWorked}h</p>
        )}

        {userId ? (
            <PunchesList refreshTrigger={refreshTrigger} userId={userId} startDate={startDate} endDate={endDate} />
        ) : (
            <p>Please select a user to view punches.</p>
        )}
        <div>
            <AdminRegisterUser onUserRegistered={handleUserRegistered} />
        </div>
        <SignOutButton />
        </div>
    )
}