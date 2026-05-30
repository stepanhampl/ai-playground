import { useState, useRef, useEffect, ChangeEvent, KeyboardEvent } from 'react';
import { apiSendMessage, apiClearWorkspace } from '../api/index.js';
import { useDarkMode } from '../context/DarkModeContext.jsx';
import type { Message } from '../types.js';

interface ChatContainerProps {
    currentChatId: string | null;
    messages: Message[];
    onMessagesChange: React.Dispatch<React.SetStateAction<Message[]>>;
}

export default function ChatContainer({
    currentChatId,
    messages,
    onMessagesChange,
}: ChatContainerProps) {
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showThinking, setShowThinking] = useState(false);
    const [toolCalls, setToolCalls] = useState<string[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const { isDark, toggleDark } = useDarkMode();

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, showThinking]);

    function appendMessage(role: Message['role'], text: string) {
        onMessagesChange(prev => [...prev, { role, text }]);
    }

    async function sendMessage() {
        const content = inputValue.trim();
        if (!content || isLoading) return;

        setInputValue('');
        setIsLoading(true);
        setShowThinking(true);
        setToolCalls([]);
        if (inputRef.current) inputRef.current.style.height = 'auto';

        appendMessage('user', content);

        try {
            const data = await apiSendMessage(content);
            setShowThinking(false);
            setToolCalls(data.tool_calls ?? []);
            appendMessage('ai', data.content ?? '(no response)');
        } catch (err: unknown) {
            setShowThinking(false);
            const message = err instanceof Error ? err.message : String(err);
            appendMessage('error', message);
        } finally {
            setIsLoading(false);
            inputRef.current?.focus();
        }
    }

    function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    }

    function handleInput(e: ChangeEvent<HTMLTextAreaElement>) {
        setInputValue(e.target.value);
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
                    rows={1}
                    placeholder="Type a message…"
                    value={inputValue}
                    onChange={handleInput}
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