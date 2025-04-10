import {
  GoogleAuthProvider,
  GithubAuthProvider,
  setPersistence,
  browserSessionPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import { firebaseAuth } from './firebaseConfig.ts';

const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();

// Sign in with Google functionality
export const signInWithGoogle = async () => {
  try {
    return setPersistence(firebaseAuth, browserSessionPersistence).then(async () => {
      const result = await signInWithPopup(firebaseAuth, googleProvider);
      return {
        success: true,
        user: result.user,
        error: null,
      };
    });
  } catch (error: any) {
    return {
      success: false,
      user: null,
      error: error.message,
    };
  }
};

// Sign in with GitHub functionality
export const signInWithGithub = async () => {
  try {
    return setPersistence(firebaseAuth, browserSessionPersistence).then(async () => {
      const result = await signInWithPopup(firebaseAuth, githubProvider);
      return {
        success: true,
        user: result.user,
        error: null,
      };
    });
  } catch (error: any) {
    return {
      success: false,
      user: null,
      error: error.message,
    };
  }
};

// Sign in with email and password
export async function signInWithCredentials(email: string, password: string) {
  try {
    return setPersistence(firebaseAuth, browserSessionPersistence).then(async () => {
      const userCredential = await signInWithEmailAndPassword(firebaseAuth, email, password);
      return {
        success: true,
        user: userCredential.user,
        error: null,
      };
    });
  } catch (error: any) {
    return {
      success: false,
      user: null,
      error: error.message || 'Failed to sign in with email/password',
    };
  }
}

export async function signUp (email: string, password: string)  {
  try {
    const userCredential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
    const user = userCredential.user;
    // Handle successful signup (e.g., redirect, store user data)
    console.log("User created:", user);
    return {
      success: true,
      user: user,
      error: null,
    };
  } catch (error: any) {
    return {
      success: false,
      user: null,
      error: error.message || 'Failed to sign in with email/password',
    };
  }
};

// Sign out functionality
export const firebaseSignOut = async () => {
  try {
    await signOut(firebaseAuth);
    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
    };
  }
};

// Auth state observer
export const onAuthStateChanged = (callback: (user: any) => void) => {
  return firebaseAuth.onAuthStateChanged(callback);
};