'use client';

import { useEffect, useState } from 'react';

const ThemeController = () => {
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Create a continuous sequence loop
  const toggleTheme = () => {
    if (theme === 'dark') {
      setTheme('light');
    } else if (theme === 'light') {
      setTheme('cyberpunk');
    } else {
      setTheme('dark'); // Cleans the loop by returning to dark
    }
  };

  return (
    <button 
      className="btn btn-sm btn-outline border-base-content/20 hover:bg-base-content/10 text-base-content" 
      onClick={toggleTheme}
    >
      Theme: <span className="capitalize font-bold text-emerald-500">{theme}</span>
    </button>
  );
};

export default ThemeController;