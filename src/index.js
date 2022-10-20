const express = require("express");
const mongoose = require("mongoose");
const route = require("./route/route");
const multer = require("multer");
const app = express();
app.use(multer().any());

app.use(express.json());


let url =
  "mongodb+srv://tannmayhedau619:Tanmay%40619@cluster0.fw1xhuw.mongodb.net/group63Database";
let port = process.env.PORT || 3000;

mongoose
  .connect(url, { useNewUrlParser: true })
  .then(() => console.log("MongoDb is connected"))
  .catch((err) => console.log(err));

app.use("/", route);

app.use("/*", (req, res) => {
  res.status(400).send({ status: false, error: "Enter proper Url" });
});

app.listen(port, function () {
  console.log("Express app running on port " + port);
});
