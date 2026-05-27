export async function apiSendMessage(content) {
    const res = await fetch('/api/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
    });
    return res.json();
}

export async function apiListChats() {
    const res = await fetch('/api/chats');
    return res.json();
}

export async function apiRestoreChat(id) {
    const res = await fetch(`/api/chats/${id}/restore`, { method: 'POST' });
    if (!res.ok) return null;
    return res.json();
}

export async function apiDeleteChat(id) {
    await fetch(`/api/chats/${id}`, { method: 'DELETE' });
}

export async function apiReset() {
    await fetch('/api/reset', { method: 'POST' });
}

export async function apiClearWorkspace() {
    await fetch('/api/clear-workspace', { method: 'POST' });
}
