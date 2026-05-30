export interface SendMessageResponse {
    content?: string;
    tool_calls?: string[];
}

export interface ChatListResponse {
    chats: Array<{
        id: string;
        title: string;
        updated_at: string;
    }>;
}

export interface RestoreChatResponse {
    messages: Array<{
        role: 'user' | 'assistant';
        content?: string;
    }>;
}

export async function apiSendMessage(content: string): Promise<SendMessageResponse> {
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
        } catch (_) { /* ignore */ }
        throw new Error(detail);
    }
    try {
        return await res.json() as SendMessageResponse;
    } catch (_) {
        throw new Error('Invalid response from server (not JSON)');
    }
}

export async function apiListChats(): Promise<ChatListResponse> {
    const res = await fetch('/api/chats');
    return res.json() as Promise<ChatListResponse>;
}

export async function apiRestoreChat(id: string): Promise<RestoreChatResponse | null> {
    const res = await fetch(`/api/chats/${id}/restore`, { method: 'POST' });
    if (!res.ok) return null;
    return res.json() as Promise<RestoreChatResponse>;
}

export async function apiDeleteChat(id: string): Promise<void> {
    await fetch(`/api/chats/${id}`, { method: 'DELETE' });
}

export async function apiReset(): Promise<void> {
    await fetch('/api/reset', { method: 'POST' });
}

export async function apiClearWorkspace(): Promise<void> {
    await fetch('/api/clear-workspace', { method: 'POST' });
}