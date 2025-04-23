importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: "AIzaSyAZWXEUkKLWtOiw72BSUf_i4SXWFcjtq4A",
    authDomain: "notificaion-28ffb.firebaseapp.com",
    projectId: "notificaion-28ffb",
    storageBucket: "notificaion-28ffb.firebasestorage.app",
    messagingSenderId: "715037213569",
    appId: "1:715037213569:web:92fd63a45d157d8556de80",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/logo192.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});