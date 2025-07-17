const express = require('express');
const WebSocket = require('ws');
const http = require('http');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const os = require('os');

class PPokerServer {
    constructor() {
        console.log('🚀 [SERVER] Initializing PPoker Node.js Server...');
        
        this.app = express();
        this.server = http.createServer(this.app);
        this.wss = new WebSocket.Server({ server: this.server });
        
        this.state = 'REGISTRATION';
        this.clients = new Map();
        this.sessionId = null;
        this.decks = {
            fibonacci: [1, 2, 3, 5, 8, 13, 21, 34, 55, 100],
            tshirt: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
            hours: [0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0]
        };
        this.currentDeck = this.decks.fibonacci;
        
        this.setupRoutes();
        this.setupWebSocket();
        
        const PORT = process.env.PORT || 3000;
        const localIP = this.getLocalIPAddress();
        
        this.server.listen(PORT, () => {
            console.log(`🚀 [SERVER] PPoker server running on http://localhost:${PORT}`);
            if (localIP) {
                console.log(`🌐 [SERVER] Network access: http://${localIP}:${PORT}`);
            }
            console.log(`🚀 [SERVER] Admin panel: http://localhost:${PORT}/admin`);
            console.log(`🚀 [SERVER] Client access: http://localhost:${PORT}/client`);
        });
    }

    getLocalIPAddress() {
        const interfaces = os.networkInterfaces();
        for (const name of Object.keys(interfaces)) {
            for (const net of interfaces[name]) {
                // Skip over non-IPv4 and internal addresses
                if (net.family === 'IPv4' && !net.internal) {
                    return net.address;
                }
            }
        }
        return null;
    }

    setupRoutes() {
        console.log('🚀 [SERVER] Setting up HTTP routes...');
        
        // Serve static files
        this.app.use(express.static(path.join(__dirname, 'public')));
        
        // Server info API endpoint
        this.app.get('/api/server-info', (req, res) => {
            const PORT = process.env.PORT || 3000;
            const localIP = this.getLocalIPAddress();
            res.json({
                port: PORT,
                localhost: `http://localhost:${PORT}`,
                networkIP: localIP ? `http://${localIP}:${PORT}` : null,
                adminURL: `http://localhost:${PORT}/admin`,
                clientURL: `http://localhost:${PORT}/client`
            });
        });
        
        // Admin panel route
        this.app.get('/admin', (req, res) => {
            res.sendFile(path.join(__dirname, 'admin.html'));
        });
        
        // Client route
        this.app.get('/client', (req, res) => {
            res.sendFile(path.join(__dirname, 'client.html'));
        });
        
        // Default route
        this.app.get('/', (req, res) => {
            res.redirect('/admin');
        });
    }

    setupWebSocket() {
        console.log('🚀 [SERVER] Setting up WebSocket connections...');
        
        this.wss.on('connection', (ws) => {
            console.log('🔌 [SERVER] New WebSocket connection established');
            
            ws.on('message', (message) => {
                try {
                    const data = JSON.parse(message);
                    console.log('📨 [SERVER] Received message:', data.type, 'from:', data.clientId || 'unknown');
                    this.handleMessage(ws, data);
                } catch (error) {
                    console.error('❌ [SERVER] Error parsing message:', error);
                }
            });
            
            ws.on('close', () => {
                console.log('🔌 [SERVER] WebSocket connection closed');
                this.handleDisconnection(ws);
            });
            
            ws.on('error', (error) => {
                console.error('❌ [SERVER] WebSocket error:', error);
            });
            
            // Send initial state
            this.sendToClient(ws, {
                type: 'state_update',
                state: this.getStateForClient()
            });
        });
    }

    handleMessage(ws, data) {
        console.log('🔄 [SERVER] Handling message type:', data.type);
        
        switch (data.type) {
            case 'register_client':
                this.registerClient(ws, data);
                break;
            case 'register_admin':
                this.registerAdmin(ws, data);
                break;
            case 'cast_vote':
                this.handleVote(ws, data);
                break;
            case 'start_session':
                this.startSession();
                break;
            case 'reveal_cards':
                this.revealCards();
                break;
            case 'new_round':
                this.newRound();
                break;
            case 'reset_server':
                this.resetServer();
                break;
            case 'back_to_registration':
                this.backToRegistration();
                break;
            case 'change_deck':
                this.changeDeck(data.deck);
                break;
            case 'heartbeat':
                this.handleHeartbeat(ws, data);
                break;
            default:
                console.log('❓ [SERVER] Unknown message type:', data.type);
        }
    }

    registerClient(ws, data) {
        const clientId = data.clientId || uuidv4();
        console.log('👤 [SERVER] Registering client:', clientId, 'alias:', data.alias);
        
        const client = {
            id: clientId,
            alias: data.alias,
            ws: ws,
            vote: null,
            lastSeen: Date.now(),
            type: 'client'
        };
        
        this.clients.set(clientId, client);
        ws.clientId = clientId;
        
        console.log('👤 [SERVER] Client registered successfully. Total clients:', this.clients.size);
        
        this.sendToClient(ws, {
            type: 'registration_success',
            clientId: clientId,
            state: this.getStateForClient()
        });
        
        this.broadcastStateUpdate();
    }

    registerAdmin(ws, data) {
        console.log('👑 [SERVER] Registering admin connection');
        ws.isAdmin = true;
        
        this.sendToClient(ws, {
            type: 'admin_registered',
            state: this.getStateForAdmin()
        });
    }

    handleVote(ws, data) {
        const client = this.clients.get(ws.clientId);
        if (!client) {
            console.log('❌ [SERVER] Vote from unregistered client');
            return;
        }
        
        if (this.state !== 'SESSION_START') {
            console.log('❌ [SERVER] Vote received but session not active');
            return;
        }
        
        console.log('🗳️ [SERVER] Vote received from', client.alias, ':', data.vote);
        client.vote = data.vote;
        client.lastSeen = Date.now();
        
        this.broadcastStateUpdate();
    }

    handleHeartbeat(ws, data) {
        const client = this.clients.get(ws.clientId);
        if (client) {
            client.lastSeen = Date.now();
        }
    }

    handleDisconnection(ws) {
        if (ws.clientId) {
            const client = this.clients.get(ws.clientId);
            if (client) {
                console.log('👋 [SERVER] Client disconnected:', client.alias);
                this.clients.delete(ws.clientId);
                this.broadcastStateUpdate();
            }
        }
    }

    startSession() {
        console.log('🎯 [SERVER] Starting new session...');
        this.state = 'SESSION_START';
        this.sessionId = 'session_' + Date.now();
        
        // Clear all votes
        let clearedVotes = 0;
        for (let client of this.clients.values()) {
            if (client.vote !== null) {
                clearedVotes++;
            }
            client.vote = null;
        }
        
        console.log('🎯 [SERVER] Session started. Cleared', clearedVotes, 'votes. Session ID:', this.sessionId);
        this.broadcastStateUpdate();
    }

    revealCards() {
        console.log('🏆 [SERVER] Revealing cards...');
        const votesCount = Array.from(this.clients.values()).filter(c => c.vote !== null).length;
        console.log('🏆 [SERVER] Revealing', votesCount, 'votes');
        
        this.state = 'CARD_REVEAL';
        this.broadcastStateUpdate();
    }

    newRound() {
        console.log('🔄 [SERVER] Starting new round...');
        this.state = 'SESSION_START';
        this.sessionId = 'session_' + Date.now();
        
        // Clear all votes
        let clearedVotes = 0;
        for (let client of this.clients.values()) {
            if (client.vote !== null) {
                clearedVotes++;
            }
            client.vote = null;
        }
        
        console.log('🔄 [SERVER] New round started. Cleared', clearedVotes, 'votes');
        this.broadcastStateUpdate();
    }

    resetServer() {
        console.log('🔄 [SERVER] Resetting server...');
        const clientCount = this.clients.size;
        
        this.state = 'REGISTRATION';
        this.sessionId = null;
        
        // Disconnect all clients
        for (let client of this.clients.values()) {
            if (client.ws && client.ws.readyState === WebSocket.OPEN) {
                this.sendToClient(client.ws, { type: 'server_reset' });
            }
        }
        
        this.clients.clear();
        console.log('🔄 [SERVER] Server reset complete. Disconnected', clientCount, 'clients');
        this.broadcastStateUpdate();
    }

    backToRegistration() {
        console.log('🔄 [SERVER] Returning to registration state...');
        this.state = 'REGISTRATION';
        this.broadcastStateUpdate();
    }

    changeDeck(deckType) {
        if (this.decks[deckType]) {
            console.log('🃏 [SERVER] Changing deck to:', deckType);
            this.currentDeck = this.decks[deckType];
            this.broadcastStateUpdate();
        } else {
            console.log('❌ [SERVER] Unknown deck type:', deckType);
        }
    }

    getStateForClient() {
        return {
            state: this.state,
            sessionId: this.sessionId,
            deck: this.currentDeck,
            clients: this.getClientsForClient()
        };
    }

    getStateForAdmin() {
        return {
            state: this.state,
            sessionId: this.sessionId,
            deck: this.currentDeck,
            clients: this.getClientsForAdmin(),
            statistics: this.calculateStatistics()
        };
    }

    getClientsForClient() {
        const clientData = {};
        for (let [id, client] of this.clients) {
            clientData[id] = {
                alias: client.alias,
                vote: this.state === 'CARD_REVEAL' ? client.vote : (client.vote !== null ? 'voted' : null)
            };
        }
        return clientData;
    }

    getClientsForAdmin() {
        const clientData = {};
        for (let [id, client] of this.clients) {
            clientData[id] = {
                alias: client.alias,
                vote: client.vote,
                lastSeen: client.lastSeen
            };
        }
        return clientData;
    }

    calculateStatistics() {
        const votes = Array.from(this.clients.values())
            .map(c => c.vote)
            .filter(v => v !== null && typeof v === 'number');

        if (votes.length === 0) {
            return null;
        }

        const sorted = [...votes].sort((a, b) => a - b);
        const sum = votes.reduce((a, b) => a + b, 0);
        const average = sum / votes.length;
        const median = sorted.length % 2 === 0 
            ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
            : sorted[Math.floor(sorted.length / 2)];

        // Calculate consensus
        const frequency = {};
        votes.forEach(v => frequency[v] = (frequency[v] || 0) + 1);
        const maxFreq = Math.max(...Object.values(frequency));
        const consensus = Math.round((maxFreq / votes.length) * 100);

        return {
            average: parseFloat(average.toFixed(1)),
            median: median,
            min: Math.min(...votes),
            max: Math.max(...votes),
            consensus: consensus
        };
    }

    sendToClient(ws, message) {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(message));
        }
    }

    broadcastStateUpdate() {
        console.log('📡 [SERVER] Broadcasting state update to all connections');
        
        const clientState = this.getStateForClient();
        const adminState = this.getStateForAdmin();
        
        let clientCount = 0;
        let adminCount = 0;
        
        this.wss.clients.forEach((ws) => {
            if (ws.readyState === WebSocket.OPEN) {
                if (ws.isAdmin) {
                    this.sendToClient(ws, { type: 'state_update', state: adminState });
                    adminCount++;
                } else {
                    this.sendToClient(ws, { type: 'state_update', state: clientState });
                    clientCount++;
                }
            }
        });
        
        console.log('📡 [SERVER] State update sent to', clientCount, 'clients and', adminCount, 'admins');
    }
}

// Start the server
console.log('🚀 [SERVER] Starting PPoker Node.js application...');
new PPokerServer();
