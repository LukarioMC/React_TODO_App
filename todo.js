import { Timestamp } from "firebase/firestore";

/**
 * Parses an incoming request into an object representing a standard TODO item.
 * @param { Request } req Incoming request from Client
 * @returns New TODO item object
 */
function parseTodoFromRequest(req) {
  if (req.body == undefined) {
    console.error("Request body was empty! Is JSON parsing enabled in Node server?");
    return {}; // Return empty obj in case of error parsing body.
  }
  let requestData = req.body;
  
  let newTodo = {};
  newTodo.title = requestData.title;
  // Split tags into an array to be stored
  newTodo.tags = requestData.tags instanceof String ? requestData.tags.split(",") : null;
  // Parse due date and verify is valid date format
  newTodo.todoBy = Timestamp.fromDate(new Date(requestData.todoBy));
  
  return newTodo;
}

/**
 * Validates that the provided todo item has the minimum amount of information required to 
 * be input into the database.
 * @param todoItem Todo item to validate
 */
function validateTodoItem(todoItem) {
  let isTitleDefined = todoItem.title != undefined;
  let isTitleString = typeof todoItem.title === 'string' || todoItem.title instanceof String;
  if (isTitleDefined && isTitleString) return;
  throw "Cannot create TODO item without a valid name!";
}

export { parseTodoFromRequest, validateTodoItem };