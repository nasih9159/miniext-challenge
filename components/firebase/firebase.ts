// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { /* connectFirestoreEmulator, */ getFirestore } from 'firebase/firestore';
import { /* connectStorageEmulator, */ getStorage } from 'firebase/storage';
// import { isDev } from '../isDev';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: 'AIzaSyBdom-Agp18YHWaYv_X4Vjj-qsK-4fc9IU',
    authDomain: 'miniext-challenge-5e5c2.firebaseapp.com',
    projectId: 'miniext-challenge-5e5c2',
    storageBucket: 'miniext-challenge-5e5c2.appspot.com',
    messagingSenderId: '764892411772',
    appId: '1:764892411772:web:48888299f73abfb37056f9',
};

// Initialize Firebase
export const firebaseApp = initializeApp(firebaseConfig);

export const firestore = getFirestore(firebaseApp);
export const baseBucketName = 'FILL_ME_IN';

/* if (isDev) {
    connectFirestoreEmulator(firestore, '127.0.0.1', 8081);
} */
