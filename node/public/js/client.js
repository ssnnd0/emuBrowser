// WebSocket connection
const ws = new WebSocket(`ws://${window.location.host}`);
let sessionId = null;

// WebSocket event handlers
ws.onopen = () => {
    console.log('Connected to server');
};

ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    handleServerMessage(data);
};

ws.onclose = () => {
    console.log('Disconnected from server');
};

// Server message handler
function handleServerMessage(data) {
    switch (data.type) {
        case 'SESSION_CREATED':
            sessionId = data.sessionId;
            break;

        case 'TAB_UPDATED':
            updateTabUI(data.tab);
            break;

        case 'BOOKMARK_UPDATED':
            updateBookmarksBar();
            break;

        case 'HISTORY_UPDATED':
            updateHistory();
            break;
    }
}

// Tab management
function createTab(url = 'about:blank') {
    const tabId = Math.random().toString(36).substr(2, 9);
    ws.send(JSON.stringify({
        type: 'CREATE_TAB',
        tabId,
        url
    }));
    return tabId;
}

function closeTab(tabId) {
    ws.send(JSON.stringify({
        type: 'CLOSE_TAB',
        tabId
    }));
}

function updateTab(tabId, data) {
    ws.send(JSON.stringify({
        type: 'UPDATE_TAB',
        tabId,
        ...data
    }));
}

// API calls
async function translatePage(text, targetLang) {
    try {
        const response = await fetch('/api/translate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ text, targetLang })
        });
        return await response.json();
    } catch (error) {
        console.error('Translation failed:', error);
        return null;
    }
}

async function addBookmark(url, title) {
    try {
        const response = await fetch('/api/bookmark', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ url, title })
        });
        return await response.json();
    } catch (error) {
        console.error('Failed to add bookmark:', error);
        return null;
    }
}

async function getHistory() {
    try {
        const response = await fetch('/api/history');
        return await response.json();
    } catch (error) {
        console.error('Failed to get history:', error);
        return null;
    }
}

async function downloadFile(url) {
    try {
        const response = await fetch('/api/download', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ url })
        });
        return await response.json();
    } catch (error) {
        console.error('Failed to start download:', error);
        return null;
    }
}

// UI update functions
function updateTabUI(tab) {
    const tabElement = document.querySelector(`[data-tab-id="${tab.id}"]`);
    if (tabElement) {
        tabElement.querySelector('.tab-title').textContent = tab.title;
        tabElement.querySelector('.tab-favicon').src = tab.favicon;
    }
}

function updateBookmarksBar() {
    getBookmarks().then(bookmarks => {
        const bar = document.getElementById('bookmarks-bar');
        bar.innerHTML = bookmarks.map(bookmark => `
            <div class="bookmark" onclick="navigateTo('${bookmark.url}')">
                <img src="https://www.google.com/s2/favicons?domain=${bookmark.url}" alt="">
                <span>${bookmark.title}</span>
            </div>
        `).join('');
    });
}

function updateHistory() {
    getHistory().then(({ history }) => {
        const panel = document.getElementById('history-panel');
        if (panel) {
            panel.innerHTML = history.map(item => `
                <div class="history-item" onclick="navigateTo('${item.url}')">
                    <img src="https://www.google.com/s2/favicons?domain=${item.url}" alt="">
                    <span>${item.title}</span>
                    <span class="history-date">${new Date(item.timestamp).toLocaleString()}</span>
                </div>
            `).join('');
        }
    });
}

// Navigation
function navigateTo(url) {
    if (activeTabId) {
        updateTab(activeTabId, { url });
        document.getElementById('browser-frame').src = url;
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Initialize UI
    createTab();
    updateBookmarksBar();
    
    // Form submission
    document.getElementById('uv-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const url = document.getElementById('url-bar').value;
        navigateTo(isUrl(url) ? url : `https://www.google.com/search?q=${encodeURIComponent(url)}`);
    });

    // Button click handlers
    document.getElementById('back-button').addEventListener('click', () => {
        window.history.back();
    });

    document.getElementById('forward-button').addEventListener('click', () => {
        window.history.forward();
    });

    document.getElementById('refresh-button').addEventListener('click', () => {
        document.getElementById('browser-frame').contentWindow.location.reload();
    });

    document.getElementById('bookmark-button').addEventListener('click', () => {
        const frame = document.getElementById('browser-frame');
        addBookmark(frame.contentWindow.location.href, frame.contentDocument.title);
    });
});

// Helper functions
function isUrl(val = '') {
    if (/^http(s?):\/\//.test(val) || val.includes('.') && val.substr(0, 1) !== ' ') return true;
    return false;
} 
