import SignOutButton from '../components/SignOutButton'
import PunchesList from '../components/PunchesList'
import { useState, useEffect } from 'react'
import { fetchHoursWorked } from '../api/hours'
import DateRangeFilter from '../components/DateRangeFilter'

export default function EmployeePage() {
    const [location, setLocation] = useState("")
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")
    const [loading, setLoading] = useState(false)
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [hoursWorked, setHoursWorked] = useState(null)
    const [refreshTrigger, setRefreshTrigger] = useState(0)

    async function updateHoursWorked() {
        try {
        const hours = await fetchHoursWorked({ startDate, endDate })
        setHoursWorked(hours)
        } catch (err) {
        console.error(err)
        setError('Failed to fetch hours worked')
        }
    }

    useEffect(() => {
        updateHoursWorked()
    }, [startDate, endDate, refreshTrigger])

    async function makePunch() {
        setError("")
        setSuccess("")
        setLoading(true)

        try {
        const response = await fetch('/api/punches', {
            method: "POST",
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ location })
        })

        if (!response.ok) {
            const errData = await response.json()
            return setError(errData.error || "Punch failed")
        }

        const recentPunch = await response.json()
        const punchData = recentPunch.punch
        if (punchData) {
            const type = punchData.type
            const time = new Date(punchData.punchedAt).toLocaleString()
            const loc = punchData.location || location || "default location"
            setSuccess(`Punch ${type} successful at ${loc} (${time})`)
        } else {
            setSuccess("Punch recorded successfully!")
        }

        setRefreshTrigger(prev => prev + 1)
        setLocation("")

        setTimeout(() => setSuccess(""), 60000)

        } catch (networkError) {
            setError("Network error. Please check your connection and try again.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div>
        <h1>Employee Page</h1>

        <form onSubmit={e => { e.preventDefault(); makePunch() }}>
            <label htmlFor='location'>Location:</label>
            <input
            type='text'
            name='location'
            id='location-input'
            value={location}
            required
            onChange={e => setLocation(e.target.value)}
            disabled={loading}
            />
            
            {error && <p className="text-red-500" role="alert">{error}</p>}
            {success && <p className="text-green-500" role="status">{success}</p>}
            
            <button type='submit' disabled={loading}>
            {loading ? 'Recording...' : 'Punch'}
            </button>
        </form>

        {hoursWorked !== null && (
            <p>Total hours worked: {hoursWorked}h</p>
        )}
        
        <DateRangeFilter
            startDate={startDate}
            endDate={endDate}
            onStartChange={setStartDate}
            onEndChange={setEndDate}
        />

        <PunchesList refreshTrigger={refreshTrigger} />
        <SignOutButton />
        </div>
    )
}