const express = require("express");
const app = express();

app.get("/hello", (req, res) => {
    res.send("The server is working.");
});

app.listen(3000, () => console.log("Running at http://localhost:3000"));