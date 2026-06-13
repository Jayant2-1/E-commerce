import { useTheme } from '../context/ThemeContext';
export default function ThemeToggle() {
  const { darkMode, toggleDarkMode } = useTheme() || {};
  return (
    <button onClick={toggleDarkMode} style={{ background: 'none', border: 'none', color: '#6b6b6b', cursor: 'pointer', fontSize: '0.8rem' }}>
      {darkMode ? '☀' : '☾'}
    </button>
  );
}
