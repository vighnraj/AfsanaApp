// Socket.io Service - Real-time chat communication

import { io } from 'socket.io-client';

const SOCKET_URL = 'https://afsana-backend-production-0897.up.railway.app';

class SocketService {
    constructor() {
        this.socket = null;
        this.isConnected = false;
        this.currentUserId = null;
        this.messageListeners = [];
        this.historyListeners = [];
        this.connectionListeners = [];
    }

    // Initialize socket connection
    connect(userId) {
        if (this.socket?.connected) {
            return;
        }

        this.currentUserId = userId;

        this.socket = io(SOCKET_URL, {
            transports: ['websocket'],
            autoConnect: true,
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        // Connection events
        this.socket.on('connect', () => {
            console.log('Socket connected');
            this.isConnected = true;
            // Join with user ID
            if (userId) {
                this.socket.emit('join', userId);
            }
            this.notifyConnectionListeners(true);
        });

        this.socket.on('disconnect', () => {
            console.log('Socket disconnected');
            this.isConnected = false;
            this.notifyConnectionListeners(false);
        });

        this.socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
            this.isConnected = false;
            this.notifyConnectionListeners(false);
        });

        // Message events
        this.socket.on('messages', (messages) => {
            this.notifyHistoryListeners(messages);
        });

        this.socket.on('new_message', (message) => {
            this.notifyMessageListeners(message);
        });
    }

    // Disconnect socket
    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.isConnected = false;
            this.currentUserId = null;
        }
    }

    // Join a specific user's room
    joinRoom(userId) {
        if (this.socket?.connected && userId) {
            this.socket.emit('join', userId);
        }
    }

    // Get messages between two users or from a group
    getMessages(payload) {
        // payload: { sender_id, receiver_id } for DM or { group_id } for group
        if (this.socket?.connected) {
            this.socket.emit('get_messages', payload);
        }
    }

    // Send a message
    sendMessage(payload) {
        // payload: { message, sender_id, receiver_id, type, group_id }
        if (this.socket?.connected) {
            this.socket.emit('send_message', payload);
        }
    }

    // Add message listener
    addMessageListener(callback) {
        this.messageListeners.push(callback);
        return () => {
            this.messageListeners = this.messageListeners.filter(cb => cb !== callback);
        };
    }

    // Add history listener
    addHistoryListener(callback) {
        this.historyListeners.push(callback);
        return () => {
            this.historyListeners = this.historyListeners.filter(cb => cb !== callback);
        };
    }

    // Add connection listener
    addConnectionListener(callback) {
        this.connectionListeners.push(callback);
        return () => {
            this.connectionListeners = this.connectionListeners.filter(cb => cb !== callback);
        };
    }

    // Notify message listeners
    notifyMessageListeners(message) {
        this.messageListeners.forEach(callback => callback(message));
    }

    // Notify history listeners
    notifyHistoryListeners(messages) {
        this.historyListeners.forEach(callback => callback(messages));
    }

    // Notify connection listeners
    notifyConnectionListeners(connected) {
        this.connectionListeners.forEach(callback => callback(connected));
    }

    // Check if connected
    getConnectionStatus() {
        return this.isConnected;
    }
}

// Singleton instance
const socketService = new SocketService();

export default socketService;
