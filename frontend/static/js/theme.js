const darkToggle = document.getElementById('dark-toggle');

function applyDark(dark) {
    document.body.classList.toggle('dark', dark);
    darkToggle.textContent = dark ? '☀️ Light' : '🌙 Dark';
}

export function initTheme() {
    const stored = localStorage.getItem('darkMode');
    const prefersDark = stored === 'true' ||
        (stored === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
    applyDark(prefersDark);

    darkToggle.addEventListener('click', () => {
        const isDark = !document.body.classList.contains('dark');
        localStorage.setItem('darkMode', isDark);
        applyDark(isDark);
    });
}
