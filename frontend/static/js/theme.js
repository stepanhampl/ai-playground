function applyDark(dark, darkToggle) {
    document.body.classList.toggle('dark', dark);
    darkToggle.textContent = dark ? '☀️ Light' : '🌙 Dark';
}

export function initTheme() {
    const darkToggle = document.getElementById('dark-toggle');
    if (!darkToggle) return;

    const stored = localStorage.getItem('darkMode');
    const prefersDark = stored === 'true' ||
        (stored === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
    applyDark(prefersDark, darkToggle);

    darkToggle.addEventListener('click', () => {
        const isDark = !document.body.classList.contains('dark');
        localStorage.setItem('darkMode', isDark);
        applyDark(isDark, darkToggle);
    });
}
