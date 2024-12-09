require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');
const bareServer = require('./bare/bare.js');
const { uvPath } = require('@titaniumnetwork-dev/ultraviolet');

// Initialize express app
const app = express();
const server = http.createServer();
const io = socketIo(server);

// Middleware
app.use(cors());
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'", "*"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "*"],
            styleSrc: ["'self'", "'unsafe-inline'", "*"],
            imgSrc: ["'self'", "data:", "https:", "*"],
            connectSrc: ["'self'", "https:", "http:", "ws:", "wss:", "*"],
            frameSrc: ["'self'", "*"],
            objectSrc: ["'none'"],
            upgradeInsecureRequests: []
        }
    }
}));
app.use(compression());
app.use(bodyParser.json());

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uv/', express.static(uvPath));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Session storage
const sessions = new Map();

// WebSocket server for real-time communication
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
    const sessionId = uuidv4();
    sessions.set(sessionId, { ws, tabs: new Map() });

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            handleWebSocketMessage(sessionId, data);
        } catch (error) {
            console.error('WebSocket message error:', error);
        }
    });

    ws.on('close', () => {
        sessions.delete(sessionId);
    });
});

// Handle HTTP requests
server.on('request', (req, res) => {
    if (bareServer.shouldRoute(req)) {
        bareServer.routeRequest(req, res);
    } else {
        app(req, res);
    }
});

// Handle WebSocket connections
server.on('upgrade', (req, socket, head) => {
    if (bareServer.shouldRoute(req)) {
        bareServer.routeUpgrade(req, socket, head);
    } else if (req.url.startsWith('/socket.io/')) {
        io.engine.handleUpgrade(req, socket, head);
    } else {
        socket.end();
    }
});

// WebSocket message handler
function handleWebSocketMessage(sessionId, data) {
    const session = sessions.get(sessionId);
    if (!session) return;

    switch (data.type) {
        case 'CREATE_TAB':
            session.tabs.set(data.tabId, {
                url: data.url || 'about:blank',
                title: 'New Tab',
                favicon: 'default-favicon.ico'
            });
            break;

        case 'CLOSE_TAB':
            session.tabs.delete(data.tabId);
            break;

        case 'UPDATE_TAB':
            const tab = session.tabs.get(data.tabId);
            if (tab) {
                Object.assign(tab, {
                    url: data.url || tab.url,
                    title: data.title || tab.title,
                    favicon: data.favicon || tab.favicon
                });
            }
            break;
    }
}

// API Routes
app.post('/api/translate', async (req, res) => {
    try {
        const { text, targetLang } = req.body;
        // Implement translation logic here
        res.json({ translatedText: text }); // Placeholder
    } catch (error) {
        res.status(500).json({ error: 'Translation failed' });
    }
});

app.post('/api/bookmark', (req, res) => {
    // Implement bookmark logic
    res.json({ success: true });
});

app.get('/api/history', (req, res) => {
    // Implement history retrieval logic
    res.json({ history: [] });
});

app.post('/api/download', (req, res) => {
    // Implement download logic
    res.json({ downloadId: uuidv4() });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something broke!' });
});

// Serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 