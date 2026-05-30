import { createContext, useContext, useState, useEffect } from 'react';

const DarkModeContext = createContext();

export function DarkModeProvider({ children }) {
    const [isDark, setIsDark] = useState(() => {
        const stored = localStorage.getItem('darkMode');
        return stored === 'true' ||
            (stored === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
    });

    useEffect(() => {
        document.body.classList.toggle('dark', isDark);
    }, [isDark]);

    function toggleDark() {
        const next = !isDark;
        setIsDark(next);
        localStorage.setItem('darkMode', next);
    }

    return (
        <DarkModeContext.Provider value={{ isDark, toggleDark }}>
            {children}
        </DarkModeContext.Provider>
    );
}

export function useDarkMode() {
    return useContext(DarkModeContext);
}