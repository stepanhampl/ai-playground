import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface DarkModeContextValue {
    isDark: boolean;
    toggleDark: () => void;
}

const DarkModeContext = createContext<DarkModeContextValue | null>(null);

interface DarkModeProviderProps {
    children: ReactNode;
}

export function DarkModeProvider({ children }: DarkModeProviderProps) {
    const [isDark, setIsDark] = useState<boolean>(() => {
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
        localStorage.setItem('darkMode', String(next));
    }

    return (
        <DarkModeContext.Provider value={{ isDark, toggleDark }}>
            {children}
        </DarkModeContext.Provider>
    );
}

export function useDarkMode(): DarkModeContextValue {
    const ctx = useContext(DarkModeContext);
    if (!ctx) throw new Error('useDarkMode must be used within DarkModeProvider');
    return ctx;
}