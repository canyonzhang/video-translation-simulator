// Provides an integration test that starts the server and uses the client library to ping the /status endpoint in our statusRoute (using Jest and supertest)
const request = require('supertest');
const express = require('express');
const statusRoute = require('../server/routes/status');
const StatusClient = require('../client');

let server; // Store our initialized server object below

// Initialization

// Jest hooks 
beforeAll((done) => {
    // Initialize an express instance to run all the tests
    const app = express();
    // Mount the status route with our status.js handler
    app.use('/status', statusRoute);
    // Start server on localhost port 4000 
    server = app.listen(4000, () => {
        console.log('Test server running on port 4000');
        done(); // Cal done() to signal to Jest that the asynchronous function is complete
        });
    });

afterAll((done) => {
  // Clean up
  server.close(() => {
    console.log('Test server closed');
    done();
  });
});

test('Test waitForCompletion method returns valid response', async () => {
  // Set environment variables
  const DELAY_SECONDS = 2; // wait 2 seconds before changing the status from 'pending' to 'error' or 'completed'
  process.env.DELAY_SECONDS = 2; 

  // Create a new StatusClient instance pointing to the test server (localhost 4000)
  const client = new StatusClient({
    serverUrl: 'http://localhost:4000',
    maxWaitTime: 10,
  });

  const startTime = Date.now();

  // Call the waitForCompletion method
  const response = await client.waitForCompletion();
  const elapsedTime = (Date.now() - startTime) / 1000; // Convert from milliseconds

  expect(['completed', 'error']).toContain(response); // We shouldn't see a pending result added to the result
  expect(elapsedTime).toBeGreaterThanOrEqual(DELAY_SECONDS); // the elapsedTime should be >= DELAY_SECONDS before the status changes
});

test('Test that timeouts are handled gracefully', async () => {
    const DELAY_SECONDS = 5; // Set the delay from changing status to 5 > 2
    process.env.DELAY_SECONDS = DELAY_SECONDS; 
    const client = new StatusClient({
      serverUrl: 'http://localhost:4000',
      maxWaitTime: 2, // Only wait for a max of 2 seconds
    });
    // Make sure that this test throws an error
    await expect(client.waitForCompletion()).rejects.toThrow('Max wait time exceeded');
  });

  test('Test that the server is able to return an "error" response', async () => {
    const DELAY_SECONDS = 1;
    const ERROR_PROBABILITY = 1.0; 
    process.env.DELAY_SECONDS = DELAY_SECONDS;
    process.env.ERROR_PROBABILITY = ERROR_PROBABILITY;
  
    await new Promise((resolve) => setTimeout(resolve, (DELAY_SECONDS + 0.1) * 1000)); // Add a buffer to make sure the status is changed from 'pending' to 'error'
  
    const response = await request(server).get('/status');
    expect(response.status).toBe(200); // We should still receive an OK response
    expect(response.body.result).toBe('error'); 
  });

  test('Test that client is able to handle errors returned from the server', async () => {
    const DELAY_SECONDS = 1;
    const ERROR_PROBABILITY = 1.0; 
    process.env.DELAY_SECONDS = DELAY_SECONDS;
    process.env.ERROR_PROBABILITY = ERROR_PROBABILITY;
  
    const client = new StatusClient({
      serverUrl: 'http://localhost:4000',
      maxWaitTime: 5,
    });
  
    const result = await client.waitForCompletion();
    expect(result).toBe('error');
  });
