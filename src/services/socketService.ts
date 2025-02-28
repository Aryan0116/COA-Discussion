
import { io, Socket } from 'socket.io-client';
import { toast } from 'sonner';

// Mock socket events for our prototype
// In a real app, this would connect to a real Socket.IO server
class SocketService {
  private socket: Socket | null = null;
  private callbacks: Record<string, Function[]> = {};
  
  // Connect to socket server
  connect(userId: string) {
    // In a real app, connect to a Socket.IO server with a proper URL
    // For our prototype, we'll create a mock socket that simulates responses
    console.log(`Connecting to socket as user ${userId}...`);
    
    // Mock Socket behavior
    this.socket = {
      connected: true,
      id: `socket-${Date.now()}`,
      
      on: (event: string, callback: Function) => {
        if (!this.callbacks[event]) {
          this.callbacks[event] = [];
        }
        this.callbacks[event].push(callback);
        return this;
      },
      
      emit: (event: string, ...args: any[]) => {
        console.log(`[Socket] Emitting event: ${event}`, args);
        
        // Simulate server responses based on event type
        setTimeout(() => {
          if (event === 'new_post') {
            this.trigger('post_created', args[0]);
          }
          else if (event === 'new_comment') {
            this.trigger('comment_created', args[0]);
          }
          else if (event === 'like_post') {
            this.trigger('post_liked', args[0]);
          }
        }, 300);
        
        return true;
      },
      
      disconnect: () => {
        console.log('[Socket] Disconnected');
        this.callbacks = {};
        return this;
      }
    } as unknown as Socket;
    
    // Notify successful connection
    toast.success('Connected to real-time updates');
    
    return this.socket;
  }
  
  // Trigger event handlers (for our mock implementation)
  private trigger(event: string, ...args: any[]) {
    if (this.callbacks[event]) {
      this.callbacks[event].forEach(callback => callback(...args));
    }
  }
  
  // Disconnect from socket server
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
  
  // Get socket instance
  getSocket() {
    return this.socket;
  }
  
  // Check if connected
  isConnected() {
    return this.socket?.connected || false;
  }
}

export const socketService = new SocketService();
