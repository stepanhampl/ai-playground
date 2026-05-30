import { useState, useEffect, useImperativeHandle, forwardRef, ForwardedRef } from 'react';
import { apiListChats, apiRestoreChat, apiDeleteChat } from '../api/index.js';
import type { Chat } from '../types.js';

function relativeTime(isoStr: string): string {
    const date = new Date(isoStr);
    const diffMs = Date.now() - date.getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
}

function escapeHtml(str: string): string {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

interface SidebarProps {
    currentChatId: string | null;
    onSelectChat: (id: string, messages: Array<{ role: 'user' | 'ai'; content: string }>) => void;
    onNewChat: () => void;
}

export interface SidebarHandle {
    reloadChats: () => Promise<void>;
}

const Sidebar = forwardRef<SidebarHandle, SidebarProps>(function Sidebar(
    { currentChatId, onSelectChat, onNewChat },
    ref: ForwardedRef<SidebarHandle>
) {
    const [chats, setChats] = useState<Chat[]>([]);

    async function loadChats() {
        const data = await apiListChats();
        setChats(data.chats ?? []);
    }

    useEffect(() => {
        loadChats();
    }, []);

    useImperativeHandle(ref, () => ({ reloadChats: loadChats }), []);

    async function handleRestore(id: string) {
        const data = await apiRestoreChat(id);
        if (!data) return;
        onSelectChat(
            id,
            (data.messages ?? []).map(m => ({
                role: (m.role === 'user' ? 'user' : 'ai') as 'user' | 'ai',
                content: m.content ?? '',
            }))
        );
    }

    async function handleDelete(e: React.MouseEvent, id: string) {
        e.stopPropagation();
        if (!confirm('Delete this chat?')) return;
        await apiDeleteChat(id);
        if (currentChatId === id) {
            onSelectChat('', []);
        }
        loadChats();
    }

    return (
        <div id="sidebar">
            <div id="sidebar-header">
                <button id="new-chat-btn" onClick={onNewChat}>+ New Chat</button>
            </div>
            <div id="chat-list">
                {chats.map((chat) => (
                    <div
                        key={chat.id}
                        className={`chat-item${chat.id === currentChatId ? ' active' : ''}`}
                        onClick={() => handleRestore(chat.id)}
                    >
                        <div className="chat-item-text">
                            <div
                                className="chat-item-title"
                                dangerouslySetInnerHTML={{ __html: escapeHtml(chat.title) }}
                            />
                            <div className="chat-item-date">{relativeTime(chat.updated_at)}</div>
                        </div>
                        <button
                            className="chat-delete-btn"
                            title="Delete"
                            onClick={(e) => handleDelete(e, chat.id)}
                        >
                            ✕
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
});

export default Sidebar;