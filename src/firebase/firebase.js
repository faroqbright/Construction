// firebase.js or firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyBZZ7qfoPN3XJpA4F6a2I38TZhnOJ1341Q",
  authDomain: "construction-app-9c584.firebaseapp.com",
  projectId: "construction-app-9c584",
  storageBucket: "construction-app-9c584.firebasestorage.app",
  messagingSenderId: "851516675108",
  appId: "1:851516675108:web:a41224ec7a9f1d15e2b4b1",
  measurementId: "G-NDP2018TR4",
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export { messaging, app };
