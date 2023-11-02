// Import the 'supertest' library for making HTTP requests
import request from "supertest";

// Import the 'express' framework and 'Express' type
import express, { Express } from "express";

// Import the CandidateRouter
import CandidateRouter from "../../../src/services/candidate/routers/Candidate.router";

// Create a new Express app and mount the CandidateController
const app: Express = express(); // Create a new Express.js application instance
app.use(CandidateRouter); // Mount the CandidateRouter to the Express app

// Define a test suite for CandidateController
describe("CandidateController", () => {
  // Define a test case for the getCandidates method
  it("should respond with 'Hello: getCandidates'", async () => {
    // Send an HTTP GET request to the root ("/") endpoint of the Express app
    const response = await request(app).get("/");
    // Check if the response status is 200 (OK) and if the response body matches the expected value
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ Hello: "getCandidates" });
  });

  // Define a test case for the createCandidate method
  it("should create a candidate and respond with a success message", async () => {
    // Define candidate data to be sent in the HTTP POST request
    const candidateData = {
      name: "John",
      email: "johngd@example.com",
      password: "123Abc@#@",
    };

    // Send an HTTP POST request to the root ("/") endpoint with the candidateData
    const response = await request(app).post("/").send(candidateData);

    // Check if the response status is 201 (Created) and if the response body contains the expected success message
    expect(response.status).toBe(201);
    expect(response.body.message).toEqual("Candidate created successfully");
  });

  // Define a test case for validation errors in createCandidate
  it("should respond with a 400 status and validation error details", async () => {
    // Define invalid candidate data to trigger validation errors
    const invalidCandidateData = {
      name: "John",
      email: "invalid-email",
      password: "123",
    };

    // Send an HTTP POST request with the invalid candidateData
    const response = await request(app).post("/").send(invalidCandidateData);

    // Check if the response status is 400 (Bad Request) and if the response body contains validation error details
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("error");
  });
});
