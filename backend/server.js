const path = require('path');
const express = require('express');
const colors = require('colors');
const dotenv = require('dotenv').config();
const { errorHandler } = require('./middleware/errorMiddleware');
const connectDB = require('./config/db');
const port = process.env.PORT || 5000;

connectDB();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Manually set CORS headers for all requests
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*'); // Replace '*' with your frontend URL if needed
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  next();
});

// Routes
app.use('/chatluu/users', require('./routes/userRoutes'));

// ------deployment----------
const __dirname1 = path.resolve();
if (process.env.NODE_ENV === "production"){

  app.use(express.static(path.join(__dirname1, "/frontend/build")));

  app.get('*', (req,res) => {
    res.sendFile(path.resolve(__dirname1,"frontend","build","index.html"));
  });
} else {
  app.get ("/", (req,res) => {
    res.send("API is Running Successfully");
  });
}

// Error handler middleware
app.use(errorHandler);

app.listen(port, () => console.log(`Server started on port ${port}`));
