// Required libraries
import express from "express";
import session from "express-session";
import { initializeApp } from "firebase/app";
import { getFirestore, addDoc, query, limit, doc, getDocs, deleteDoc, updateDoc, collection } from "firebase/firestore";
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

// Creates a new TODO List item
routing.post("/new-todo", async function (req, res) {
  let newTodo = parseTodoFromRequest(req);
  newTodo.completed = false;
  
  try {
    validateTodoItem(newTodo);
    // TODO: Replace req.body.user with req.session.user once sessions is setup.
    await addDoc(collection(db, userCollection, req.body.user, todoCollection), newTodo);
    console.log("[" + new Date().toISOString() + "] User " + req.body.user + " created new TODO item \"" + newTodo.title + "\"");
  } catch (e) {
    console.error("Error creating new TODO item! ", e);
    res.status(500);
    res.send();
  }
  
  res.status(200);
  res.send();
});

// Gets the current users todo items
routing.get("/my-todos", async function (req, res) {
  // TODO: Replace req.body.user with req.session.user once sessions is setup.
  const todoCollectionRef = collection(db, userCollection, req.body.user, todoCollection);
  const todoQuery = query(todoCollectionRef, limit(32))
  const todoDocs = await getDocs(todoQuery);
  let todoList = [];
  
  todoDocs.forEach((todo) => {
    const data = todo.data();
    todoList.push({
      title: data.title,
      completed: data.completed
    });
  });
  
  res.status(200);
  res.send(todoList);
});

// Deletes a todo item from a given ID
routing.post("/delete-todo", (req, res) => {
  const todoItem = doc(db, userCollection, req.body.user, todoCollection, req.body.todoID);
 
  deleteDoc(todoItem)
  .then( () => {
    console.log("[" + new Date().toISOString() + "] User " + req.body.user + " removed todo \"" + req.body.todoID + "\"!");
    res.status(200);
    res.send();
  }).catch( (err) => {
    console.error("Error removing todo item: " + err);
    res.status(500);
    res.send();
  });
});

// Updates a todo item entry
routing.post("/update-todo", (req, res) => {
  const todoItem = doc(db, userCollection, req.body.user, todoCollection, req.body.todoID);
  let newTodoData = parseTodoFromRequest(req);
  updateDoc(todoItem, newTodoData)
  .then( () => {
    console.log("[" + new Date().toISOString() + "] User " + req.body.user + " updated todo item " + req.body.todoID)
    res.status(200);
    res.send();
  }).catch( (err) => {
    console.error("Error updating todo item: " + err);
    res.status(500);
    res.send();
  })
});


// Run the server on a reasonable port
const port = 8080;
routing.listen(port, function () {
    console.log("Listening on port " + port + "!");
});
