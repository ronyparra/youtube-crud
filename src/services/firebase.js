// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCSx6U07GdJHU3dcA7wU2dSUHgsa-JVuxI",
  authDomain: "crud-c3466.firebaseapp.com",
  projectId: "crud-c3466",
  storageBucket: "crud-c3466.appspot.com",
  messagingSenderId: "373551726672",
  appId: "1:373551726672:web:e38c80d02599a42be09155",
  measurementId: "G-MGVF9GQRLM",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// eslint-disable-next-line no-unused-vars
const analytics = getAnalytics(app);

const db = getFirestore(app);

const firebase = {
  async saveVideo(data) {
    const docRef = await addDoc(collection(db, "youtube"), data);
    console.log("Document written with ID: ", docRef.id);
  },
  async getVideos() {
    const data = [];
    const querySnapshot = await getDocs(collection(db, "youtube"));
    querySnapshot.forEach((doc) => {
      data.push({
        id: doc.id,
        ...doc.data(),
      });
    });
    return data;
  },
  async deleteVideo(id) {
    const docRef = doc(db, "youtube", id);
    await deleteDoc(docRef);
  },
};

export { firebase };
