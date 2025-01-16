const express = require("express");
const connectDB = require("./db");
const dotenv = require("dotenv");
const { router } = require("./server/routes/route.js");
const { speechToText } = require("./functions/speechToText.js");
dotenv.config();

const app = express();

app.use(express.json({ limit: '50mb' }));

// app.use(cors(corsOptions));
app.use(router);


app.get("/", (req, res) => {
  res.send("The Speech-to-text API is up and running");
});

app.listen(3000, () => {
  connectDB();
  console.log("listening on port 3000")
})



module.exports = app;