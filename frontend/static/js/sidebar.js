import { apiListChats, apiRestoreChat, apiDeleteChat, apiReset } from './api.js';
import { appendMessage, clearMessages } from './messages.js';

const chatListEl = document.getElementById('chat-list');
const newChatBtn = document.getElementById('new-chat-btn');

let currentChatId = null;

export function getCurrentChatId() {
    return currentChatId;
}

export function resetCurrentChat() {
    currentChatId = null;
}

function relativeTime(isoStr) {
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

function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export async function loadChats() {
    const data = await apiListChats();
    renderChatList(data.chats);
}

function renderChatList(chats) {
    chatListEl.innerHTML = '';
    for (const chat of chats) {
        const item = document.createElement('div');
        item.className = 'chat-item' + (chat.id === currentChatId ? ' active' : '');
        item.innerHTML = `
          <div class="chat-item-text">
            <div class="chat-item-title">${escapeHtml(chat.title)}</div>
            <div class="chat-item-date">${relativeTime(chat.updated_at)}</div>
          </div>
          <button class="chat-delete-btn" title="Delete">✕</button>
        `;
        item.addEventListener('click', () => restoreChat(chat.id));
        item.querySelector('.chat-delete-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            deleteChat(chat.id);
        });
        chatListEl.appendChild(item);
    }
}

async function restoreChat(id) {
    const data = await apiRestoreChat(id);
    if (!data) return;
    currentChatId = id;
    clearMessages();
    for (const msg of data.messages) {
        appendMessage(msg.role === 'user' ? 'user' : 'ai', msg.content || '');
    }
    loadChats();
    document.getElementById('input').focus();
}

async function deleteChat(id) {
    if (!confirm('Delete this chat?')) return;
    await apiDeleteChat(id);
    if (currentChatId === id) {
        currentChatId = null;
        clearMessages();
    }
    loadChats();
}

export function initSidebar() {
    newChatBtn.addEventListener('click', async () => {
        await apiReset();
        currentChatId = null;
        clearMessages();
        loadChats();
        document.getElementById('input').focus();
    });
}
