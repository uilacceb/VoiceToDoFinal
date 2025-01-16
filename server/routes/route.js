const Router = require("express");
const {
  createTask,
  getAllTasks,
  deleteOneTask,
  modifyStatus,
} = require("../controllers/controller.js");
const speechToText = require("../../functions/speechToText.js");

const router = Router();
router.post("/api/tasks", createTask);
router.get("/", getAllTasks);
router.delete("/api/tasks/:id", deleteOneTask);
router.put("/api/tasks/:id", modifyStatus);
router.post('/speech-to-text', speechToText);

module.exports = { router };