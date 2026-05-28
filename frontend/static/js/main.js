import { apiSendMessage, apiClearWorkspace } from './api.js';
import { appendMessage, appendThinking, appendToolBadge, clearMessages } from './messages.js';
import { initTheme } from './theme.js';
import { initSidebar, loadChats } from './sidebar.js';

const inputEl = document.getElementById('input');
const sendBtn = document.getElementById('send-btn');

const clearWorkspaceBtn = document.getElementById('clear-workspace-btn');

async function sendMessage() {
    const content = inputEl.value.trim();
    if (!content) return;

    inputEl.value = '';
    inputEl.style.height = 'auto';
    sendBtn.disabled = true;
    inputEl.disabled = true;

    appendMessage('user', content);
    const thinking = appendThinking();

    try {
        const data = await apiSendMessage(content);
        thinking.remove();
        appendToolBadge(data.tool_calls || []);
        appendMessage('ai', data.content || '(no response)');
        await loadChats();
    } catch (err) {
        thinking.remove();
        appendMessage('ai', 'Error: ' + err.message);
    } finally {
        sendBtn.disabled = false;
        inputEl.disabled = false;
        inputEl.focus();
    }
}

sendBtn.addEventListener('click', sendMessage);

inputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

inputEl.addEventListener('input', () => {
    inputEl.style.height = 'auto';
    inputEl.style.height = Math.min(inputEl.scrollHeight, 120) + 'px';
});

clearWorkspaceBtn.addEventListener('click', async () => {
    if (!confirm('Clear all files in workspace/?')) return;
    await apiClearWorkspace();
});

initTheme();
initSidebar();
loadChats();
