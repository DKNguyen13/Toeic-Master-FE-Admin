import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {

  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const socketRef = useRef(null);
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    // Chỉ kết nối khi user đã đăng nhập
    if (!userId) {
      console.log('User not logged in, skipping socket connection');
      return;
    }

    // Khởi tạo socket connection
    const SOCKET_URL = 'https://toeic-master-be.onrender.com';
    
    console.log('Connecting to socket server:', SOCKET_URL);
    
    const newSocket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      auth: {
        token: localStorage.getItem('token')
      }
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    // ==================
    // SOCKET EVENTS
    // ==================

    // Kết nối thành công
    newSocket.on('connect', () => {
      console.log('✓ Connected to socket server:', newSocket.id);
      setConnected(true);
      
      // Đăng ký userId
      newSocket.emit('register', userId);
    });

    // Nhận confirmation sau khi register
    newSocket.on('connected', (data) => {
      console.log('✓ Registered with server:', data);
    });

    // Nhận notification mới
    newSocket.on('notification', (notification) => {
      console.log('📬 New notification:', notification);
      
      // Thêm vào danh sách notifications
      setNotifications(prev => [notification, ...prev]);
      
      // Tăng unread count
      if (!notification.read) {
        setUnreadCount(prev => prev + 1);
        console.log('Unread count:', unreadCount);
      }


      // Hiển thị browser notification (nếu được phép)
      showBrowserNotification(notification);
      
      // Phát âm thanh
      playNotificationSound();
    });

    // Mất kết nối
    newSocket.on('disconnect', (reason) => {
      console.log('✗ Disconnected:', reason);
      setConnected(false);
    });

    // Lỗi kết nối
    newSocket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      setConnected(false);
    });

    // Reconnecting
    newSocket.on('reconnect_attempt', (attemptNumber) => {
      console.log(`🔄 Reconnection attempt ${attemptNumber}...`);
    });

    // Reconnected
    newSocket.on('reconnect', (attemptNumber) => {
      console.log(`✓ Reconnected after ${attemptNumber} attempts`);
      setConnected(true);
      // Re-register user
      newSocket.emit('register', userId);
    });

    // Cleanup khi component unmount hoặc user logout
    return () => {
      console.log('Disconnecting socket...');
      newSocket.close();
      setSocket(null);
      setConnected(false);
    };

  }, [userId]);

  // ==================
  // HELPER FUNCTIONS
  // ==================

  const showBrowserNotification = (notification) => {
    // Kiểm tra browser có hỗ trợ notification không
    if (!('Notification' in window)) {
      return;
    }

    // Request permission nếu chưa có
    if (Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: notification.icon || '/logo192.png',
        badge: '/logo192.png',
        tag: notification.id,
        data: notification
      });
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          new Notification(notification.title, {
            body: notification.message,
            icon: notification.icon || '/logo192.png'
          });
        }
      });
    }
  };

  const playNotificationSound = () => {
    const audio = new Audio('/sounds/notification.mp3'); // Thêm file sound vào public/sounds/
    audio.volume = 0.3;
    audio.play().catch(e => console.log('Cannot play sound:', e));
  };

  // Mark notification as read
  const markAsRead = (notificationId) => {
    if (socket) {
      socket.emit('mark-as-read', notificationId);
      
      // Update local state
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, read: true } 
            : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  // Clear all notifications
  const clearNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  const value = {
    socket: socketRef.current,
    connected,
    notifications,
    unreadCount,
    markAsRead,
    clearNotifications
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};