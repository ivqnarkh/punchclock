import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Punch Clock</h1>
      <Link to="/login">
        <button style={{ padding: '0.5rem 1rem' }}>Login</button>
      </Link>
    </div>
  );
}