import { useEffect, useState } from 'react';
import { FiSun, FiMoon } from 'react-icons/fi';

const ThemeToggle = () => {
  const [darkMode, setDarkMode] = useState(true);

  // On mount, check the theme from localStorage or system preference
  useEffect(() => {
    const theme = localStorage.getItem('theme');
    // Default to dark if no preference is saved
    if (theme === 'light') {
      setDarkMode(false);
      document.documentElement.classList.remove('dark');
    } else {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    if (darkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setDarkMode(true);
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className="group relative flex items-center justify-center w-12 h-12 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg transition-all duration-300 hover:scale-110 active:scale-95"
      aria-label="Toggle Theme"
    >
      {/* Sun Icon (Visible in Light Mode) */}
      <FiSun 
        className={`absolute w-5 h-5 text-amber-500 transition-all duration-500 transform ${
          darkMode ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100'
        }`} 
      />
      
      {/* Moon Icon (Visible in Dark Mode) */}
      <FiMoon 
        className={`absolute w-5 h-5 text-blue-400 transition-all duration-500 transform ${
          darkMode ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0'
        }`} 
      />
      
      {/* Subtle Glow Effect */}
      <div className="absolute inset-0 rounded-xl bg-blue-500/0 group-hover:bg-blue-500/5 transition-colors duration-300"></div>
    </button>
  );
};

export default ThemeToggle;