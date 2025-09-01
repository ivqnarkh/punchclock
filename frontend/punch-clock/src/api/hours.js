import { apiBase } from "./apiBase"

export async function fetchHoursWorked({ userId, startDate, endDate } = {}) {
    let url = `${apiBase}/api/hoursWorked`
    const params = new URLSearchParams()

    if (userId) params.append('userId', userId)
    if (startDate) params.append('startDate', startDate)
    if (endDate) params.append('endDate', endDate)

    if ([...params].length > 0) {
        url += `?${params.toString()}`
    }

    const res = await fetch(url, { credentials: 'include' })
    if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || `Failed to fetch hours worked (status: ${res.status})`)
    }

    const data = await res.json()
    if (typeof data.hoursWorked !== 'number') {
        throw new Error('Unexpected API response format')
    }

    return data.hoursWorked
}