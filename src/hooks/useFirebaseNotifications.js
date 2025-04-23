import { useEffect } from 'react';
import { requestForToken, onMessageListener } from '../firebase/firebase';
import { toast } from 'react-toastify';
import apiRequest from '../utils/apiRequest';

export const useFirebaseNotifications = (token) => {
  useEffect(() => {
    const setupNotifications = async () => {
      try {   
        const fcmToken = await requestForToken();
        if (fcmToken && token) {
          await apiRequest('post', '/notifications/register', { token: fcmToken }, token);
        }
        
        const message = await onMessageListener();
        if (message) {
          toast.info(message.notification?.body || 'New notification');
        }
      } catch (error) {
        console.error('Notification setup error:', error);
      }
    };

    setupNotifications();
  }, [token]);
};