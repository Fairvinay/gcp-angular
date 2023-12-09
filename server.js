/* eslint-disable @typescript-eslint/no-var-requires */
const express = require("express");
const path = require("path");
const cors = require("cors");
var https = require('https');
const fs = require('fs');
const app = express();

var privateKey  = fs.readFileSync('ssl.key/server.key', 'utf8');
var certificate = fs.readFileSync('ssl.crt/server.crt', 'utf8');
var credentials = {key: privateKey, cert: certificate};
var httpsServer = https.createServer(credentials, app);

app.use(express.static(__dirname + "/dist"));
app.use(cors())

app.get("/*", (_req, res, _next) => {
  res.sendFile(path.join(__dirname + "/dist/index.html"));
});

httpsServer.listen(8000, () => {
  console.log("The Angular HTTP SSL server started on port 8000");
});
//app.listen(process.env.PORT || 8000);
