const express = require("express");
const app = express();
const fs = require("fs");
const cors = require("cors");
const bodyParser = require("body-parser");

app.use(express.json());
app.use(cors());
app.get("/", (req, res, next) => {
  res.send("Welcome");
});

// Increase the body size limit
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

const filePath = __dirname + "/db.json";

app.post("/postdata", (request, response) => {
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      return response.status(500).send("Error reading file");
    }

    let jsonData;
    try {
      jsonData = JSON.parse(data);
    } catch (parseErr) {
      return response.status(500).send("Error parsing JSON data");
    }
    // Add the new user
    jsonData.data.unshift(request.body);

    fs.writeFile(filePath, JSON.stringify(jsonData, null, 2), (writeErr) => {
      if (writeErr) {
        return response.status(500).send("Error writing to file");
      }

      response.status(200).send(jsonData.data);
    });
  });
});

app.listen(4000, () => {
  console.log("server is running...");
});
