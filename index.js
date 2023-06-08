const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require("cookie-parser");
require('./config/mongoose');

const expressEjsLayout = require("express-ejs-layouts");

const app = express();
app.use(bodyParser.json());


app.use(express.urlencoded()); // help in making  POST Api calls
app.use(cookieParser()); // help in putting cookeis to req and taking from
app.use(expressEjsLayout);

app.set("view engine", "ejs");
app.set("views", "./views");

app.use(express.static("./assets"));


app.set("layout extractStyles", true);
app.set("layout extractScripts", true);

// routers
app.use("/", require("./controllers/seller"));

app.listen(3000, (err) => {
  if (err) {
    console.log("Error in Server Runing", err);
    return;
  }
  console.log('Server started on port 3000');
});
