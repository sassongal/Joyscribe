// src/firebase.ts
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import 'firebase/compat/storage';
import 'firebase/compat/analytics';

// Your web app's Firebase configuration from your Firebase project console.
const firebaseConfig = {
  apiKey: "AIzaSyDizFDGrzj_1tDgrHnchTnXFofYPi9iNG0",
  authDomain: "joyscribe-445cf.firebaseapp.com",
  projectId: "joyscribe-445cf",
  storageBucket: "joyscribe-445cf.appspot.com",
  messagingSenderId: "323707001682",
  appId: "1:323707001682:web:1c1b7dafb79b0d5c14f88b",
  measurementId: "G-4QX09F5M7T"
};

// Initialize Firebase, but only if it hasn't been initialized yet.
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Get the default app instance
const app = firebase.app();

// Initialize and export Firebase services for use throughout the application
export const db = firebase.firestore();
export const auth = firebase.auth();
export const storage = firebase.storage();
export const analytics = firebase.analytics();

export default app;
