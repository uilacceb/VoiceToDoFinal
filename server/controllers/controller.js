const Todo = require("../model/model");

//create
const createTask = async (req, res) => {
  const taskName = req.body;
  try {
    const task = await Todo.create(taskName);
    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//get all tasks
const getAllTasks = async (req, res) => {
  try {
    const tasks = await Todo.find({});
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//delete one task
const deleteOneTask = async (req, res) => {
  try {
    const deletedTask = await Todo.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Task deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//modify status
const modifyStatus = async (req, res) => {
  try {
    const updateStatus = await Todo.findByIdAndUpdate(
      req.params.id,
      { completed: req.body.completed },
      { new: true }
    );
    res.status(200).json(updateStatus);
  } catch (error) {
    res.status(500).json({ message: error });
  }
};

module.exports = { createTask, getAllTasks, deleteOneTask, modifyStatus };
