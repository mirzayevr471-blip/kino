import React, { createContext, useContext, useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { toast } from 'sonner';

interface Notification {
  id: string;
  title: string;
  category: string;
}

interface NotificationContextType {
  unreadCount: number;
  clearUnread: () => void;
}

const NotificationContext = createContext<NotificationContextType>({
  unreadCount: 0,
  clearUnread: () => {},
});

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [initialLoad, setInitialLoad] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'movies'), orderBy('createdAt', 'desc'), limit(10));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          if (!initialLoad) {
            const movie = change.doc.data();
            toast.success(`Yangi kontent: ${movie.title}`, {
              description: `${movie.category.toUpperCase()} bo'limida qo'shildi`,
              duration: 5000,
            });
            setUnreadCount((prev) => prev + 1);
          }
        }
      });
      setInitialLoad(false);
    });

    return () => unsubscribe();
  }, [initialLoad]);

  return (
    <NotificationContext.Provider value={{ unreadCount, clearUnread: () => setUnreadCount(0) }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
