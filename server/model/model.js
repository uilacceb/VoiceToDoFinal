const mongoose = require("mongoose");

const toDoSchema = new mongoose.Schema({
  taskName: {
    type: String,
    required: true,
    trim: true,
  },
  completed: {
    type: Boolean,
    required: true,
    default: false,
  },
});


module.exports = mongoose.model('Todo', toDoSchema);

