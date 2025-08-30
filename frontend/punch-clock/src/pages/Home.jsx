import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { user, loading} = useAuth()

  if (loading) return null

  if (user?.role === 'ADMIN') {
    return <Navigate to="/admin" replace />
  }

  if (user?.role === 'USER') {
    return <Navigate to='/employee' replace />
  }


  return (
    <div style={{ padding: '2rem' }}>
      <h1>Punch Clock</h1>
      <Link to="/login">
        <button style={{ padding: '0.5rem 1rem' }}>Login</button>
      </Link>
    </div>
  );
}