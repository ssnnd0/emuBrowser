// UI State
let isDarkMode = false;
let isReaderMode = false;
let activePanel = null;

// UI Elements
const frame = document.getElementById('browser-frame');
const urlBar = document.getElementById('url-bar');
const tabBar = document.getElementById('tab-bar');
const panels = document.querySelectorAll('.panel');

// Tab UI
function renderTabs() {
    const tabsHTML = Object.entries(tabs).map(([id, tab]) => `
        <div class="tab ${id === activeTabId ? 'active' : ''}" data-tab-id="${id}">
            <img class="tab-favicon" src="${tab.favicon}" alt="">
            <span class="tab-title">${tab.title}</span>
            <button class="tab-close" onclick="closeTab('${id}')">&times;</button>
        </div>
    `).join('');
    
    tabBar.innerHTML = tabsHTML + `
        <button class="new-tab" onclick="createTab()">+</button>
    `;
}

// Panel UI
function togglePanel(panelId) {
    panels.forEach(panel => {
        if (panel.id === panelId) {
            panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
            activePanel = panel.style.display === 'none' ? null : panelId;
        } else {
            panel.style.display = 'none';
        }
    });
}

// Settings UI
function toggleDarkMode() {
    isDarkMode = !isDarkMode;
    document.body.classList.toggle('dark-theme', isDarkMode);
    localStorage.setItem('darkMode', isDarkMode);
}

function toggleReaderMode() {
    isReaderMode = !isReaderMode;
    if (isReaderMode) {
        const content = frame.contentDocument.body.innerHTML;
        frame.srcdoc = generateReaderHTML(content);
    } else {
        frame.src = frame.src;
    }
}

function generateReaderHTML(content) {
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 20px;
                    font-family: system-ui, -apple-system, sans-serif;
                    line-height: 1.6;
                    color: ${isDarkMode ? '#e8eaed' : '#202124'};
                    background: ${isDarkMode ? '#202124' : '#ffffff'};
                }
                img {
                    max-width: 100%;
                    height: auto;
                }
                pre, code {
                    background: ${isDarkMode ? '#2d2d2d' : '#f5f5f5'};
                    padding: 0.2em 0.4em;
                    border-radius: 3px;
                }
            </style>
        </head>
        <body>${content}</body>
        </html>
    `;
}

// URL Bar UI
urlBar.addEventListener('focus', () => {
    urlBar.select();
});

urlBar.addEventListener('blur', () => {
    const url = frame.contentWindow.location.href;
    if (url !== 'about:blank') {
        urlBar.value = url;
    }
});

// Frame event handlers
frame.addEventListener('load', () => {
    const doc = frame.contentDocument;
    if (doc) {
        // Update URL bar
        urlBar.value = frame.contentWindow.location.href;
        
        // Update tab info
        if (activeTabId) {
            const tab = tabs[activeTabId];
            tab.title = doc.title;
            tab.favicon = doc.querySelector('link[rel="icon"]')?.href || 'default-favicon.ico';
            renderTabs();
        }
        
        // Update navigation buttons
        document.getElementById('back-button').disabled = !frame.contentWindow.history.length;
        document.getElementById('forward-button').disabled = !frame.contentWindow.history.length;
        
        // Update security indicator
        const isSecure = frame.contentWindow.location.protocol === 'https:';
        document.getElementById('site-security').textContent = isSecure ? '🔒' : '';
        
        // Add to history
        if (!frame.contentWindow.location.href.startsWith('about:')) {
            addToHistory(frame.contentWindow.location.href, doc.title);
        }
    }
});

// Context menu
document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    const menu = document.getElementById('context-menu');
    menu.style.display = 'block';
    menu.style.left = `${e.pageX}px`;
    menu.style.top = `${e.pageY}px`;
});

document.addEventListener('click', () => {
    document.getElementById('context-menu').style.display = 'none';
});

// Voice search
const voiceButton = document.getElementById('voice-search');
if ('webkitSpeechRecognition' in window) {
    const recognition = new webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
        const text = event.results[0][0].transcript;
        urlBar.value = text;
        document.getElementById('uv-form').dispatchEvent(new Event('submit'));
    };

    voiceButton.addEventListener('click', () => {
        recognition.start();
    });
} else {
    voiceButton.style.display = 'none';
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey) {
        switch(e.key.toLowerCase()) {
            case 't':
                e.preventDefault();
                createTab();
                break;
            case 'w':
                e.preventDefault();
                if (activeTabId) closeTab(activeTabId);
                break;
            case 'l':
                e.preventDefault();
                urlBar.select();
                break;
            case 'd':
                e.preventDefault();
                document.getElementById('bookmark-button').click();
                break;
            case 'j':
                e.preventDefault();
                togglePanel('downloads-panel');
                break;
            case 'h':
                e.preventDefault();
                togglePanel('history-panel');
                break;
            case 'b':
                e.preventDefault();
                document.getElementById('bookmarks-bar').style.display = 
                    document.getElementById('bookmarks-bar').style.display === 'none' ? 'flex' : 'none';
                break;
        }
    }
});

// Initialize UI
document.addEventListener('DOMContentLoaded', () => {
    // Load dark mode preference
    isDarkMode = localStorage.getItem('darkMode') === 'true';
    if (isDarkMode) {
        document.body.classList.add('dark-theme');
    }
    
    // Initialize panels
    document.querySelectorAll('.panel').forEach(panel => {
        panel.style.display = 'none';
    });
    
    // Initialize button handlers
    document.getElementById('settings-button').addEventListener('click', () => {
        togglePanel('settings-panel');
    });
    
    document.getElementById('downloads-button').addEventListener('click', () => {
        togglePanel('downloads-panel');
    });
    
    document.getElementById('password-manager').addEventListener('click', () => {
        togglePanel('password-panel');
    });
    
    document.getElementById('reader-mode').addEventListener('click', () => {
        toggleReaderMode();
    });
    
    // Create initial tab
    createTab();
}); 