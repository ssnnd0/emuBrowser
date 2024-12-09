# Browser Emulator

A modern web browser emulator with Chrome-like features, built with Node.js and Ultraviolet proxy backend.

## Features

- 🌐 Full web browsing capabilities with proxy support
- 📑 Tab management
- 🔖 Bookmark system
- 📜 Browsing history
- 🌙 Dark mode
- 📖 Reader mode
- 🔄 Real-time tab synchronization
- 🌍 Translation support
- 🎤 Voice search
- ⌨️ Keyboard shortcuts
- 📱 Responsive design
- 🔒 Secure browsing with SSL
- 💾 Offline support (PWA)
- 🔑 Password manager
- ⬇️ Download manager

## Prerequisites

- Node.js (v16.0.0 or higher)
- npm (comes with Node.js)
- Git

## Installation

### Linux

1. Install Node.js and npm:
```bash
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt-get install -y nodejs
```

2. Install Git:
```bash
sudo apt-get install git
```

3. Clone and setup:
```bash
git clone https://github.com/ssnnd0/emuBrowser
cd emuBrowser
npm install
```

### Windows

1. Download and install Node.js from [nodejs.org](https://nodejs.org/)
2. Download and install Git from [git-scm.com](https://git-scm.com/download/win)
3. Clone and setup:
```bash
git clone https://github.com/ssnnd0/emuBrowser
cd emuBrowser
npm install
```

## Configuration

1. Create a `.env` file in the root directory:
```env
PORT=3000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret [node -e "console.log(require('crypto').randomBytes(32).toString('hex'));"]
GOOGLE_API_KEY=your_google_api_key
STRIPE_KEY=your_stripe_key
TRANSLATE_API_KEY=your_translate_api_key
UV_HOST=0.0.0.0
UV_PORT=8080
```

2. (Optional) Set up SSL certificates for the Bare server:
```bash
mkdir -p bare/ssl
openssl req -x509 -newkey rsa:4096 -keyout bare/ssl/key.pem -out bare/ssl/cert.pem -days 365 -nodes
```

## Usage

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

Access the application at `http://localhost:3000`

## Keyboard Shortcuts

- `Ctrl/Cmd + T` - New tab
- `Ctrl/Cmd + W` - Close tab
- `Ctrl/Cmd + L` - Focus URL bar
- `Ctrl/Cmd + D` - Add bookmark
- `Ctrl/Cmd + H` - View history
- `Ctrl/Cmd + J` - Downloads
- `Ctrl/Cmd + B` - Toggle bookmarks bar

## Project Structure

```
browser-emulator/
├── public/
│   ├── css/
│   │   └── style.scss
│   ├── js/
│   │   ├── client.js
│   │   ├── ui.js
│   │   └── service-worker.js
│   ├── icons/
│   ├── index.html
│   └── manifest.json
├── bare/
│   ��── bare.js
│   └── ssl/
├── uv/
│   ├── uv.config.js
│   └── uv.sw.js
├── server.js
├── package.json
└── .env
```

## API Endpoints

- `/api/translate` - Translation service
- `/api/bookmark` - Bookmark management
- `/api/history` - Browsing history
- `/api/download` - Download management
- `/service/` - UV proxy service
- `/bare/` - Bare server

## Technologies Used

- **Backend**
  - Node.js
  - Express
  - Socket.IO
  - Ultraviolet
  - Bare Server
  - MongoDB (optional)

- **Frontend**
  - HTML5
  - SCSS
  - JavaScript
  - Service Workers
  - WebSocket

- **Security**
  - Helmet
  - CORS
  - Rate Limiting
  - JWT Authentication
  - SSL/TLS

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Security

- Always use HTTPS in production
- Keep API keys secure
- Configure SSL certificates
- Set appropriate CORS policies
- Configure rate limiting
- Use secure WebSocket connections

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Ultraviolet](https://github.com/titaniumnetwork-dev/Ultraviolet)
- [Bare Server](https://github.com/tomphttp/bare-server-node)
- [Socket.IO](https://socket.io/)
- [Express](https://expressjs.com/) 
