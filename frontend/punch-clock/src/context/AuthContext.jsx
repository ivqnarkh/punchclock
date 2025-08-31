import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export default function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    //check auth status from api and update user accordingly
    async function checkAuth() {
        setLoading(true)
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/me`, {
                credentials: 'include'
            })
            const data = await response.json()
            setUser(data.data)
            return data.data
        } catch (error) {
            console.error('Failed to check auth status', error)
            setUser(null)
        } finally {
            setLoading(false)
        }
    }

    //send login request to api and update user
    async function signIn(username, password) {
        setLoading(true)
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/login`, {
                method: "POST",
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            })
            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || "Failed to sign in")
            }
            const user = await checkAuth()
            return user
        } finally {
            setLoading(false)
        }
    }

    //send logout post to api and update user
    async function signOut() {
        await fetch(`${import.meta.env.VITE_API_URL}/api/logout`, {
            method: "POST",
            credentials: 'include'
        })
        setUser(null)
    }

    useEffect(() => { checkAuth() }, [])

    return (
        <AuthContext.Provider value={{ 
            user,
            loading, 
            signIn, 
            signOut, 
            checkAuth}}>
                { children }
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider')
    }
    return context
}