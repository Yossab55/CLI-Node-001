const { MongoClient, ObjectId } = require("mongodb");

const DB_URI = "mongodb://localhost:27017/";
const DB_NAME = "todoTest";

let db;
let client;

// ✅ Centralized database connection function
async function connectToDB() {
  if (!client) {
    client = new MongoClient(DB_URI);
    await client.connect();
    db = client.db(DB_NAME);
  }
  return db;
}

// ✅ Properly close the connection
async function closeConnection() {
  if (client) {
    await client.close();
    client = null;
    db = null;
  }
}

// ✅ Utility function for ObjectId validation
function validateObjectId(id) {
  if (!ObjectId.isValid(id)) {
    console.log(`❌ Invalid ObjectId: ${id}`);
    return false;
  }
  return true;
}

// ✅ Reusable print function
function printTask(task) {
  console.log(
    `📝 Task: ${task.stringTask} | 📌 Status: ${task.stats} | 🆔 ID: ${task._id}`
  );
}

// ✅ List all tasks
async function listTasks() {
  const db = await connectToDB();
  const tasks = await db.collection("tasks").find().toArray();
  if (tasks.length === 0) {
    console.log("📭 No tasks found.");
  } else {
    tasks.forEach(printTask);
  }
  await closeConnection();
}

// ✅ Get a specific task
async function listTask([id]) {
  if (!validateObjectId(id)) return;
  const db = await connectToDB();
  const task = await db.collection("tasks").findOne({ _id: new ObjectId(id) });

  if (!task) console.log("❌ Task not found.");
  else printTask(task);

  await closeConnection();
}

// ✅ Add a new task
async function addTask([task]) {
  if (!task) {
    console.log("❌ Task description is required.");
    return;
  }

  const db = await connectToDB();
  await db
    .collection("tasks")
    .insertOne({ stringTask: task, stats: "uncompleted" });
  console.log("✅ Task added successfully!");
  await closeConnection();
}

// ✅ Update a task's status
async function updateTaskStats([id, newStats]) {
  if (!validateObjectId(id)) return;

  const db = await connectToDB();
  const result = await db
    .collection("tasks")
    .updateOne({ _id: new ObjectId(id) }, { $set: { stats: newStats } });

  console.log(
    result.matchedCount
      ? "✅ Status updated successfully!"
      : "❌ Task not found."
  );
  await closeConnection();
}

// ✅ Update a task's description
async function updateTaskString([id, newString]) {
  if (!validateObjectId(id)) return;

  const db = await connectToDB();
  const result = await db
    .collection("tasks")
    .updateOne({ _id: new ObjectId(id) }, { $set: { stringTask: newString } });

  console.log(
    result.matchedCount ? "✅ Task updated successfully!" : "❌ Task not found."
  );
  await closeConnection();
}

// ✅ Delete a specific task
async function deleteTask([id]) {
  if (!validateObjectId(id)) return;

  const db = await connectToDB();
  const result = await db
    .collection("tasks")
    .deleteOne({ _id: new ObjectId(id) });

  console.log(
    result.deletedCount ? "🗑 Task deleted successfully!" : "❌ Task not found."
  );
  await closeConnection();
}

// ✅ Delete all tasks
async function deleteAll() {
  const db = await connectToDB();
  const result = await db.collection("tasks").deleteMany();
  console.log(`🗑 Deleted ${result.deletedCount} task(s) successfully!`);
  await closeConnection();
}

// ✅ Command List
function showCommandList() {
  console.log(`
🚀 Available Commands:
  1️⃣  list-tasks
  2️⃣  list-task <id>
  3️⃣  add-task <task>
  4️⃣  update-task-string <id> <new task>
  5️⃣  update-task-stats <id> <new status>
  6️⃣  delete-task <id>
  7️⃣  delete-all
  `);
}

// ✅ Handle command execution
async function invokeCommand(command, args) {
  switch (command) {
    case "list-tasks":
      await listTasks();
      break;
    case "list-task":
      await listTask(args);
      break;
    case "add-task":
      await addTask(args);
      break;
    case "update-task-string":
      await updateTaskString(args);
      break;
    case "update-task-stats":
      await updateTaskStats(args);
      break;
    case "delete-task":
      await deleteTask(args);
      break;
    case "delete-all":
      await deleteAll();
      break;
    default:
      console.log(`❌ Unknown command: ${command}`);
      showCommandList();
  }
}

// ✅ Execute command from CLI
const command = process.argv[2];
const args = process.argv.slice(3);
invokeCommand(command, args);
