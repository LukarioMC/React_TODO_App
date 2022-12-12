// Required libraries
import express from "express";
import session from "express-session";
import { initializeApp } from "firebase/app";
import { getFirestore, addDoc, collection, getDocs } from "firebase/firestore";
import { parseTodoFromRequest, validateTodoItem } from "./todo.js";

// Firestore database and sessions setup
const firebaseConfig = {
  apiKey: "AIzaSyDYhbL6BhZeMP2tlXvLwUsgpykoSVPwvZ8",
  authDomain: "my-todo-list-edf45.firebaseapp.com",
  projectId: "my-todo-list-edf45",
  storageBucket: "my-todo-list-edf45.appspot.com",
  messagingSenderId: "493323003856",
  appId: "1:493323003856:web:112fd07ca1e9180b1abbd5",
  measurementId: "G-CE56DX8BXM"
};
const firebaseApp = initializeApp(firebaseConfig);
const routing = express();
const db = getFirestore(firebaseApp);
const userCollection = "user";
const todoCollection = "todo";

routing.use(express.json());
routing.use(express.urlencoded({ extended: true }));
routing.use(session(
    {
        secret: "superSecretTodoKey", // TODO: Change later to secure key so sessions cannot be hijacked
        name: "todoSessionID",
        resave: false,
        saveUninitialized: true
    })
);

// Create new TODO List item
routing.post("/newListItem", async function (req, res) {
  let newTodo = parseTodoFromRequest(req);
  
  try {
    validateTodoItem(newTodo);
    // TODO: Replace req.body.user with req.session.user once sessions is setup.
    await addDoc(collection(db, userCollection, req.body.user), newTodo);
    console.log("New TODO item created.");
  } catch (e) {
    console.error("Error creating new TODO item! ", e);
    res.status(500);
    res.send();
  }
  
  res.status(200);
  res.send();
});

// Get the current users todo list items
routing.get("/list", async function (req, res) {
  // TODO: Replace req.body.user with req.session.user once sessions is setup.
  const todoDocs = await getDocs(collection(db, userCollection, req.body.user, todoCollection));
  
  todoDocs.forEach((doc) => {
    console.log(doc.id, " => ", doc.data());
  });
  
  res.status(200);
  res.send();
});


// Run the server on a reasonable port
const port = 8080;
routing.listen(port, function () {
    console.log("Listening on port " + port + "!");
});
