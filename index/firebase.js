const firebaseConfig = {
  aapiKey: "AIzaSyBuSnsFEDEmdTSSMGEuP22OsCpmjsXvVBk",

  authDomain: "adriano-hair-style-60ba7.firebaseapp.com",

  projectId: "adriano-hair-style-60ba7",

  storageBucket: "adriano-hair-style-60ba7.firebasestorage.app",

  messagingSenderId: "555260640841",

  appId: "1:555260640841:web:69acb5bb1ddc2404cfc998"

};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();