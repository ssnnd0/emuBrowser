const { createBareServer } = require('@tomphttp/bare-server-node');
const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const bareServer = createBareServer('/bare/');

// SSL configuration (optional)
const ssl = {
    key: fs.readFileSync(path.join(__dirname, 'ssl', 'key.pem')),
    cert: fs.readFileSync(path.join(__dirname, 'ssl', 'cert.pem'))
};

const httpServer = http.createServer();
const httpsServer = https.createServer(ssl);

httpServer.on('request', (req, res) => {
    if (bareServer.shouldRoute(req)) {
        bareServer.routeRequest(req, res);
    } else {
        res.writeHead(400);
        res.end('Not a bare request');
    }
});

httpServer.on('upgrade', (req, socket, head) => {
    if (bareServer.shouldRoute(req)) {
        bareServer.routeUpgrade(req, socket, head);
    } else {
        socket.end();
    }
});

module.exports = bareServer; 