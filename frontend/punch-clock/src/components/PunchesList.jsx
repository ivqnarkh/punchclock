import { useEffect, useState, useCallback} from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'

export default function PunchesList({ refreshTrigger }) {
  const [punches, setPunches] = useState([])
  const [cursor, setCursor] = useState(null)
  const [hasMore, setHasMore] = useState(true)

  const loadMore = useCallback(async () => {
    if (!hasMore) return;

    const url = cursor
      ? `/api/punches?cursor=${encodeURIComponent(cursor)}&limit=10`
      : `/api/punches?limit=10`

    const res = await fetch(url, { credentials: 'include' })
    if (!res.ok) throw new Error('Failed to load punches')
    const json = await res.json()

    setPunches(prev => {
      const seen = new Set(prev.map(p => p.id))
      const combined = [...prev]
      for (const p of json.data) if (!seen.has(p.id)) combined.push(p)
      return combined
    });

    setCursor(json.nextCursor)
    setHasMore(Boolean(json.nextCursor))
  }, [cursor, hasMore])

  useEffect(() => {
    setPunches([])
    setCursor(null)
    setHasMore(true)
  }, [refreshTrigger])

  useEffect(() => {
    loadMore()
  }, [loadMore])

  return (
    <div
      id="punchesScroll"
      style={{
        maxHeight: 320,
        maxWidth: 500,
        overflow: 'auto',
        border: '2px solid #000000ff'
      }}
    >
      <InfiniteScroll
        dataLength={punches.length}
        next={loadMore}
        hasMore={hasMore}
        loader={<div style={{ padding: 12 }}>Loading…</div>}
        endMessage={<div style={{ padding: 12, color: '#000000ff' }}>No more punches</div>}
        scrollableTarget="punchesScroll" 
      >
        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {punches.map(p => (
            <li key={p.id} style={{ padding: '10px 12px', borderBottom: '1px solid #000000ff' }}>
              <div>{p.type}</div>
              <div>{p.location}</div>
              <div>
                {new Date(p.punchedAt).toLocaleString()}
              </div>
            </li>
          ))}
        </ul>
      </InfiniteScroll>
    </div>
  )
}