import { Socket } from 'socket.io-client';
import io from 'socket.io-client';

let socket: Socket | null = null;

interface TaskUpdatePayload {
  projectId: string;
  taskId: string;
  changes: any;
}

interface CollaborationMessage {
  projectId: string;
  message: string;
}

interface ProjectStatusChange {
  projectId: string;
  status: string;
}

const socketService = {
  /**
   * Initialize WebSocket connection
   * @param {string} token - JWT authentication token
   */
  connect(token: string) {
    const serverUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001';
    socket = io(serverUrl, {
      auth: {
        token: token,
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    socket.on('connect', () => {
      console.log('WebSocket connected:', socket?.id);
    });

    socket.on('connect_error', (error: Error) => {
      console.error('WebSocket connection error:', error);
    });

    socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
    });

    return socket;
  },

  /**
   * Disconnect WebSocket
   */
  disconnect() {
    if (socket) {
      socket.disconnect();
    }
  },

  /**
   * Join a project room for real-time updates
   * @param {string} projectId - Project ID
   */
  joinProject(projectId: string) {
    if (socket) {
      socket.emit('join-project', projectId);
    }
  },

  /**
   * Leave a project room
   * @param {string} projectId - Project ID
   */
  leaveProject(projectId: string) {
    if (socket) {
      socket.emit('leave-project', projectId);
    }
  },

  /**
   * Notify when a task is updated
   * @param {string} projectId - Project ID
   * @param {string} taskId - Task ID
   * @param {object} changes - Changes made to the task
   */
  emitTaskUpdate(projectId: string, taskId: string, changes: any) {
    if (socket) {
      socket.emit('task-updated', {
        projectId,
        taskId,
        changes,
      });
    }
  },

  /**
   * Send a collaboration message
   * @param {string} projectId - Project ID
   * @param {string} message - Message content
   */
  sendCollaborationMessage(projectId: string, message: string) {
    if (socket) {
      socket.emit('collaboration-message', {
        projectId,
        message,
      });
    }
  },

  /**
   * Notify when project status changes
   * @param {string} projectId - Project ID
   * @param {string} status - New project status
   */
  emitProjectStatusChange(projectId: string, status: string) {
    if (socket) {
      socket.emit('project-status-changed', {
        projectId,
        status,
      });
    }
  },

  /**
   * Listen for task update notifications
   * @param {function} callback - Callback function
   */
  onTaskUpdate(callback: (data: any) => void) {
    if (socket) {
      socket.on('task-update-notification', callback);
    }
  },

  /**
   * Listen for new collaboration messages
   * @param {function} callback - Callback function
   */
  onNewMessage(callback: (data: any) => void) {
    if (socket) {
      socket.on('new-message', callback);
    }
  },

  /**
   * Listen for project status updates
   * @param {function} callback - Callback function
   */
  onProjectStatusUpdate(callback: (data: any) => void) {
    if (socket) {
      socket.on('project-status-update', callback);
    }
  },

  /**
   * Listen for user join notifications
   * @param {function} callback - Callback function
   */
  onUserJoined(callback: (data: any) => void) {
    if (socket) {
      socket.on('user-joined', callback);
    }
  },

  /**
   * Listen for user leave notifications
   * @param {function} callback - Callback function
   */
  onUserLeft(callback: (data: any) => void) {
    if (socket) {
      socket.on('user-left', callback);
    }
  },

  /**
   * Remove event listener
   * @param {string} event - Event name
   * @param {function} callback - Callback function
   */
  off(event: string, callback: (data: any) => void) {
    if (socket) {
      socket.off(event, callback);
    }
  },

  /**
   * Get socket instance
   */
  getSocket(): Socket | null {
    return socket;
  },
};

export default socketService;
