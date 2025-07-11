// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile
} from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBkcT4ezryYC2nFkMyxc3dltTd2wPupS2w",
  authDomain: "vidiwise-882da.firebaseapp.com",
  projectId: "vidiwise-882da",
  storageBucket: "vidiwise-882da.firebasestorage.app",
  messagingSenderId: "1098787444447",
  appId: "1:1098787444447:web:e1fcfeb5fa255b6f007b6a",
  measurementId: "G-BS4L2ZKG1Q"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();

export { 
  auth, 
  analytics, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  googleProvider,
  signInWithPopup,
  updateProfile
}; 