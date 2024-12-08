// Client library to ping the server's /status endpoint

const axios = require('axios');

// Define a constructor that takes an options object to set client configurations
class StatusClient {
  constructor(options) {
    this.baseUrl = options.baseUrl;
    this.maxWaitTime = options.maxWaitTime || 60; // Default to 60 seconds
    this.initialInterval = options.initialInterval || 1.0; // Default to 1 second
    this.maxInterval = options.maxInterval || 5.0; // Default to 5 seconds
  }

  async waitForCompletion() {
    let elapsedTime = 0.0;
    let interval = this.initialInterval;

    while (elapsedTime < this.maxWaitTime) {

      try {
        const response = await axios.get(`${this.baseUrl}/status`); // Make a get request to the '/status' endpoint
        const result = response.data.result;
        // Log the response
        console.log(`Status at ${elapsedTime.toFixed(2)}s: ${result}`);
        // Return immediately when we get a completed result or error
        if (result === 'completed' || result === 'error') {
          return result;
        }

        await this.sleep(interval * 1000); // Wait for the client object's specified wait interval (converted from ms)
        elapsedTime += interval;
        // // Increase the interval length to decrease load on server
      } catch (error) {
        console.error(`Request failed: ${error.message}`);
        await this.sleep(interval * 1000);
        elapsedTime += interval;
      }
    }
    throw new Error('Max wait time exceeded'); // If we exit the loop, we exceeded the max wait time
  }

  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

module.exports = StatusClient;
