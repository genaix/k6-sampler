const express = require("express");  // npm install express
// create config package.json: npm init -y

const PORT = 8080;

const app = express();
app.get("/", (req, resp) => {
    res.send("hello otus 22")
});

app.post("/random", (req, resp) => {
    res.type('text/plain')
    res.send("hello otus 22")
});

app.listen(PORT);
console.log("up server")
