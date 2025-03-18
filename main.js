const { MongoClient, ObjectId } = require("mongodb");

let db;
let client;

async function connectTo() {
  client = new MongoClient("mongodb://localhost:27017/");
  await client.connect();
  db = client.db("todoTest");
  if (client) return db;
  else throw new Error("Can't connect");
}
closeConnection = () => {
  client.close();
};

let command = process.argv[2];
let arguments = process.argv.slice(3);
invokeCommand(command, arguments);

async function listTasks() {
  await connectTo();
  await db
    .collection("tasks")
    .find()
    .forEach((element) => {
      printTask(element);
    });
  closeConnection();
}

async function listTask(arg) {
  let id = arg[0];
  if (ObjectId.isValid(id)) {
    await connectTo();
    await db
      .collection("tasks")
      .find({ _id: new ObjectId(id) })
      .forEach((element) => {
        printTask(element);
      });
      closeConnection();
  }
}
async function printTask(task) {
  console.log(
    "Your Task is: " +
      task.stringTask +
      " & It's Status Is: " +
      task.stats +
      " & Task Id: " +
      task._id
  );
}
async function addTask(arg) {
  let task = arg[0];
  let data = {
    stringTask: task,
    stats: "uncompleted",
  };
  await connectTo();
  await db
    .collection("tasks")
    .insertOne(data)
    .then(() => {
      console.log("task added successfully");
    });
  closeConnection();
}
async function updateTaskStats(arg) {
  let id = arg[0];
  let newStats = arg[1];
  if (ObjectId.isValid(id)) {
    console.log("error");
    await connectTo();
    await db
      .collection("tasks")
      .updateOne({ _id: new ObjectId(id) }, { $set: { stats: newStats } })
    console.log("Status Updated Successfully");
      closeConnection();
  }
}
async function updateTaskString(arg) {
  let id = arg[0];
  let newString = arg[1];
  if (ObjectId.isValid(id)) {
    await connectTo();
    await db
      .collection("tasks")
      .updateOne({ _id: new ObjectId(id) }, { $set: { stringTask: newString } })
      .then(() => {
        console.log("Task Updated Successfully");
      });
    closeConnection();
  }
}

async function deleteTask(arg) {
  let id = arg[0];
  if (ObjectId.isValid(id)) {
    await connectTo();
    await db
      .collection("tasks")
      .deleteOne({ _id: new ObjectId(id) })
      .then(() => {
        console.log("Task Deleted Successfully");
      });
    closeConnection();
  }
}
async function deleteAll() {
  await connectTo();
  await db
    .collection("tasks")
    .deleteMany()
    .then(() => {
      console.log("Tasks Were Deleted Successfully");
    });
  closeConnection();
}
function showCommandList() {
  console.log("commands to use:");
  console.log(`
          1- list-tasks
          2- list-task <id>
          3- add-task <task>
          4- update-task-string <new task string>
          5- update-task-stats <stats>
          6- delete-task <id>
          7- delete-all (be careful with that)
          `);
}
function invokeCommand(command, argument) {
  switch (command) {
    case "list-tasks":
      listTasks();
      break;
    case "list-task":
      listTask(argument);
      break;
    case "add-task":
      addTask(argument);
      break;
    case "update-task-string":
      updateTaskString(argument);
      break;
    case "update-task-stats":
      updateTaskStats(argument);
      break;
    case "delete-task":
      deleteTask(argument);
      break;
    case "delete-all":
      deleteAll();
      break;
    default:
      console.log(`Your Command ${command} Isn't Correct`);
      showCommandList();
      break;
  }
}
