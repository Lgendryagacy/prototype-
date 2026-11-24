import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, getDocs } from 'firebase/firestore';
import { db } from '../config';

/**
 * Hook to get total unread message count for a user
 * Works for both brand owners (brand messages) and customers (regular messages)
 */
export const useUnreadMessageCount = (userId: string | undefined, isBrandOwner: boolean = false, brandId?: string) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    let unsubscribe: (() => void) | undefined;

    const setupListener = async () => {
      try {
        if (isBrandOwner && brandId) {
          // For brand owners - check brand conversations
          const conversationsRef = collection(db, 'conversations');
          const q = query(
            conversationsRef,
            where('brandId', '==', brandId),
            where('unreadBy', '==', 'brand')
          );

          unsubscribe = onSnapshot(q, (snapshot) => {
            let totalUnread = 0;
            snapshot.forEach((doc) => {
              const data = doc.data();
              totalUnread += data.unreadCount || 0;
            });
            setUnreadCount(totalUnread);
            setLoading(false);
          }, (error) => {
            console.error('Error listening to brand unread messages:', error);
            setUnreadCount(0);
            setLoading(false);
          });
        } else {
          // For regular users - check customer conversations
          const conversationsRef = collection(db, 'conversations');
          const q = query(
            conversationsRef,
            where('userId', '==', userId),
            where('unreadBy', '==', 'user')
          );

          unsubscribe = onSnapshot(q, (snapshot) => {
            let totalUnread = 0;
            snapshot.forEach((doc) => {
              const data = doc.data();
              totalUnread += data.unreadCount || 0;
            });
            setUnreadCount(totalUnread);
            setLoading(false);
          }, (error) => {
            console.error('Error listening to customer unread messages:', error);
            setUnreadCount(0);
            setLoading(false);
          });
        }
      } catch (error) {
        console.error('Error setting up unread messages listener:', error);
        setUnreadCount(0);
        setLoading(false);
      }
    };

    setupListener();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [userId, isBrandOwner, brandId]);

  return { unreadCount, loading };
};

/**
 * Hook to get unread count for a specific conversation
 */
export const useConversationUnreadCount = (conversationId: string | undefined, userType: 'brand' | 'user') => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!conversationId) {
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    const conversationsRef = collection(db, 'conversations');
    const conversationQuery = query(conversationsRef, where('__name__', '==', conversationId));

    const unsubscribe = onSnapshot(conversationQuery, (snapshot) => {
      if (!snapshot.empty) {
        const data = snapshot.docs[0].data();
        const expectedUnreadBy = userType;
        
        if (data.unreadBy === expectedUnreadBy) {
          setUnreadCount(data.unreadCount || 0);
        } else {
          setUnreadCount(0);
        }
      } else {
        setUnreadCount(0);
      }
      setLoading(false);
    }, (error) => {
      console.error('Error listening to conversation unread count:', error);
      setUnreadCount(0);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [conversationId, userType]);

  return { unreadCount, loading };
};
