// Chat API functions

import api from './index';

/**
 * Get chat history for a user
 * @param {string} userId - Current user ID
 * @returns {Promise<array>}
 */
export const getChatHistory = async (userId) => {
    const response = await api.get(`chats/${userId}`);
    return response.data;
};

/**
 * Send a chat message
 * @param {object} data - { sender_id, receiver_id, message }
 * @returns {Promise<object>}
 */
export const sendMessage = async (data) => {
    const response = await api.post('chat/send', data);
    return response.data;
};

/**
 * Get list of chat contacts
 * @param {string} userId
 * @returns {Promise<array>}
 */
export const getChatList = async (userId) => {
    const response = await api.get(`chats/getChatList/${userId}`);
    return response.data;
};

/**
 * Get all chat contacts for user
 * @param {string} userId
 * @returns {Promise<array>}
 */
export const getChatContacts = async (userId) => {
    const response = await api.get(`chat/contacts/${userId}`);
    return response.data;
};

/**
 * Get all counselors
 * @returns {Promise<array>}
 */
export const getCounselors = async () => {
    const response = await api.get('auth/getusersByRole/counselor');
    return response.data;
};

/**
 * Get assigned students for a counselor
 * @param {string} counselorId
 * @returns {Promise<array>}
 */
export const getAssignedStudents = async (counselorId) => {
    const response = await api.get(`auth/getAssignedStudents/${counselorId}`);
    return response.data;
};

/**
 * Get user details by ID
 * @param {string} userId
 * @returns {Promise<object>}
 */
export const getUserDetails = async (userId) => {
    const response = await api.get(`auth/getUser/${userId}`);
    return response.data;
};

/**
 * Send a message with file attachment
 * @param {object} data - { sender_id, receiver_id, message }
 * @param {object} file - File object from document picker
 * @returns {Promise<object>}
 */
export const sendMessageWithFile = async (data, file) => {
    const formData = new FormData();
    formData.append('sender_id', data.sender_id);
    formData.append('receiver_id', data.receiver_id);
    formData.append('message', data.message || '');

    if (file) {
        formData.append('file', {
            uri: file.uri,
            type: file.mimeType || 'application/octet-stream',
            name: file.name || 'attachment',
        });
    }

    const response = await api.post('chat/send-with-file', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

/**
 * Mark messages as read
 * @param {string} userId - Current user ID
 * @param {string} senderId - Sender's user ID
 * @returns {Promise<object>}
 */
export const markMessagesAsRead = async (userId, senderId) => {
    const response = await api.post('chat/mark-read', {
        user_id: userId,
        sender_id: senderId,
    });
    return response.data;
};

/**
 * Update typing status
 * @param {string} userId - Current user ID
 * @param {string} receiverId - Receiver's user ID
 * @param {boolean} isTyping - Typing status
 * @returns {Promise<object>}
 */
export const updateTypingStatus = async (userId, receiverId, isTyping) => {
    const response = await api.post('chat/typing', {
        user_id: userId,
        receiver_id: receiverId,
        is_typing: isTyping,
    });
    return response.data;
};

/**
 * Get online status for a user
 * @param {string} userId
 * @returns {Promise<object>}
 */
export const getUserOnlineStatus = async (userId) => {
    const response = await api.get(`chat/online-status/${userId}`);
    return response.data;
};

/**
 * Get unread message count
 * @param {string} userId
 * @returns {Promise<object>}
 */
export const getUnreadCount = async (userId) => {
    const response = await api.get(`chat/unread-count/${userId}`);
    return response.data;
};

export default {
    getChatHistory,
    sendMessage,
    getChatList,
    getChatContacts,
    sendMessageWithFile,
    markMessagesAsRead,
    updateTypingStatus,
    getUserOnlineStatus,
    getUnreadCount,
    getCounselors,
    getAssignedStudents,
    getUserDetails,
};
