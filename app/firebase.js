// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// import { getAnalytics } from "firebase/analytics";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDiqIv2c_ZRs4jJRIEjySVnNWduj1NNXP8",
  authDomain: "inventory-management-a8d36.firebaseapp.com",
  projectId: "inventory-management-a8d36",
  storageBucket: "inventory-management-a8d36.appspot.com",
  messagingSenderId: "282127953660",
  appId: "1:282127953660:web:96f7ee99ba0ff4e4c8f179",
  measurementId: "G-YFPJT0QY03"
};

// Initialize Firebase
// const analytics = getAnalytics(app);
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
const auth = getAuth();
export {firestore, app, auth};
