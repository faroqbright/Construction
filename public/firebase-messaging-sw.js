// public/firebase-messaging-sw.js
importScripts("https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyBZZ7qfoPN3XJpA4F6a2I38TZhnOJ1341Q",
  authDomain: "construction-app-9c584.firebaseapp.com",
  projectId: "construction-app-9c584",
  storageBucket: "construction-app-9c584.firebasestorage.app",
  messagingSenderId: "851516675108",
  appId: "1:851516675108:web:a41224ec7a9f1d15e2b4b1",
  measurementId: "G-NDP2018TR4"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
    icon: '/logo192.png',
  });
});
