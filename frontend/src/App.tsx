import { useState, useRef } from 'react';
import Sidebar, { type SidebarHandle } from './components/Sidebar.jsx';
import ChatContainer from './components/ChatContainer.jsx';
import { apiReset } from './api/index.js';
import type { Message } from './types.js';

export default function App() {
    const [currentChatId, setCurrentChatId] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const sidebarRef = useRef<SidebarHandle>(null);

    function handleSelectChat(
        id: string,
        restoredMessages: Array<{ role: 'user' | 'ai'; content: string }>
    ) {
        setCurrentChatId(id || null);
        setMessages(restoredMessages.map(m => ({
            role: m.role === 'user' ? 'user' : 'ai',
            text: m.content ?? '',
        })));
        document.getElementById('input')?.focus();
    }

    async function handleNewChat() {
        await apiReset();
        setCurrentChatId(null);
        setMessages([]);
        sidebarRef.current?.reloadChats();
        document.getElementById('input')?.focus();
    }

    return (
        <div id="app">
            <Sidebar
                ref={sidebarRef}
                currentChatId={currentChatId}
                onSelectChat={handleSelectChat}
                onNewChat={handleNewChat}
            />
            <ChatContainer
                currentChatId={currentChatId}
                messages={messages}
                onMessagesChange={setMessages}
            />
        </div>
    );
}