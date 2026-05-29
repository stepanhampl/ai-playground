export async function apiSendMessage(content) {
    const res = await fetch('/api/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
    });
    if (!res.ok) {
        let detail = `Server error ${res.status}`;
        try {
            const body = await res.json();
            if (body.detail) detail = body.detail;
            else if (body.error) detail = body.error;
        } catch (_) {}
        throw new Error(detail);
    }
    try {
        return await res.json();
    } catch (_) {
        throw new Error('Invalid response from server (not JSON)');
    }
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
