import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { 
  initializeFirestore, 
  getFirestore, 
  setLogLevel, 
  memoryLocalCache, 
  persistentLocalCache, 
  persistentMultipleTabManager 
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Suppress transient offline reconnection log noise so it does not trigger false alarms in console
try {
  setLogLevel('silent');
} catch {
  // ignore
}

// Initialize Firestore with exact databaseId and reliable auto-detect long polling for cloud sandboxes
const rawConfig = firebaseConfig as Record<string, any>;
const databaseId = rawConfig.firestoreDatabaseId && rawConfig.firestoreDatabaseId !== '(default)'
  ? rawConfig.firestoreDatabaseId
  : undefined;

let firestoreInstance;
try {
  firestoreInstance = initializeFirestore(
    app,
    {
      experimentalAutoDetectLongPolling: true,
      ignoreUndefinedProperties: true,
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager(),
      }),
    },
    databaseId
  );
} catch {
  try {
    firestoreInstance = initializeFirestore(
      app,
      {
        experimentalAutoDetectLongPolling: true,
        ignoreUndefinedProperties: true,
        localCache: memoryLocalCache(),
      },
      databaseId
    );
  } catch {
    try {
      firestoreInstance = databaseId
        ? getFirestore(app, databaseId)
        : getFirestore(app);
    } catch {
      firestoreInstance = getFirestore(app);
    }
  }
}

export const db = firestoreInstance;

export default app;
