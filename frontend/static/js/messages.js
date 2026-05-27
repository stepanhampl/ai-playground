const messagesEl = document.getElementById('messages');

export function appendMessage(role, text) {
    const el = document.createElement('div');
    el.className = `message ${role}`;
    el.textContent = text;
    messagesEl.appendChild(el);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return el;
}

export function appendThinking() {
    const el = document.createElement('div');
    el.className = 'thinking';
    el.textContent = 'Thinking…';
    messagesEl.appendChild(el);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return el;
}

export function appendToolBadge(tools) {
    if (!tools.length) return;
    const el = document.createElement('div');
    el.className = 'tool-badge';
    el.textContent = 'Used: ' + tools.join(', ');
    messagesEl.appendChild(el);
}

export function clearMessages() {
    messagesEl.innerHTML = '';
}
