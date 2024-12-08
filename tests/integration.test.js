// Provides an integration test that starts the server and uses the client library to ping the /status endpoint in our statusRoute (using Jest)
const request = require('supertest');
const express = require('express');
const statusRoute = require('../server/routes/status');
const StatusClient = require('../client');

jest.setTimeout(20000); 

let server; // Store our initialized server object below

const { router, resetServerState } = require('../server/routes/status');

// Setup hooks 
beforeAll((done) => {
  const app = express();
  app.use('/status', router); // Mount the router
  server = app.listen(4000, done); // Start the server on port 4000
});

beforeEach(() => {
  resetServerState(); // Reset server state for a clean slate before each test
});

afterAll((done) => {
  server.close(done); // Close the server after all tests are done
});

test('Test waitForCompletion method returns valid response', async () => {
  // Set environment variables
  process.env.DELAY_SECONDS = '2';
  process.env.ERROR_PROBABILITY = '0.1';

  // Create a new StatusClient instance pointing to the test server (localhost 4000)
  const client = new StatusClient({
    baseUrl: 'http://localhost:4000',
    maxWaitTime: 10,
  });

  const startTime = Date.now();

  // Call the waitForCompletion method
  const response = await client.waitForCompletion();
  const elapsedTime = (Date.now() - startTime) / 1000; // Convert from milliseconds

  expect(['completed', 'error']).toContain(response); // We shouldn't see a pending result added to the result
  expect(elapsedTime).toBeGreaterThanOrEqual(2); // The elapsedTime should be >= DELAY_SECONDS before the status changes

}, 10000); // Increase wait time to 10 seconds (from default of 5 seconds for Jest)

test('Test that timeouts are handled gracefully', async () => {
    process.env.DELAY_SECONDS = '5';
    process.env.ERROR_PROBABILITY = '0.1';
    const client = new StatusClient({
      baseUrl: 'http://localhost:4000',
      maxWaitTime: 2, // Only wait for a max of 2 seconds
    });
    // Make sure that this test throws an error
    await expect(client.waitForCompletion()).rejects.toThrow('Max wait time exceeded');

  }, 10000);

  test('Test that the server is able to return an "error" response', async () => {
    process.env.DELAY_SECONDS = '1';
    process.env.ERROR_PROBABILITY = '1.0';
  
    await new Promise((resolve) => setTimeout(resolve, (process.env.DELAY_SECONDS + 0.1) * 1000)); // Add a buffer to make sure the status is changed from 'pending' to 'error'
  
    const response = await request(server).get('/status');
    expect(response.status).toBe(200); // We should still receive an OK response
    expect(response.body.result).toBe('error'); 

  }, 15000);

  test('Test that client is able to handle errors returned from the server', async () => {
    process.env.DELAY_SECONDS = '1';
    process.env.ERROR_PROBABILITY = '1.0'; // Make sure we recieve an error from the server
  
    const client = new StatusClient({
      baseUrl: 'http://localhost:4000',
      maxWaitTime: 5,
    });
  
    const result = await client.waitForCompletion();
    expect(result).toBe('error');
  });
