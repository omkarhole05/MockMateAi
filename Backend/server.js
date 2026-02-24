const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const interviewRoutes = require("./routes/interviewRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/interview", interviewRoutes);

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});