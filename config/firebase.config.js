// Import the functions you need from the SDKs you need
const { initializeApp } = require("firebase/app");
const { getAnalytics } = require("firebase/analytics");
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
// exports.firebaseConfig = {
//   apiKey: "AIzaSyBMiuvXxMj3041T-qqEInQIprWFpFadkOE",
//   authDomain: "lostandfound-542af.firebaseapp.com",
//   projectId: "lostandfound-542af",
//   storageBucket: "lostandfound-542af.appspot.com",
//   messagingSenderId: "888143674332",
//   appId: "1:888143674332:web:a1f9e21920f9b57f2e6d19",
//   measurementId: "G-PB1DX16V6V",
// };

exports.firebaseConfig = {
  apiKey: "AIzaSyBw5mBUnp5C52R5YergdtWK7TPGLTYYMv8",
  authDomain: "lost-and-found-f0a3d.firebaseapp.com",
  projectId: "lost-and-found-f0a3d",
  storageBucket: "lost-and-found-f0a3d.appspot.com",
  messagingSenderId: "940042571481",
  appId: "1:940042571481:web:a83651d0c973d0f6f438c8",
  measurementId: "G-273GFY9PYJ",
};

// Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
