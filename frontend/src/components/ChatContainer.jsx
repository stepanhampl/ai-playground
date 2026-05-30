import { useState, useRef, useEffect } from 'react';
import { apiSendMessage, apiClearWorkspace } from '../api/index.js';
import { useDarkMode } from '../context/DarkModeContext.jsx';

export default function ChatContainer({ currentChatId, messages, onMessagesChange }) {
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showThinking, setShowThinking] = useState(false);
    const [toolCalls, setToolCalls] = useState([]);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const { isDark, toggleDark } = useDarkMode();

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, showThinking]);

    function appendMessage(role, text) {
        onMessagesChange(prev => [...prev, { role, text }]);
    }

    async function sendMessage() {
        const content = inputValue.trim();
        if (!content || isLoading) return;

        setInputValue('');
        setIsLoading(true);
        setShowThinking(true);
        setToolCalls([]);
        inputRef.current.style.height = 'auto';

        appendMessage('user', content);

        try {
            const data = await apiSendMessage(content);
            setShowThinking(false);
            setToolCalls(data.tool_calls || []);
            appendMessage('ai', data.content || '(no response)');
        } catch (err) {
            setShowThinking(false);
            appendMessage('error', err.message);
        } finally {
            setIsLoading(false);
            inputRef.current?.focus();
        }
    }

    function handleKeyDown(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    }

    function handleInput() {
        if (inputRef.current) {
            inputRef.current.style.height = 'auto';
            inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 120) + 'px';
        }
    }

    async function handleClearWorkspace() {
        if (!confirm('Clear all files in workspace/?')) return;
        await apiClearWorkspace();
    }

    return (
        <div id="chat-container">
            <div id="header">
                <button id="clear-workspace-btn" onClick={handleClearWorkspace}>📁 Clear workspace</button>
                <button id="dark-toggle" onClick={toggleDark}>
                    {isDark ? '☀️ Light' : '🌙 Dark'}
                </button>
            </div>

            <div id="messages">
                {messages.map((msg, i) => (
                    <div key={i} className={`message ${msg.role}`}>{msg.text}</div>
                ))}
                {showThinking && (
                    <div className="thinking">Thinking…</div>
                )}
                {toolCalls.length > 0 && (
                    <div className="tool-badge">Used: {toolCalls.join(', ')}</div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div id="input-row">
                <textarea
                    id="input"
                    ref={inputRef}
                    rows="1"
                    placeholder="Type a message…"
                    value={inputValue}
                    onChange={(e) => { setInputValue(e.target.value); handleInput(); }}
                    onKeyDown={handleKeyDown}
                    disabled={isLoading}
                />
                <button
                    id="send-btn"
                    onClick={sendMessage}
                    disabled={isLoading}
                >
                    &#9658;
                </button>
            </div>
        </div>
    );
}