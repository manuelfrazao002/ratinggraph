// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCC8tWmczr-L_vFXwsiyApUsIEh1FyQp-M",
  authDomain: "backendratingapp.firebaseapp.com",
  projectId: "backendratingapp",
  storageBucket: "backendratingapp.firebasestorage.app",
  messagingSenderId: "1065152244064",
  appId: "1:1065152244064:web:264459bffb90a066731605",
  measurementId: "G-7H2FWCMZ98"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);