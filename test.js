const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res.send("SERVER IS WORKING");
});

app.listen(3000, "127.0.0.1", () => {
  console.log("🔥 Test server listening on http://127.0.0.1:3000");
});
