// status endpoint
const express = require('express');
const router = express.Router(); 

let startTime = new Date();
let status = 'pending';

// Reset function for testing
function resetServerState() {
    startTime = new Date();
    status = 'pending';
  }

// Define an endpoint to handle all get requests at /status
router.get('/', (req, res) => {
  const currentTime = new Date();
  const elapsedTime = (currentTime - startTime) / 1000;
  const DELAY_SECONDS = parseInt(process.env.DELAY_SECONDS, 10) || 10; // Default to 10 second timeout
  const ERROR_PROBABILITY = parseFloat(process.env.ERROR_PROBABILITY) || 0.1; // Default to a 10% probability of failing
  if (status === 'pending' && elapsedTime >= DELAY_SECONDS) {
    status = Math.random() > ERROR_PROBABILITY ? 'completed' : 'error';
  }
  res.json({ result: status });
});

module.exports = { router, resetServerState };
