require("dotenv").config();
const express = require("express");
const blogsRouter = require("./routes/blogs");

const app = express();

app.use(blogsRouter);

app.use((err, req, res, next) => {
  res.status(err.statusCode || 500).json({
    success: false,
    status_message: err.message,
    data: null,
  });
});

app.listen(3000);
