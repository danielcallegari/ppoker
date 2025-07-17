# 🃏 Planning Poker Application

A real-time planning poker application built with Node.js, WebSockets, and modern web technologies.

An experiment with "Vibe Coding" by Daniel Callegari in Jul/2025.

## ✨ Features

- **Real-time communication** using WebSockets
- **Multiple card decks**: Fibonacci, T-shirt sizes, Hours
- **Live voting sessions** with progress tracking
- **Statistics calculation**: Average, median, consensus
- **Responsive design** for desktop and mobile
- **Clickable card interface** with mouse support
- **Automatic reconnection** and heartbeat monitoring
- **Network IP display** for easy client access

## 🚀 Quick Start

### Prerequisites
- Node.js (version 14 or higher)
- npm (Node Package Manager)

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the server:**
   ```bash
   npm start
   ```

3. **Access the application:**
   - **Admin Panel**: http://localhost:3000/admin
   - **Client Interface**: http://localhost:3000/client
   - **Network access**: Check admin panel for network IP (for other devices on same network)

## 🎯 How to Use

### For Facilitators (Admin Panel)

1. Open the admin panel at `/admin`
2. Note the network IP displayed for sharing with team members
3. Select your preferred card deck (Fibonacci, T-shirt, Hours)
4. Wait for clients to connect
5. Click "Start Planning Session" when ready
6. Monitor voting progress in real-time
7. Click "Reveal Cards" to show results
8. View statistics and start new rounds as needed

### For Team Members (Client Interface)

1. Open the client interface at `/client`
2. Enter your name and click "Connect to Session"
3. Wait for the session to start
4. **Click on any card** to cast your vote
5. Your selection will be highlighted in blue
6. You can click the same card again to deselect it
7. Wait for all team members to vote
8. View results when cards are revealed

## 🖱️ Voting Interface

- **Mouse-driven**: Simply click on any card to vote
- **Visual feedback**: Selected cards are highlighted in blue
- **Toggle selection**: Click the same card again to deselect
- **Clear button**: Use the "Clear" button to remove your vote

## 🎮 Session States

1. **Registration**: Clients connect and wait for session start
2. **Voting**: Active voting session, clients select cards
3. **Results**: Cards revealed with statistics

## 📊 Statistics

The application automatically calculates:
- **Average**: Mean of all numeric votes
- **Median**: Middle value of sorted votes
- **Min/Max**: Lowest and highest votes
- **Consensus**: Percentage of most common vote

## 🔧 Development

### Start in development mode:
```bash
npm run dev
```

This uses nodemon for automatic server restarts on file changes.

### Project Structure

```
├── server.js              # Main Node.js server
├── admin.html             # Admin panel interface
├── client.html            # Client voting interface
├── package.json           # Node.js dependencies
└── README.md              # This file
```

## 📝 License

MIT License - Feel free to use and modify for your team's needs.

