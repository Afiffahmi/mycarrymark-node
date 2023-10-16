// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from 'firebase/firestore';


// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB-8g2U6ww4vwzUO_ymeC_do8utk3zEM0c",
  authDomain: "mycarrymark.firebaseapp.com",
  projectId: "mycarrymark",
  storageBucket: "mycarrymark.appspot.com",
  messagingSenderId: "931718460358",
  appId: "1:931718460358:web:9cbde8b984c8105602b8c7"
};

// Initialize Firebase
const apps = initializeApp(firebaseConfig);
const db = getFirestore(apps);

export { db } ;