import { Server } from 'socket.io';

const PORT = 3003;

// Notification types
interface Notification {
  id: string;
  type: 'emergency' | 'alert' | 'reminder' | 'appointment' | 'vaccination' | 'outbreak';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  targetUsers?: string[];
  targetRoles?: string[];
  targetDistricts?: string[];
  data?: Record<string, unknown>;
  createdAt: Date;
}

// Active notifications store
const notifications: Map<string, Notification> = new Map();
const userSessions: Map<string, Set<string>> = new Map(); // userId -> socketIds

const io = new Server(PORT, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

console.log(`🔔 Notification Service running on port ${PORT}`);

io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  // User authentication
  socket.on('authenticate', (data: { userId: string; role: string; district?: string }) => {
    socket.data.userId = data.userId;
    socket.data.role = data.role;
    socket.data.district = data.district;

    // Track user sessions
    if (!userSessions.has(data.userId)) {
      userSessions.set(data.userId, new Set());
    }
    userSessions.get(data.userId)!.add(socket.id);

    // Join role-based room
    socket.join(`role:${data.role}`);
    
    // Join district room if available
    if (data.district) {
      socket.join(`district:${data.district}`);
    }

    socket.emit('authenticated', { success: true, socketId: socket.id });
    
    // Send pending notifications
    const pendingNotifications = Array.from(notifications.values())
      .filter(n => {
        if (n.targetUsers?.includes(data.userId)) return true;
        if (n.targetRoles?.includes(data.role)) return true;
        if (data.district && n.targetDistricts?.includes(data.district)) return true;
        return n.targetUsers === undefined && n.targetRoles === undefined;
      });
    
    if (pendingNotifications.length > 0) {
      socket.emit('notifications:bulk', pendingNotifications);
    }
  });

  // Create new notification (from health workers, admins, or system)
  socket.on('notification:create', async (data: Omit<Notification, 'id' | 'createdAt'>) => {
    const notification: Notification = {
      ...data,
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date()
    };

    notifications.set(notification.id, notification);

    // Emit to specific users
    if (notification.targetUsers) {
      notification.targetUsers.forEach(userId => {
        io.to(`user:${userId}`).emit('notification:new', notification);
      });
    }

    // Emit to roles
    if (notification.targetRoles) {
      notification.targetRoles.forEach(role => {
        io.to(`role:${role}`).emit('notification:new', notification);
      });
    }

    // Emit to districts
    if (notification.targetDistricts) {
      notification.targetDistricts.forEach(district => {
        io.to(`district:${district}`).emit('notification:new', notification);
      });
    }

    // Broadcast emergency to all
    if (notification.type === 'emergency' || notification.priority === 'critical') {
      io.emit('notification:emergency', notification);
    }

    socket.emit('notification:created', { success: true, notification });
  });

  // Emergency SOS
  socket.on('emergency:sos', async (data: {
    userId: string;
    type: string;
    location?: { lat: number; lng: number };
    description: string;
  }) => {
    const notification: Notification = {
      id: `emergency_${Date.now()}`,
      type: 'emergency',
      title: '🚨 Emergency SOS',
      message: `Emergency alert from user ${data.userId}: ${data.description}`,
      priority: 'critical',
      data: {
        userId: data.userId,
        emergencyType: data.type,
        location: data.location
      },
      createdAt: new Date()
    };

    // Alert all health workers and doctors
    io.to('role:health_worker').emit('emergency:alert', notification);
    io.to('role:doctor').emit('emergency:alert', notification);
    io.to('role:admin').emit('emergency:alert', notification);

    // Also emit to district if location available
    if (data.location) {
      io.emit('emergency:nearby', notification);
    }

    socket.emit('emergency:received', { success: true, emergencyId: notification.id });
  });

  // Acknowledge notification
  socket.on('notification:acknowledge', (data: { notificationId: string; userId: string }) => {
    socket.emit('notification:acknowledged', { notificationId: data.notificationId });
  });

  // Typing indicator for chat
  socket.on('chat:typing', (data: { sessionId: string; userId: string }) => {
    socket.broadcast.emit('chat:typing', data);
  });

  // Health worker location update
  socket.on('location:update', (data: { userId: string; lat: number; lng: number }) => {
    socket.data.location = { lat: data.lat, lng: data.lng };
    io.to('role:admin').emit('worker:location', data);
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
    
    if (socket.data.userId) {
      const sessions = userSessions.get(socket.data.userId);
      if (sessions) {
        sessions.delete(socket.id);
        if (sessions.size === 0) {
          userSessions.delete(socket.data.userId);
        }
      }
    }
  });
});

// REST API for creating notifications from backend
import { createServer } from 'http';
import express from 'express';

const app = express();
app.use(express.json());

// API endpoint to create notification
app.post('/api/notify', (req, res) => {
  const data = req.body;
  
  const notification: Notification = {
    ...data,
    id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date()
  };

  notifications.set(notification.id, notification);

  // Emit to appropriate rooms
  if (notification.targetRoles) {
    notification.targetRoles.forEach(role => {
      io.to(`role:${role}`).emit('notification:new', notification);
    });
  }

  if (notification.targetDistricts) {
    notification.targetDistricts.forEach(district => {
      io.to(`district:${district}`).emit('notification:new', notification);
    });
  }

  if (notification.priority === 'critical') {
    io.emit('notification:emergency', notification);
  }

  res.json({ success: true, notification });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    connections: io.sockets.sockets.size,
    notifications: notifications.size 
  });
});

export { io, notifications };
