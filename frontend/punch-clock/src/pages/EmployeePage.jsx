import SignOutButton from '../components/SignOutButton'
import PunchesList from '../components/PunchesList'
import { useState } from 'react'
import { use } from 'react'

export default function EmployeePage() {
    const [ location, setLocation ] = useState("")
    const [ error, setError ] = useState("")
    const [ punch, setPunch ] = useState(null)

    async function makePunch() {
        console.log("attempting punch")
        const response = await fetch('/api/me/punches', {
            method: "POST",
            credentials: 'include',
            headers: { 'Content-Type': 'application/json'},
            body: JSON.stringify({ location })
        })

        if (!response.ok) {
            return setError("Punch failed")
        }

        const recentPunch = await response.json()
        console.log(recentPunch)
        setPunch(recentPunch)
        setError("Punched in at: " + punch.location + " at: " + punch.punchedAt)
    }

    const handleSubmit = async (e) => {
        makePunch()
    }

    return (
        <div>
            <h1>Employee Page</h1>
            <div>
                <form onSubmit={(e) => {
                    e.preventDefault()
                    handleSubmit(e)
                }}>
                    <label htmlFor='location'>
                        Location:
                    </label>
                    <input
                        type='text'
                        name='location'
                        id='location-input'
                        value={location}
                        required
                        onChange={(e) => {setLocation(e.target.value)}}
                    />
                    {error && <p className="text-red-500">{error}</p>}
                    <button type='submit'>Punch</button>
                </form>
            </div>
            <div>
                <p>Punch history:</p>
                <PunchesList />
            </div>
            <SignOutButton />
        </div>
    )
}