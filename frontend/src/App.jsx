import { useState, useRef } from 'react';
import Sidebar from './components/Sidebar.jsx';
import ChatContainer from './components/ChatContainer.jsx';
import { apiReset } from './api/index.js';

export default function App() {
    const [currentChatId, setCurrentChatId] = useState(null);
    const [messages, setMessages] = useState([]);
    const sidebarRef = useRef(null);

    async function handleSelectChat(id, restoredMessages) {
        setCurrentChatId(id);
        setMessages(restoredMessages.map(m => ({ role: m.role === 'user' ? 'user' : 'ai', text: m.content || '' })));
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