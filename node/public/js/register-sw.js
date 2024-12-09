// Register UV Service Worker
const registerUVSW = async () => {
    if ('serviceWorker' in navigator) {
        try {
            await navigator.serviceWorker.register('/uv/uv.sw.js', {
                scope: __uv$config.prefix
            });
        } catch (err) {
            console.error('Failed to register UV service worker:', err);
        }
    }
};

// Register Browser Emulator Service Worker
const registerAppSW = async () => {
    if ('serviceWorker' in navigator) {
        try {
            await navigator.serviceWorker.register('/js/service-worker.js');
        } catch (err) {
            console.error('Failed to register app service worker:', err);
        }
    }
};

// Initialize Service Workers
const initializeSW = async () => {
    try {
        await registerUVSW();
        await registerAppSW();
    } catch (err) {
        console.error('Failed to initialize service workers:', err);
    }
};

// Handle form submission
const form = document.getElementById('uv-form');
const input = document.getElementById('url-bar');

if (form) {
    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        
        try {
            const url = input.value.trim();
            if (!isUrl(url)) {
                const query = encodeURIComponent(url);
                window.location.href = __uv$config.prefix + __uv$config.encodeUrl(
                    `https://www.google.com/search?q=${query}`
                );
            } else {
                window.location.href = __uv$config.prefix + __uv$config.encodeUrl(url);
            }
        } catch (err) {
            console.error('Failed to process URL:', err);
            alert('Failed to process the URL. Please try again.');
        }
    });
}

// Helper function to check if string is URL
function isUrl(val = '') {
    if (/^http(s?):\/\//.test(val) || val.includes('.') && val.substr(0, 1) !== ' ') return true;
    return false;
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeSW); 