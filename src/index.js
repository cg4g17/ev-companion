import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import * as serviceWorker from "./serviceWorker";
import * as firebase from "firebase";

var config = {
  apiKey: "AIzaSyC6TUFV14CpFjyiPTzdh9pEcFsLR655nN0",
  authDomain: "companionapp-85c05.firebaseapp.com",
  databaseURL: "https://companionapp-85c05.firebaseio.com",
  projectId: "companionapp-85c05",
  storageBucket: "companionapp-85c05.appspot.com",
  messagingSenderId: "776059195816",
  appId: "1:776059195816:web:6ed48921ab79682e504d9d",
  measurementId: "G-FMNCH29V3V"
};

firebase.initializeApp(config);

ReactDOM.render(<App />, document.getElementById("root"));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
