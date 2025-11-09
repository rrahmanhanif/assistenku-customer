<script type="module">
  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-analytics.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: "AIzaSyBSL87qkuwSQU8aXvLuu24nV7jUoX2mOSA",
    authDomain: "assistenku-8ef85.firebaseapp.com",
    projectId: "assistenku-8ef85",
    storageBucket: "assistenku-8ef85.firebasestorage.app",
    messagingSenderId: "320243806907",
    appId: "1:320243806907:web:bf36ebdbeb229ebbee2f9e",
    measurementId: "G-ZC89FYK2P6"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);
</script>
