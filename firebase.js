  import { initializeApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-analytics.js";

  const firebaseConfig = {
    apiKey: "AIzaSyClyfHrBamNnnT2b9oc74Q62dyd5SlHvuY",
    authDomain: "adriano-hair-style.firebaseapp.com",
    projectId: "adriano-hair-style",
    storageBucket: "adriano-hair-style.firebasestorage.app",
    messagingSenderId: "272625418330",
    appId: "1:272625418330:web:a356a9c4abd1ec89f95863",
    measurementId: "G-Y6DFSTVF79"
  };

  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);