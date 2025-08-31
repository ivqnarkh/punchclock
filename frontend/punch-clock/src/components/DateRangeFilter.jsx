import React from 'react'

export default function DateRangeFilter({ startDate, endDate, onStartChange, onEndChange }) {
    return (
        <div className="date-range-filter">
        <label>
            Start Date:
            <input type="date" value={startDate} onChange={e => onStartChange(e.target.value)} />
        </label>
        <label>
            End Date:
            <input type="date" value={endDate} onChange={e => onEndChange(e.target.value)} />
        </label>
        </div>
    )
}