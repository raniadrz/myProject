# ESHOP
pet eshop
One eshop with React Vite and Firebase!



firebase create project
-name project , new account, Add an app to get started (web)
-copy the firebaseConfig and paste it in src/firebase/FirebaseConfig.jsx
-auth,database setup

-npm install firebase


(something like this)
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "Your apiKey",
  authDomain: "your authDomain",
  projectId: "your projectId",
  storageBucket: "your StorageBucket",
  messagingSenderId: "your messagingSenderId",
  appId: "your appId",
  measurementId: "your measurementId"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);


- firebase database setup RULES cody and paste it
Rules firebase




rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    
    // Rules for the "products" collection: Anyone can read, but only authenticated users can write
    match /products/{productId} {
      allow read: if true; // Publicly readable
      allow write: if request.auth != null; // Only authenticated users can write
    }
    
    // Rules for the "comments" collection: Anyone can read, but only authenticated users can write
    match /comments/{commentId} {
      allow read: if true; // Publicly readable
      allow create: if request.auth != null; // Only authenticated users can create
      allow update, delete: if request.auth != null && request.auth.uid == resource.data.userId; // Users can only modify their own comments
    }
    
    // Rules for the "users" collection: Users can only read and write their own profile
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Rules for the "testimonials" collection: Authenticated users can create testimonials
    match /testimonials/{testimonialId} {
      allow read: if true; // Publicly readable
      allow create: if request.auth != null; // Only authenticated users can create
      allow update, delete: if request.auth != null && request.auth.uid == resource.data.userId; // Users can only modify or delete their own testimonials
    }

    // General rule: Only allow authenticated users to read and write their own data
    match /{document=**} {
      allow read, write: if true; // Restrict access by default, no overriding of specific rules
    }
  }
}


####################################################

npm install #to install the dependencies
npm run dev #to start the frontend

# To RUN the frontend 
npm run dev


# Fake data for payment with card
4242 4242 4242 4242
12/34
123
12345


