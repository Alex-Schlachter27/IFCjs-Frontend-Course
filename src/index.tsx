import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { initializeApp } from "firebase/app";

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDvqWGnVm03Ee8nNRrP8g5W3C2g71TmMW8",
  authDomain: "ifcjs-frontend-myapp.firebaseapp.com",
  projectId: "ifcjs-frontend-myapp",
  storageBucket: "ifcjs-frontend-myapp.appspot.com",
  messagingSenderId: "506092248904",
  appId: "1:506092248904:web:3d68f196a874363548dd7d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
