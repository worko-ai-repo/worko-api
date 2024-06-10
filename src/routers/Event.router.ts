// Load the npm packages
import { Router } from "express";

// Load local packages
import EventController from "../controllers/Event.controller";

// Create an instance of the "EventController" class to access its methods/functions
const eventController = new EventController();

// Route to hold the routes (CRUD, etc) related to "Event" table
const EventRouter = Router();

// Create a new event
EventRouter.post("/validate-referral-mscore/:id", eventController.processReferralForEvent);

export default EventRouter;