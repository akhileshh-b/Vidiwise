import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  auth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  googleProvider,
  signInWithPopup,
  updateProfile
} from '../config/firebase';
import { onAuthStateChanged } from 'firebase/auth';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Demo credentials for quick testing
  const DEMO_CREDENTIALS = {
    email: 'demo@vidiwise.com',
    password: 'demo123',
    name: 'Demo User'
  };

  useEffect(() => {
    // Listen to Firebase auth state changes
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // Firebase user is signed in
        const userData = {
          id: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
          photoURL: firebaseUser.photoURL,
          isFirebaseUser: true
        };
        setUser(userData);
        localStorage.setItem('vidiwise_user', JSON.stringify(userData));
      } else {
        // Check if demo user is logged in (from localStorage)
        const savedUser = localStorage.getItem('vidiwise_user');
        if (savedUser) {
          const parsedUser = JSON.parse(savedUser);
          // Only set demo user if it's not a Firebase user
          if (!parsedUser.isFirebaseUser) {
            setUser(parsedUser);
          } else {
            // Clear Firebase user from localStorage if not authenticated
            localStorage.removeItem('vidiwise_user');
            setUser(null);
          }
        } else {
          setUser(null);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    try {
      // Check if it's demo credentials first
      if (email === DEMO_CREDENTIALS.email && password === DEMO_CREDENTIALS.password) {
        const userData = {
          id: 'demo',
          email: DEMO_CREDENTIALS.email,
          name: DEMO_CREDENTIALS.name,
          isDemoUser: true
        };
        setUser(userData);
        localStorage.setItem('vidiwise_user', JSON.stringify(userData));
        return { success: true };
      }

      // Try Firebase authentication
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      const userData = {
        id: firebaseUser.uid,
        email: firebaseUser.email,
        name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
        photoURL: firebaseUser.photoURL,
        isFirebaseUser: true
      };
      
      setUser(userData);
      localStorage.setItem('vidiwise_user', JSON.stringify(userData));
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      let errorMessage = 'Login failed';
      
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many failed attempts. Please try again later';
          break;
        default:
          errorMessage = error.message || 'Login failed';
      }
      
      return { success: false, error: errorMessage };
    }
  };

  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;
      
      const userData = {
        id: firebaseUser.uid,
        email: firebaseUser.email,
        name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
        photoURL: firebaseUser.photoURL,
        isFirebaseUser: true
      };
      
      setUser(userData);
      localStorage.setItem('vidiwise_user', JSON.stringify(userData));
      return { success: true };
    } catch (error) {
      console.error('Google login error:', error);
      let errorMessage = 'Google login failed';
      
      switch (error.code) {
        case 'auth/popup-closed-by-user':
          errorMessage = 'Login cancelled';
          break;
        case 'auth/popup-blocked':
          errorMessage = 'Popup blocked. Please allow popups and try again';
          break;
        default:
          errorMessage = error.message || 'Google login failed';
      }
      
      return { success: false, error: errorMessage };
    }
  };

  const signup = async (name, email, password) => {
    try {
      // Prevent creating account with demo email
      if (email === DEMO_CREDENTIALS.email) {
        return { success: false, error: 'This email is reserved for demo purposes' };
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Update the user's display name
      if (name) {
        await updateProfile(firebaseUser, { displayName: name });
      }
      
      const userData = {
        id: firebaseUser.uid,
        email: firebaseUser.email,
        name: name || firebaseUser.email.split('@')[0],
        photoURL: firebaseUser.photoURL,
        isFirebaseUser: true
      };
      
      setUser(userData);
      localStorage.setItem('vidiwise_user', JSON.stringify(userData));
      return { success: true };
    } catch (error) {
      console.error('Signup error:', error);
      let errorMessage = 'Account creation failed';
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'An account with this email already exists';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password should be at least 6 characters';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address';
          break;
        default:
          errorMessage = error.message || 'Account creation failed';
      }
      
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    try {
      if (user?.isFirebaseUser) {
        await signOut(auth);
      }
      setUser(null);
      localStorage.removeItem('vidiwise_user');
    } catch (error) {
      console.error('Logout error:', error);
      // Force logout even if Firebase signOut fails
      setUser(null);
      localStorage.removeItem('vidiwise_user');
    }
  };

  const forgotPassword = async (email) => {
    try {
      if (email === DEMO_CREDENTIALS.email) {
        // For demo email, just simulate success
        return { success: true };
      }
      
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error) {
      console.error('Password reset error:', error);
      let errorMessage = 'Password reset failed';
      
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address';
          break;
        default:
          errorMessage = error.message || 'Password reset failed';
      }
      
      throw new Error(errorMessage);
    }
  };

  const value = {
    user,
    login,
    loginWithGoogle,
    signup,
    logout,
    forgotPassword,
    loading,
    isDemoUser: user?.isDemoUser || false,
    isFirebaseUser: user?.isFirebaseUser || false
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 