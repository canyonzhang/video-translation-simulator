const express = require('express');
const cors = require('cors');
require('dotenv').config();

const statusRoute = require('./routes/status'); // Initialize the /status router

const app = express(); // Initialize our express instance
const port = process.env.PORT || 3000; 

app.use(cors());
app.use('/status', statusRoute); // Mount the statusRoute handler from server/routes/status.js onto the endpoint '/status'

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
