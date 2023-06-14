const express = require("express");
const mongoose = require("mongoose");
const bodyparser = require("body-parser");
const path = require("path");
const dotenv = require('dotenv')
const cors = require('cors')

const app = express();
dotenv.config();

const loginRoute = require('./routes/loginRoutes')

app.use("/public/images/", express.static("./public/images"));

mongoose
  .connect(process.env.MONGO_URI, {
    useUnifiedTopology: true,
    useNewUrlParser: true
  })
  .then(() => console.log("MongoDb connected.."))
  .catch((err) => console.log(err));

app.use(cors())

//Static folder
app.use(express.static(path.join(__dirname, 'public')))

//BodyParser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//Calling Routes
app.use('/api', loginRoute)

const PORT = process.env.PORT || 3000;

app.listen(PORT, console.log(`Server started on port ${PORT}`));

