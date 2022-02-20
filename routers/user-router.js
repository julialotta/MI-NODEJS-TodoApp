const express = require("express");
const { ObjectId } = require("mongodb");
const utils = require("../utils.js");
const db = require("../database");
const router = express.Router();

const USER_COLLECTION = "users";

//GET /assigned tasks
router.get("/assigned", async (req, res) => {
  const users = await db.getUserCollection();
  res.render("users/assigned", { users });
});

//GET /unassigned tasks
router.get("/unassigned", async (req, res) => {
  const users = await db.getUserCollection();
  res.render("users/unassigned", { users });
});

// POST new user
router.post("/new", async (req, res) => {
  const taskId = ObjectId(req.body.task);
  const user = req.body.user;

  const database = await db.getDb();

  database.collection("todos").findOne({ _id: taskId }, async (err, task) => {
    const assignedTask = {
      user,
      task,
    };
    await database.collection(USER_COLLECTION).insertOne(assignedTask);
    res.redirect("/");
  });
});

// GET uncompleted tasks
router.get("/uncompletedtasks", async (req, res) => {
  const todos = await db.getTodoCollection();
  res.render("uncompleted-tasks", { todos });
});

// GET completed tasks
router.get("/completedtasks", async (req, res) => {
  const todos = await db.getTodoCollection();
  res.render("completed-tasks", { todos });
});

// GET tasks sorted by descending
router.get("/descending", async (req, res) => {
  const todos = await db.getTodoCollection();
  todos.sort((a, b) => (a.created > b.created ? 1 : -1));
  res.render("home", { todos });
});

// GET tasks sorted by ascending
router.get("/ascending", async (req, res) => {
  const todos = await db.getTodoCollection();
  todos.sort((a, b) => (a.created > b.created ? -1 : 1));
  res.render("home", { todos });
});

// GET single task
router.get("/task/:id", async (req, res) => {
  const id = ObjectId(req.params.id);
  const database = await db.getDb();
  database.collection(TODOS_COLLECTION).findOne({ _id: id }, (err, task) => {
    res.render("single-task", task);
  });
});

// GET single task edit
router.get("/:id/edit", async (req, res) => {
  const id = ObjectId(req.params.id);
  const database = await db.getDb();
  database.collection(TODOS_COLLECTION).findOne({ _id: id }, (err, task) => {
    res.render("edit", task);
  });
});

// POST single task edit
router.post("/:id/edit", async (req, res) => {
  const id = ObjectId(req.params.id);
  let doneStatus;
  if (req.body.done) {
    doneStatus = true;
  }
  if (!req.body.done) {
    doneStatus = false;
  }
  const newTask = {
    description: req.body.description,
    created: req.body.created.replace("T", " "),
    done: doneStatus,
  };
  if (utils.validateUpdatedTodo(newTask)) {
    const database = await db.getDb();
    database
      .collection(TODOS_COLLECTION)
      .updateOne({ _id: id }, { $set: newTask });
    res.redirect("/");
  } else {
    res.sendStatus(400);
  }
});

//GET single task delete
router.get("/:id/delete", async (req, res) => {
  const id = ObjectId(req.params.id);
  const database = await db.getDb();
  database.collection(TODOS_COLLECTION).findOne({ _id: id }, (err, task) => {
    res.render("delete", task);
  });
});

// POST single task delete
router.post("/:id/delete", async (req, res) => {
  const id = ObjectId(req.params.id);
  const database = await db.getDb();
  database.collection(TODOS_COLLECTION).deleteOne({ _id: id }, (err, task) => {
    res.redirect("/");
  });
});

module.exports = router;
