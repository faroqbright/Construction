import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
    apiKey: "AIzaSyAZWXEUkKLWtOiw72BSUf_i4SXWFcjtq4A",
    authDomain: "notificaion-28ffb.firebaseapp.com",
    projectId: "notificaion-28ffb",
    storageBucket: "notificaion-28ffb.firebasestorage.app",
    messagingSenderId: "715037213569",
    appId: "1:715037213569:web:92fd63a45d157d8556de80",
    measurementId: "G-SEJGXK5TW3"
  };

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export const requestForToken = async () => {
  try {
    const currentToken = await getToken(messaging, { 
      vapidKey: "BO2vbmQKUa6BVJts09CK5K69qJ6TX4ALTvndetV7dIU3rkk1LDKIKfz2PzKLwZ2HcWr6lXtcgMu7AIs0ii938FA" 
    });
    if (currentToken) {
      return currentToken;
    }
  } catch (err) {
    console.error('Error getting token:', err);
  }
};

export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });

export { messaging };